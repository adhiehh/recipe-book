import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {existsSync} from 'node:fs';
import {categories, validateRecipe} from './validation.js';
const schema = new mongoose.Schema({
  name:{type:String, required:true, trim:true, maxlength:120},
  category:{type:String, required:true, enum:categories},
  ingredients:{type:String, required:true, trim:true, maxlength:10000},
  steps:{type:String, required:true, trim:true, maxlength:20000},
  cookingTime:{type:Number, required:true, min:0, max:10080, validate:Number.isInteger}
}, {timestamps:true});
export const Recipe = mongoose.model('Recipe', schema);
export function createApp(Model = Recipe) {
  const app=express();
  app.disable('x-powered-by');
  app.use(cors({origin:process.env.CLIENT_ORIGIN || 'http://localhost:5173'}));
  app.use(express.json({limit:'100kb'}));
  const run=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
  app.get('/api/health', (req,res)=>res.status(mongoose.connection.readyState===1?200:503).json({database:mongoose.connection.readyState===1?'connected':'disconnected'}));
  app.param('id',(req,res,next)=>mongoose.isObjectIdOrHexString(req.params.id)?next():res.status(400).json({message:'Invalid recipe ID.'}));
  app.get('/api/recipes',run(async(req,res)=>res.json(await Model.find().sort({createdAt:-1}))));
  app.get('/api/recipes/:id',run(async(req,res)=>{const recipe=await Model.findById(req.params.id);if(!recipe)return res.status(404).json({message:'Recipe not found.'});res.json(recipe);}));
  const validate=(req,res,next)=>{const {errors,data}=validateRecipe(req.body);if(errors.length)return res.status(400).json({message:errors.join(' ')});req.recipeData=data;next();};
  app.post('/api/recipes',validate,run(async(req,res)=>res.status(201).json(await Model.create(req.recipeData))));
  app.put('/api/recipes/:id',validate,run(async(req,res)=>{const recipe=await Model.findByIdAndUpdate(req.params.id,req.recipeData,{new:true,runValidators:true});if(!recipe)return res.status(404).json({message:'Recipe not found.'});res.json(recipe);}));
  app.delete('/api/recipes/:id',run(async(req,res)=>{const recipe=await Model.findByIdAndDelete(req.params.id);if(!recipe)return res.status(404).json({message:'Recipe not found.'});res.json({message:'Recipe deleted.'});}));
  app.use('/api',(req,res)=>res.status(404).json({message:'API route not found.'}));
  const dist=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../frontend/dist');
  if(existsSync(dist)){app.use(express.static(dist));app.get('*',(req,res)=>res.sendFile(path.join(dist,'index.html')));}
  app.use((err,req,res,next)=>{
    if(err.type==='entity.parse.failed')return res.status(400).json({message:'Invalid JSON body.'});
    if(err.type==='entity.too.large')return res.status(413).json({message:'Request is too large.'});
    if(err.name==='ValidationError')return res.status(400).json({message:'Recipe validation failed.'});
    res.status(500).json({message:'Unable to complete the request. Please try again.'});
  });
  return app;
}
