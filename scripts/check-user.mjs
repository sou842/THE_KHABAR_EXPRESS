import 'dotenv/config'; // Loads .env by default
import path from 'path';
import { fileURLToPath } from 'url';
import dbConnect from '../src/lib/mongoose.js';
import mongoose from 'mongoose';

// Load .env.local specifically if it exists
import { config } from 'dotenv';
config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkUser(idOrHandle) {
  try {
    console.log('Connecting to database...');
    await dbConnect();
    
    // Ensure we have a db instance
    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database not connected. Check your MONGODB_URI.');
    }

    const collection = db.collection('users');
    
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(idOrHandle);
    const query = isObjectId 
      ? { _id: new mongoose.Types.ObjectId(idOrHandle) }
      : { username: idOrHandle };
      
    console.log(`Searching for user with ${isObjectId ? 'ID' : 'username'}: ${idOrHandle}`);
    const user = await collection.findOne(query);
    
    if (user) {
      console.log('USER FOUND:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('USER NOT FOUND.');
    }
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

const handle = process.argv[2];
if (!handle) {
  console.error('Usage: node scripts/check-user.mjs <handle_or_id>');
  process.exit(1);
}

checkUser(handle);
