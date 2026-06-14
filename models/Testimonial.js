const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true, trim: true },
  company: { type: String, default: '' },
  collegeName: { type: String, default: '' },
  text: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  date: { type: Date, default: Date.now },
  isApproved: { type: Boolean, default: false },
  mediaType: { type: String, enum: ['none', 'image', 'video', 'youtube'], default: 'none' },
  mediaUrl: { type: String, default: '' },
  youtubeId: { type: String, default: '' },
  cloudinaryPublicId: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
