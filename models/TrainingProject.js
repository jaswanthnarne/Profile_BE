const mongoose = require('mongoose');

const trainingProjectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, trim: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  collegeName: { type: String, default: '' },
  startDate: { type: String, default: '' },
  endDate: { type: String, default: '' },
  description: { type: String, default: '' },
  contentsCovered: { type: [String], default: [] },
  experienceRating: { type: Number, default: 5 },
  feedbackSummary: { type: String, default: '' },
  studentTestimonials: { type: [String], default: [] },
  media: [{
    mediaType: { type: String, enum: ['image', 'video', 'youtube'], default: 'image' },
    url: { type: String, required: true },
    cloudinaryPublicId: { type: String, required: false },
    youtubeId: { type: String, default: '' },
    caption: { type: String, default: '' }
  }],
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('TrainingProject', trainingProjectSchema);
