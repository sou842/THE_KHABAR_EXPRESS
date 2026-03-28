const mongoose = require('mongoose');
require('dotenv').config();

// Define Schema for fallback (if models are not reachable easily via JS)
const BlogSchema = new mongoose.Schema({
  translations: {
    type: Map,
    of: Object,
    default: {}
  }
}, { strict: false });

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);

async function clearTranslations() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB...");

    // Clear the translations field
    const result = await Blog.updateMany(
      {},
      { $set: { translations: {} } }
    );

    console.log(`Successfully cleared translations for ${result.modifiedCount} blogs.`);
    process.exit(0);
  } catch (error) {
    console.error("Error clearing translations:", error);
    process.exit(1);
  }
}

clearTranslations();
