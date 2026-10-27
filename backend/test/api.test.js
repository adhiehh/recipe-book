import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from '../app.js';
import {validateRecipe} from '../validation.js';
const valid={name:'Pasta',category:'Dinner',ingredients:'200g pasta',steps:'Boil and serve',cookingTime:20};
test('reject empty, whitespace, negative, fractional and invalid category values',()=>{
 for(const change of [{name:' '},{ingredients:''},{steps:null},{cookingTime:-1},{cookingTime:1.5},{cookingTime:''},{category:'Other'}])assert.ok(validateRecipe({...valid,...change}).errors.length);
 assert.equal(validateRecipe({...valid,cookingTime:0}).errors.length,0);
});
test('HTTP create, list, details, edit, delete and validation contracts',async()=>{
 // In-memory test double isolates HTTP behavior; does not claim Atlas integration.
 const rows=new Map();const id='123456789012345678901234';
 const model={find:()=>({sort:async()=>[...rows.values()]}),create:async data=>{const r={...data,_id:id};rows.set(id,r);return r;},findById:async id=>rows.get(id),findByIdAndUpdate:async(id,data)=>{if(!rows.has(id))return null;const r={...data,_id:id};rows.set(id,r);return r;},findByIdAndDelete:async id=>{const r=rows.get(id);rows.delete(id);return r;}};
 const server=createApp(model).listen(0);await new Promise(resolve=>server.once('listening',resolve));
 const url=`http://127.0.0.1:${server.address().port}/api/recipes`;
 const request=(path='',method='GET',body)=>fetch(url+path,{method,headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 try{
 assert.equal((await request('','POST',{...valid,cookingTime:-1})).status,400);
 assert.equal((await request('','POST',valid)).status,201);
 assert.equal((await (await request()).json()).length,1);
 assert.equal((await (await request('/'+id)).json()).name,'Pasta');
 assert.equal((await (await request('/'+id,'PUT',{...valid,name:'New pasta'})).json()).name,'New pasta');
 assert.equal((await request('/bad')).status,400);
 assert.equal((await request('/'+id,'DELETE')).status,200);
 assert.equal((await request('/'+id)).status,404);
 assert.equal((await (await request()).json()).length,0);
 }finally{await new Promise(resolve=>server.close(resolve));}
});
