const TrainingProject = require('../models/TrainingProject');
const cloudinary = require('../config/cloudinary');

const uploadToCloudinary = async (buffer, folder, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// Regex to extract YouTube ID from different format URLs
const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// GET /api/gallery - Public (list all projects)
const getProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.companyId) filter.companyId = req.query.companyId;
    const projects = await TrainingProject.find(filter)
      .populate('companyId', 'name logo')
      .sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/gallery/:id - Public (single project details)
const getProjectById = async (req, res) => {
  try {
    const project = await TrainingProject.findById(req.params.id)
      .populate('companyId', 'name logo');
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/gallery - Admin (create project details, no media initially)
const createProject = async (req, res) => {
  try {
    const {
      projectName,
      companyId,
      collegeName,
      startDate,
      endDate,
      description,
      contentsCovered,
      experienceRating,
      feedbackSummary,
      studentTestimonials
    } = req.body;

    if (!projectName) return res.status(400).json({ message: 'projectName is required' });
    if (!companyId) return res.status(400).json({ message: 'companyId is required' });

    const count = await TrainingProject.countDocuments();

    const project = await TrainingProject.create({
      projectName,
      companyId,
      collegeName: collegeName || '',
      startDate: startDate || '',
      endDate: endDate || '',
      description: description || '',
      contentsCovered: Array.isArray(contentsCovered) ? contentsCovered : [],
      experienceRating: parseFloat(experienceRating) || 5,
      feedbackSummary: feedbackSummary || '',
      studentTestimonials: Array.isArray(studentTestimonials) ? studentTestimonials : [],
      media: [],
      order: count,
    });

    const io = req.app.get('io');
    if (io) io.emit('gallery_changed');

    const populated = await TrainingProject.findById(project._id).populate('companyId', 'name logo');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/gallery/:id - Admin (update project details)
const updateProject = async (req, res) => {
  try {
    const {
      projectName,
      companyId,
      collegeName,
      startDate,
      endDate,
      description,
      contentsCovered,
      experienceRating,
      feedbackSummary,
      studentTestimonials
    } = req.body;

    const project = await TrainingProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.projectName = projectName !== undefined ? projectName : project.projectName;
    project.companyId = companyId !== undefined ? companyId : project.companyId;
    project.collegeName = collegeName !== undefined ? collegeName : project.collegeName;
    project.startDate = startDate !== undefined ? startDate : project.startDate;
    project.endDate = endDate !== undefined ? endDate : project.endDate;
    project.description = description !== undefined ? description : project.description;
    project.contentsCovered = Array.isArray(contentsCovered) ? contentsCovered : project.contentsCovered;
    project.experienceRating = experienceRating !== undefined ? parseFloat(experienceRating) || 5 : project.experienceRating;
    project.feedbackSummary = feedbackSummary !== undefined ? feedbackSummary : project.feedbackSummary;
    project.studentTestimonials = Array.isArray(studentTestimonials) ? studentTestimonials : project.studentTestimonials;

    await project.save();

    const io = req.app.get('io');
    if (io) io.emit('gallery_changed');

    const populated = await TrainingProject.findById(project._id).populate('companyId', 'name logo');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/gallery/:id - Admin (delete project and all its media files)
const deleteProject = async (req, res) => {
  try {
    const project = await TrainingProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Destroy all Cloudinary assets in the media array
    const destroyPromises = project.media
      .filter(m => m.cloudinaryPublicId)
      .map(m => {
        const resourceType = m.mediaType === 'video' ? 'video' : 'image';
        return cloudinary.uploader.destroy(m.cloudinaryPublicId, { resource_type: resourceType })
          .catch(err => console.error(`Error deleting Cloudinary asset ${m.cloudinaryPublicId}:`, err.message));
      });
    
    await Promise.all(destroyPromises);
    await TrainingProject.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('gallery_changed');

    res.json({ message: 'Project and all media items deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/gallery/:id/media - Admin (add image/video or YouTube to existing project)
const addProjectMedia = async (req, res) => {
  try {
    const { mediaType, caption } = req.body;
    const project = await TrainingProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let newMedia = {
      mediaType: mediaType || 'image',
      caption: caption || '',
    };

    if (mediaType === 'youtube') {
      const { youtubeUrl } = req.body;
      if (!youtubeUrl) return res.status(400).json({ message: 'YouTube URL is required' });

      const ytId = getYoutubeId(youtubeUrl);
      if (!ytId) return res.status(400).json({ message: 'Invalid YouTube URL' });

      newMedia.url = `https://www.youtube.com/watch?v=${ytId}`;
      newMedia.youtubeId = ytId;
    } else {
      if (!req.file) return res.status(400).json({ message: 'Media file is required' });

      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      newMedia.mediaType = isVideo ? 'video' : 'image';

      const result = await uploadToCloudinary(
        req.file.buffer,
        `portfolio/projects/${project._id}`,
        resourceType
      );

      newMedia.cloudinaryPublicId = result.public_id;
      newMedia.url = result.secure_url;
    }

    project.media.push(newMedia);
    await project.save();

    const io = req.app.get('io');
    if (io) io.emit('gallery_changed');

    const populated = await TrainingProject.findById(project._id).populate('companyId', 'name logo');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/gallery/:id/media/:mediaId - Admin (remove specific media from project)
const deleteProjectMedia = async (req, res) => {
  try {
    const project = await TrainingProject.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const mediaItem = project.media.id(req.params.mediaId);
    if (!mediaItem) return res.status(404).json({ message: 'Media item not found' });

    // Destroy in Cloudinary if it exists
    if (mediaItem.cloudinaryPublicId) {
      const resourceType = mediaItem.mediaType === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(mediaItem.cloudinaryPublicId, { resource_type: resourceType })
        .catch(err => console.error(`Error deleting Cloudinary asset:`, err.message));
    }

    project.media.pull(req.params.mediaId);
    await project.save();

    const io = req.app.get('io');
    if (io) io.emit('gallery_changed');

    const populated = await TrainingProject.findById(project._id).populate('companyId', 'name logo');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/gallery/reorder - Admin (bulk update project orders)
const reorderProjects = async (req, res) => {
  try {
    const { items } = req.body; // [{ id, order }]
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items array required' });

    const updates = items.map(({ id, order }) =>
      TrainingProject.findByIdAndUpdate(id, { order }, { new: true })
    );
    await Promise.all(updates);

    const io = req.app.get('io');
    if (io) io.emit('gallery_changed');

    res.json({ message: 'Projects reordered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addProjectMedia,
  deleteProjectMedia,
  reorderProjects
};
