const ContactSubmission = require('../models/ContactSubmission');
const { sendContactEmail } = require('../config/email');

// POST /api/contact - Public
const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }

    const submission = await ContactSubmission.create({ name, email, message });

    // Send email notification (non-blocking)
    sendContactEmail({ name, email, message }).catch(console.error);

    const io = req.app.get('io');
    if (io) io.emit('new_contact', submission);

    res.status(201).json({ message: 'Message sent successfully', id: submission._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/contact/submissions - Admin
const getSubmissions = async (req, res) => {
  try {
    const submissions = await ContactSubmission.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/contact/submissions/:id/read - Admin
const markAsRead = async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const io = req.app.get('io');
    if (io) io.emit('contacts_changed');

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/contact/submissions/:id - Admin
const deleteSubmission = async (req, res) => {
  try {
    const submission = await ContactSubmission.findByIdAndDelete(req.params.id);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const io = req.app.get('io');
    if (io) io.emit('contacts_changed');

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/contact/stats - Admin
const getStats = async (req, res) => {
  try {
    const Company = require('../models/Company');
    const TrainingProject = require('../models/TrainingProject');
    const Testimonial = require('../models/Testimonial');
    const BlogPost = require('../models/BlogPost');

    const [companies, images, testimonials, posts, unread] = await Promise.all([
      Company.countDocuments(),
      TrainingProject.countDocuments(),
      Testimonial.countDocuments(),
      BlogPost.countDocuments(),
      ContactSubmission.countDocuments({ read: false }),
    ]);

    res.json({ companies, images, testimonials, posts, unread });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitContact, getSubmissions, markAsRead, deleteSubmission, getStats };
