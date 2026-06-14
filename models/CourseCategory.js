const mongoose = require('mongoose');

const courseCategorySchema = new mongoose.Schema({
  skillName: { type: String, required: true, trim: true },       // e.g. 'Cyber Security'
  description: { type: String, default: '' },                     // brief tagline
  topics: { type: [String], default: [] },                        // TOC items covered
  icon: { type: String, default: 'cpu' },                         // icon identifier
  image: { type: String, default: '' },                           // cover image URL
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('CourseCategory', courseCategorySchema);
