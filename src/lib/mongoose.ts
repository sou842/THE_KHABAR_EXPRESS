// lib/mongoose.ts
import mongoose from 'mongoose';

// Import all models here to ensure they are registered with Mongoose
// This prevents "Schema hasn't been registered" errors in Next.js
import '@/models/user.model';
import '@/models/blog.model';
import '@/models/category.model';
import '@/models/vault.model';
import '@/models/report.model';
import '@/models/contact.model';
import '@/models/contributor.model';
import '@/models/tasklist.model';
import '@/models/blogChunk.model';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-app';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

declare global {
  var mongoose: { conn: any | null; promise: Promise<any> | null };
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;