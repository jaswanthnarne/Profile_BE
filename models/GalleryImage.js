const mongoose = require('mongoose');

const galleryImageSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  mediaType: { type: String, enum: ['image', 'video', 'youtube'], default: 'image' },
  cloudinaryPublicId: { type: String, required: false },
  url: { type: String, required: true },
  youtubeId: { type: String, default: '' },
  caption: { type: String, default: '' },
  collegeName: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('GalleryImage', galleryImageSchema);
