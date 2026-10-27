import dotenv from 'dotenv';
import {fileURLToPath} from 'node:url';
import mongoose from 'mongoose';
import {createApp} from './app.js';
dotenv.config({path:fileURLToPath(new URL('.env',import.meta.url))});
const uri=process.env.MONGODB_URI;
if(!uri || uri.includes('YOUR_CLUSTER')){
 console.error('Set MONGODB_URI in backend/.env to your exam MongoDB Atlas connection string.');process.exit(1);
}
try {
 await mongoose.connect(uri,{serverSelectionTimeoutMS:10000});
 const server=createApp().listen(process.env.PORT || 5000,()=>console.log(`Recipe Book running on port ${process.env.PORT || 5000}; MongoDB connected.`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await mongoose.disconnect();process.exit(0);}));
} catch(error){console.error('MongoDB connection failed. Check your Atlas URI, database user and network access.');process.exit(1);}
