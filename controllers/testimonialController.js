const Testimonial = require('../models/Testimonial');
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

const getYoutubeId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// GET /api/testimonials?approved=true - Public
const getTestimonials = async (req, res) => {
  try {
    const filter = {};
    if (req.query.approved === 'true') filter.isApproved = true;
    const testimonials = await Testimonial.find(filter).sort({ date: -1 });
    res.json(testimonials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/testimonials - Admin
const createTestimonial = async (req, res) => {
  try {
    const { clientName, company, collegeName, text, rating, date, isApproved, mediaType, youtubeUrl } = req.body;

    let mediaData = {
      mediaType: mediaType || 'none',
      mediaUrl: '',
      youtubeId: '',
      cloudinaryPublicId: ''
    };

    if (mediaType === 'youtube' && youtubeUrl) {
      const ytId = getYoutubeId(youtubeUrl);
      if (ytId) {
        mediaData.mediaType = 'youtube';
        mediaData.mediaUrl = `https://www.youtube.com/watch?v=${ytId}`;
        mediaData.youtubeId = ytId;
      }
    } else if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      mediaData.mediaType = isVideo ? 'video' : 'image';

      const result = await uploadToCloudinary(
        req.file.buffer,
        `portfolio/testimonials`,
        resourceType
      );
      mediaData.mediaUrl = result.secure_url;
      mediaData.cloudinaryPublicId = result.public_id;
    }

    const testimonial = await Testimonial.create({
      clientName,
      company: company || '',
      collegeName: collegeName || '',
      text,
      rating: parseFloat(rating) || 5,
      date: date || undefined,
      isApproved: isApproved === 'true' || isApproved === true,
      ...mediaData
    });
    
    const io = req.app.get('io');
    if (io) io.emit('testimonials_changed');

    res.status(201).json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/testimonials/:id - Admin
const updateTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    const { clientName, company, collegeName, text, rating, date, isApproved, mediaType, youtubeUrl } = req.body;

    if (clientName !== undefined) testimonial.clientName = clientName;
    if (company !== undefined) testimonial.company = company;
    if (collegeName !== undefined) testimonial.collegeName = collegeName;
    if (text !== undefined) testimonial.text = text;
    if (rating !== undefined) testimonial.rating = parseFloat(rating) || 5;
    if (date !== undefined) testimonial.date = date;
    if (isApproved !== undefined) testimonial.isApproved = isApproved === 'true' || isApproved === true;

    // Handle media updates
    if (mediaType !== undefined) {
      const shouldDeleteOld = testimonial.cloudinaryPublicId && (mediaType !== testimonial.mediaType || req.file || mediaType === 'youtube' || mediaType === 'none');
      if (shouldDeleteOld) {
        const resourceType = testimonial.mediaType === 'video' ? 'video' : 'image';
        await cloudinary.uploader.destroy(testimonial.cloudinaryPublicId, { resource_type: resourceType })
          .catch(err => console.error('Cloudinary destroy error:', err.message));
        testimonial.cloudinaryPublicId = '';
        testimonial.mediaUrl = '';
      }

      if (mediaType === 'youtube' && youtubeUrl) {
        const ytId = getYoutubeId(youtubeUrl);
        if (ytId) {
          testimonial.mediaType = 'youtube';
          testimonial.mediaUrl = `https://www.youtube.com/watch?v=${ytId}`;
          testimonial.youtubeId = ytId;
        }
      } else if (mediaType === 'none') {
        testimonial.mediaType = 'none';
        testimonial.mediaUrl = '';
        testimonial.youtubeId = '';
      } else if (req.file) {
        const isVideo = req.file.mimetype.startsWith('video/');
        const resourceType = isVideo ? 'video' : 'image';
        testimonial.mediaType = isVideo ? 'video' : 'image';

        const result = await uploadToCloudinary(
          req.file.buffer,
          `portfolio/testimonials`,
          resourceType
        );
        testimonial.mediaUrl = result.secure_url;
        testimonial.cloudinaryPublicId = result.public_id;
        testimonial.youtubeId = '';
      } else {
        testimonial.mediaType = mediaType;
      }
    } else if (req.file) {
      if (testimonial.cloudinaryPublicId) {
        const resourceType = testimonial.mediaType === 'video' ? 'video' : 'image';
        await cloudinary.uploader.destroy(testimonial.cloudinaryPublicId, { resource_type: resourceType })
          .catch(err => console.error('Cloudinary destroy error:', err.message));
      }

      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      testimonial.mediaType = isVideo ? 'video' : 'image';

      const result = await uploadToCloudinary(
        req.file.buffer,
        `portfolio/testimonials`,
        resourceType
      );
      testimonial.mediaUrl = result.secure_url;
      testimonial.cloudinaryPublicId = result.public_id;
      testimonial.youtubeId = '';
    }

    await testimonial.save();
    
    const io = req.app.get('io');
    if (io) io.emit('testimonials_changed');

    res.json(testimonial);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/testimonials/:id - Admin
const deleteTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) return res.status(404).json({ message: 'Testimonial not found' });

    if (testimonial.cloudinaryPublicId) {
      const resourceType = testimonial.mediaType === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(testimonial.cloudinaryPublicId, { resource_type: resourceType })
        .catch(err => console.error('Cloudinary destroy error on delete:', err.message));
    }

    await Testimonial.findByIdAndDelete(req.params.id);
    
    const io = req.app.get('io');
    if (io) io.emit('testimonials_changed');

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTestimonials, createTestimonial, updateTestimonial, deleteTestimonial };
