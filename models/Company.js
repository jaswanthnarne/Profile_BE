const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  logoPublicId: { type: String, default: '' },
  description: { type: String, default: '' },
  website: { type: String, default: '' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
