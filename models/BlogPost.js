const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  coverImage: { type: String, default: '' },
  coverImagePublicId: { type: String, default: '' },
  published: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
