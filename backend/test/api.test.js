import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../app.js';
import { validateRecipe } from '../validation.js';

const mockValidRecipe = {
  name: 'Mediterranean Salad',
  category: 'Lunch',
  ingredients: 'Cucumbers\nTomatoes\nOlives\nFeta cheese\nOlive oil',
  steps: 'Chop vegetables.\nToss together with olive oil and crumbled feta.\nSeason with salt and oregano.',
  cookingTime: 15
};

test('Recipe Payload Validation: Rejects missing, invalid types, negative times, or disallowed categories', () => {
  const invalidCases = [
    { name: '   ' },
    { ingredients: '' },
    { steps: null },
    { cookingTime: -5 },
    { cookingTime: 2.5 },
    { cookingTime: '' },
    { category: 'Beverage' }
  ];

  for (const patch of invalidCases) {
    const outcome = validateRecipe({ ...mockValidRecipe, ...patch });
    assert.ok(outcome.errors.length > 0, `Expected errors for patch: ${JSON.stringify(patch)}`);
  }

  // Cooking time of 0 minutes should be valid (e.g. no-cook salad)
  const zeroTimeOutcome = validateRecipe({ ...mockValidRecipe, cookingTime: 0 });
  assert.equal(zeroTimeOutcome.errors.length, 0);
});

test('HTTP CRUD Operations Contract Verification', async () => {
  const inMemoryStore = new Map();
  const testId = '654321098765432109876543';

  // Mock Model to test REST API routes without needing an active Atlas database connection
  const mockModel = {
    find: () => ({
      sort: async () => [...inMemoryStore.values()]
    }),
    create: async (docData) => {
      const record = { ...docData, _id: testId };
      inMemoryStore.set(testId, record);
      return record;
    },
    findById: async (id) => inMemoryStore.get(id),
    findByIdAndUpdate: async (id, updateData) => {
      if (!inMemoryStore.has(id)) return null;
      const updatedRecord = { ...updateData, _id: testId };
      inMemoryStore.set(testId, updatedRecord);
      return updatedRecord;
    },
    findByIdAndDelete: async (id) => {
      const existing = inMemoryStore.get(id);
      inMemoryStore.delete(id);
      return existing;
    }
  };

  const app = createApp(mockModel);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  const endpointUrl = `http://127.0.0.1:${server.address().port}/api/recipes`;
  const sendRequest = (path = '', method = 'GET', bodyData = null) =>
    fetch(`${endpointUrl}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      ...(bodyData ? { body: JSON.stringify(bodyData) } : {})
    });

  try {
    // 1. Validation rejection on POST
    const badPostRes = await sendRequest('', 'POST', { ...mockValidRecipe, cookingTime: -10 });
    assert.equal(badPostRes.status, 400);

    // 2. Successful creation
    const goodPostRes = await sendRequest('', 'POST', mockValidRecipe);
    assert.equal(goodPostRes.status, 201);

    // 3. List recipes
    const listRes = await sendRequest();
    const listData = await listRes.json();
    assert.equal(listData.length, 1);

    // 4. Retrieve single recipe by ID
    const singleRes = await sendRequest(`/${testId}`);
    const singleData = await singleRes.json();
    assert.equal(singleData.name, 'Mediterranean Salad');

    // 5. Update recipe
    const updateRes = await sendRequest(`/${testId}`, 'PUT', { ...mockValidRecipe, name: 'Greek Salad' });
    const updateData = await updateRes.json();
    assert.equal(updateData.name, 'Greek Salad');

    // 6. Invalid ObjectId parameter check
    const invalidIdRes = await sendRequest('/not-a-valid-id');
    assert.equal(invalidIdRes.status, 400);

    // 7. Delete recipe
    const deleteRes = await sendRequest(`/${testId}`, 'DELETE');
    assert.equal(deleteRes.status, 200);

    // 8. Recipe should now return 404
    const notFoundRes = await sendRequest(`/${testId}`);
    assert.equal(notFoundRes.status, 404);

    // 9. Recipe list should now be empty
    const emptyListRes = await sendRequest();
    const emptyListData = await emptyListRes.json();
    assert.equal(emptyListData.length, 0);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
