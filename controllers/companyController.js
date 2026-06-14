const Company = require('../models/Company');
const GalleryImage = require('../models/GalleryImage');
const cloudinary = require('../config/cloudinary');

// Upload image to Cloudinary helper
const uploadToCloudinary = async (buffer, folder, publicId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, public_id: publicId, overwrite: true },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// GET /api/companies - Public
const getCompanies = async (req, res) => {
  try {
    const companies = await Company.find().sort({ order: 1, createdAt: -1 });
    res.json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/companies - Admin
const createCompany = async (req, res) => {
  try {
    const { name, description, website, order } = req.body;
    let logo = '';
    let logoPublicId = '';

    if (req.file) {
      const result = await uploadToCloudinary(
        req.file.buffer,
        'portfolio/logos',
        `logo_${Date.now()}`
      );
      logo = result.secure_url;
      logoPublicId = result.public_id;
    }

    const company = await Company.create({
      name,
      logo,
      logoPublicId,
      description,
      website,
      order: order || 0,
    });

    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/companies/:id - Admin
const updateCompany = async (req, res) => {
  try {
    const { name, description, website, order } = req.body;
    const company = await Company.findById(req.params.id);

    if (!company) return res.status(404).json({ message: 'Company not found' });

    let logo = company.logo;
    let logoPublicId = company.logoPublicId;

    if (req.file) {
      // Delete old logo from Cloudinary
      if (logoPublicId) {
        await cloudinary.uploader.destroy(logoPublicId);
      }
      const result = await uploadToCloudinary(
        req.file.buffer,
        'portfolio/logos',
        `logo_${Date.now()}`
      );
      logo = result.secure_url;
      logoPublicId = result.public_id;
    }

    company.name = name || company.name;
    company.description = description !== undefined ? description : company.description;
    company.website = website !== undefined ? website : company.website;
    company.order = order !== undefined ? order : company.order;
    company.logo = logo;
    company.logoPublicId = logoPublicId;

    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/companies/:id - Admin
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    // Delete logo from Cloudinary
    if (company.logoPublicId) {
      await cloudinary.uploader.destroy(company.logoPublicId);
    }

    // Delete all gallery images for this company
    const images = await GalleryImage.find({ companyId: req.params.id });
    for (const img of images) {
      await cloudinary.uploader.destroy(img.cloudinaryPublicId);
    }
    await GalleryImage.deleteMany({ companyId: req.params.id });

    await Company.findByIdAndDelete(req.params.id);
    res.json({ message: 'Company and its gallery deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCompanies, createCompany, updateCompany, deleteCompany };
