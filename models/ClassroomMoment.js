const mongoose = require('mongoose');

const classroomMomentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  campus: { type: String, required: true, trim: true }, // e.g. TCE Gadag, FISAT Angamaly, MIT Mysore
  type: { type: String, enum: ['image', 'video'], default: 'image' },
  url: { type: String, required: true },
  cloudinaryPublicId: { type: String, required: false },
  caption: { type: String, default: '' },
  desc: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('ClassroomMoment', classroomMomentSchema);
