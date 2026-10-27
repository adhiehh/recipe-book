# Recipe Book — MERN assessment project

A responsive personal recipe collection built with MongoDB, Express, React and Node.js. All recipe operations use the REST API and MongoDB; there is no localStorage or mock-data fallback in the app.

## Start here

1. Install Node.js 22 LTS or newer on your computer (or use an online Node.js workspace).
2. Extract this ZIP. Open a terminal inside the `recipe-book` folder containing the root `package.json`.
3. Run `npm install` once from that folder. npm workspaces install both frontend and backend dependencies.
4. Configure the MongoDB Atlas connection described below in `backend/.env`.
5. Run `npm run dev`. Keep the terminal running.
6. Open `http://localhost:5173`. The API runs at `http://localhost:5000`.

```sh
npm install
npm run dev
```

The project WILL NOT connect until you replace the placeholder MongoDB URI. No database account or GitHub repository has been created for you.

## MongoDB Atlas configuration

Create a disposable exam database deployment in your own MongoDB Atlas account. Create a database user with read/write access to the `recipe_book` database. Allow the IP address of the machine running your backend through Atlas network access. Choose the Node.js driver connection string and replace `backend/.env`'s MONGODB_URI with it. Include `/recipe_book` before the query string. Replace the username/password placeholders; URL-encode special characters in the password. Never use your Atlas account login password as the database-user password.

Example ONLY (not functional):

```dotenv
MONGODB_URI=mongodb+srv://EXAM_USER:EXAM_PASSWORD@YOUR_CLUSTER.mongodb.net/recipe_book?retryWrites=true&w=majority
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
```

The backend prints a success message only after MongoDB connects. The frontend shows a retryable error if the API cannot be reached. MongoDB creates the collection when you save your first recipe.

Your assessment explicitly asks for a committed `.env` using test/dummy credentials. This ZIP includes placeholder `.env` files, and `.gitignore` intentionally does not exclude them. Place only disposable exam credentials there if following that submission requirement; never put personal or production credentials in a public repository. Give evaluators database network access through the method agreed with your instructor. Remove/rotate the exam credentials after evaluation.

## Features

- Add recipes: name, category, ingredients, preparation steps and cooking time.
- Required fields, trimmed text, length limits and integer cooking time validation on frontend and backend. Zero minutes is valid; negative values are rejected.
- Saved recipe cards with category and time.
- Full details loaded by ID into an accessible native dialog.
- Prefilled edit form, database updates and immediate UI refresh.
- Delete confirmation, database deletion and immediate UI refresh.
- Name search and category filters.
- Loading, empty, error and success states.
- Responsive layout and keyboard-accessible dialogs.

## Production build / run

```sh
npm run build
npm start
```

Then open `http://localhost:5000`. Express serves the compiled React frontend and API on the same origin. The default `/api` frontend configuration supports this without changes. Hosting needs a Node.js service with MongoDB Atlas access; GitHub Pages alone cannot run this backend. Set MONGODB_URI through the host's environment settings for hosted deployment. Root build command: `npm install && npm run build`; start command: `npm start`. No public deployment is included.

If hosting frontend separately, set `frontend/.env` VITE_API_URL to the full backend URL ending in `/api`, rebuild, and set CLIENT_ORIGIN to the frontend origin. Never put database credentials in VITE_ variables: those are public browser code.

## REST API

| Method | Path | Purpose |
|---|---|---|
| GET | /api/recipes | List all recipes, newest first |
| GET | /api/recipes/:id | Full recipe details |
| POST | /api/recipes | Create a recipe |
| PUT | /api/recipes/:id | Update all recipe fields |
| DELETE | /api/recipes/:id | Delete a recipe |
| GET | /api/health | Database readiness (200 or 503) |

POST and PUT accept this JSON:

```json
{"name":"Tomato pasta","category":"Dinner","ingredients":"200g pasta\n2 tomatoes","steps":"Boil pasta\nCook tomatoes\nCombine and serve","cookingTime":20}
```

Categories: Breakfast, Lunch, Dinner, Snack, Dessert. Cooking time: integer 0–10080 minutes. Errors use `{ "message": "..." }` and appropriate HTTP status codes.

## Testing before submission

```sh
npm test
npm run build
```

Automated tests cover validation and HTTP CRUD behavior using an injected in-memory test double. They do NOT establish connectivity to your Atlas database. For the required real integration check:

1. Start with your configured Atlas database.
2. Add a recipe; verify the success message and card.
3. Refresh the browser; ensure it remains (database persistence).
4. Open the card; check ingredients and steps.
5. Edit each field, save, and refresh to confirm persistence.
6. Cancel deletion once; confirm the recipe stays. Confirm deletion and refresh; confirm it is gone.
7. Try blank fields and negative cooking time; submission must be blocked.
8. Inspect at a narrow mobile width and desktop width.
9. Clone your GitHub repository into a fresh folder, run `npm install`, then `npm run dev`.

## Submit to GitHub

Create an empty GitHub repository, then from the extracted project folder:

```sh
git init
git add .
git commit -m "Build MERN recipe book"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/recipe-book.git
git push -u origin main
```

Replace YOUR_USERNAME and the repository name. Submit the repository URL, not the ZIP link. Make the repository public or grant evaluator access. Confirm GitHub shows both `frontend` and `backend`, their package.json files, the root package-lock.json and the required exam `.env` files. Do not upload node_modules. Follow the assessment's 12:30 PM deadline in its applicable local time.

## Folder guide / viva notes

- frontend/src/main.jsx: React UI, forms, filters, dialogs and fetch calls.
- frontend/src/style.css: responsive visual styling.
- backend/server.js: environment setup, MongoDB connection and server startup.
- backend/app.js: Mongoose recipe schema and Express REST routes.
- backend/validation.js: shared server-side input validation rules.
- backend/test/api.test.js: validation and isolated HTTP tests.

React collects inputs → fetch sends JSON → Express validates → Mongoose saves to Atlas → API returns saved record → React updates state and redraws cards. useState stores UI state; useEffect loads recipes at startup. POST creates, GET reads, PUT updates and DELETE removes. Mongoose is the object modelling library; MongoDB Atlas hosts the database.

This assessment app has no login system: anyone who can reach the API can access its shared recipes. Use it with exam/sample data. Decorative recipe artwork is CSS/text; Google Fonts are optional and fall back to system fonts.
