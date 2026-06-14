const ClassroomMoment = require('../models/ClassroomMoment');
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

const defaultMoments = [
  // 1. TCE Gadag
  {
    url: '/TCE Gadag/IMG20260527133255.jpg',
    type: 'image',
    campus: 'TCE Gadag',
    title: 'Core Java Session',
    caption: 'Technical review and interactive whiteboarding session during Core Java bootcamp at TCE Gadag.',
    desc: 'Students learning OOP concepts, interfaces, and collections.',
    order: 0
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781416413/portfolio/projects/6a2e3eb0734523436df5bc91/oqwer3hzbfhkaf3yzrr6.jpg',
    type: 'image',
    campus: 'TCE Gadag',
    title: 'Continuous Assessments',
    caption: 'Continuous Classroom Assessments for Performance Evaluation',
    desc: 'Evaluating student progress through lab assignments, practical scenario challenges, and quizzes.',
    order: 1
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781416463/portfolio/projects/6a2e3eb0734523436df5bc91/vlonrr92thrzr56stmsn.jpg',
    type: 'image',
    campus: 'TCE Gadag',
    title: 'Technical Orientation',
    caption: 'Technical Orientation and Course Overview',
    desc: 'Introduction of course topics and cohort frameworks at the startup of the training boot camp.',
    order: 2
  },
  {
    url: '/TCE Gadag/TCE X ETH .mp4',
    type: 'video',
    campus: 'TCE Gadag',
    title: 'Bootcamp Vibe & Pitch',
    caption: 'Bootcamp pitch presentation and classroom interaction.',
    desc: 'Active student participation and dynamic group interaction.',
    order: 3
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/video/upload/v1781416569/portfolio/projects/6a2e3eb0734523436df5bc91/ireuthvppvl8v541eexc.mp4',
    type: 'video',
    campus: 'TCE Gadag',
    title: 'TCE Gadag Hackathon',
    caption: 'Organized and facilitated a hackathon to encourage hands-on learning, creativity, and real-world project development.',
    desc: 'Bootcamp teams showcasing innovative designs and solutions under time constraints.',
    order: 4
  },
  // 2. FISAT Angamaly
  {
    url: '/FISAT Angamaly/IMG20260613093841.jpg',
    type: 'image',
    campus: 'FISAT Angamaly',
    title: 'Full Stack Presentations',
    caption: 'Students presenting dynamic React, Node.js and MongoDB web applications.',
    desc: 'Web projects demo and final deployment reviews.',
    order: 5
  },
  {
    url: '/FISAT Angamaly/IMG20260613093527.jpg',
    type: 'image',
    campus: 'FISAT Angamaly',
    title: 'FISAT Cohort Group',
    caption: 'Group photo of FISAT Angamaly web development cohort.',
    desc: 'Graduation moment of the engineering bootcamp.',
    order: 6
  },
  {
    url: '/FISAT Angamaly/IMG20260613092125.jpg',
    type: 'image',
    campus: 'FISAT Angamaly',
    title: 'Hands-on Web Development Lab',
    caption: 'React UI styling and routing exercises in the lab.',
    desc: 'Students debugging components and configuring routers.',
    order: 7
  },
  {
    url: '/FISAT Angamaly/IMG20260612092551.jpg',
    type: 'image',
    campus: 'FISAT Angamaly',
    title: 'Trainer Mentoring Vibe',
    caption: 'One-on-one code logic reviews and architectural walkthroughs.',
    desc: 'Guiding students on state management and API integration.',
    order: 8
  },
  // 3. MIT Mysore
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781443046/portfolio/projects/6a2ea8d2ff4c8502f0b2a502/msifi2dn9s5uy0ovseat.jpg',
    type: 'image',
    campus: 'MIT Mysore',
    title: 'TryHackMe Labs Presentation',
    caption: 'Students Performing TryHackMe Cyber Security Labs and Presenting Their Findings Through Practical Demonstrations',
    desc: 'Hands-on cyber security training using TryHackMe virtual labs, covering threat vectors and penetration testing.',
    order: 9
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781443090/portfolio/projects/6a2ea8d2ff4c8502f0b2a502/r8qhmrrjz8zhujxdqxsm.jpg',
    type: 'image',
    campus: 'MIT Mysore',
    title: 'Periodic Assessments',
    caption: 'Students Participating in Periodic Assessments to Evaluate Learning Progress and Technical Competency.',
    desc: 'Regular evaluations and practical tests checking students\' skill levels in core networking and security.',
    order: 10
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781443143/portfolio/projects/6a2ea8d2ff4c8502f0b2a502/t0rztdvh0eoaj8cs5f1h.jpg',
    type: 'image',
    campus: 'MIT Mysore',
    title: 'Graduation Appreciation Ceremony',
    caption: 'Students Celebrating the Successful Completion of the Training Program and Expressing Their Gratitude Through a Special Appreciation Ceremony',
    desc: 'An emotional and successful closing ceremony for the Cyber Security training batch at MIT Mysore.',
    order: 11
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781443186/portfolio/projects/6a2ea8d2ff4c8502f0b2a502/r8andzgurbroiyzcjem9.jpg',
    type: 'image',
    campus: 'MIT Mysore',
    title: 'Best Project Awards (Group 1)',
    caption: 'Students Receiving Best Project Awards from Ethnotech in Recognition of Their Innovation, Technical Excellence, and Project Development Skills',
    desc: 'Award distribution for outstanding implementations during the Cyber Security training program.',
    order: 12
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781443204/portfolio/projects/6a2ea8d2ff4c8502f0b2a502/s6vde2u9nnaqqmy9gdtm.jpg',
    type: 'image',
    campus: 'MIT Mysore',
    title: 'Best Project Awards (Group 2)',
    caption: 'Students Receiving Best Project Awards from Ethnotech in Recognition of Their Innovation, Technical Excellence, and Project Development Skills',
    desc: 'Recognition for excellence in security solution designs and capstone projects.',
    order: 13
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781443227/portfolio/projects/6a2ea8d2ff4c8502f0b2a502/ae0poi1zhoscgjitbl7j.jpg',
    type: 'image',
    campus: 'MIT Mysore',
    title: 'Best Project Awards (Group 3)',
    caption: 'Students Receiving Best Project Awards from Ethnotech in Recognition of Their Innovation, Technical Excellence, and Project Development Skills',
    desc: 'Celebrating team achievements and certificate handover by Ethnotech leadership.',
    order: 14
  },
  {
    url: 'https://res.cloudinary.com/ddwxonjbd/image/upload/v1781443261/portfolio/projects/6a2ea8d2ff4c8502f0b2a502/sy4qfqvsnsmjyffup0ba.jpg',
    type: 'image',
    campus: 'MIT Mysore',
    title: 'Student Appreciation Event',
    caption: 'A Memorable Appreciation Event Organized by Students to Express Their Gratitude for the Training and Support',
    desc: 'A heartfelt tribute organized by students to express their thanks for the mentorship.',
    order: 15
  }
];

// GET /api/moments - Public (list all moments, with auto-seeding)
const getMoments = async (req, res) => {
  try {
    let moments = await ClassroomMoment.find().sort({ order: 1, createdAt: -1 });
    if (moments.length === 0) {
      await ClassroomMoment.insertMany(defaultMoments);
      moments = await ClassroomMoment.find().sort({ order: 1, createdAt: -1 });
    }
    res.json(moments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/moments - Admin (create moment with file upload)
const createMoment = async (req, res) => {
  try {
    const { title, campus, caption, desc, order } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    if (!campus) return res.status(400).json({ message: 'Campus is required' });
    if (!req.file) return res.status(400).json({ message: 'Moment file (image/video) is required' });

    const isVideo = req.file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    const result = await uploadToCloudinary(
      req.file.buffer,
      'portfolio/moments',
      resourceType
    );

    const moment = await ClassroomMoment.create({
      title,
      campus,
      type: isVideo ? 'video' : 'image',
      url: result.secure_url,
      cloudinaryPublicId: result.public_id,
      caption: caption || '',
      desc: desc || '',
      order: parseInt(order) || 0
    });

    const io = req.app.get('io');
    if (io) io.emit('moments_changed');

    res.status(201).json(moment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/moments/:id - Admin (update moment text details)
const updateMoment = async (req, res) => {
  try {
    const { title, campus, caption, desc, order } = req.body;
    const moment = await ClassroomMoment.findById(req.params.id);
    if (!moment) return res.status(404).json({ message: 'Moment not found' });

    moment.title = title !== undefined ? title : moment.title;
    moment.campus = campus !== undefined ? campus : moment.campus;
    moment.caption = caption !== undefined ? caption : moment.caption;
    moment.desc = desc !== undefined ? desc : moment.desc;
    moment.order = order !== undefined ? parseInt(order) : moment.order;

    await moment.save();

    const io = req.app.get('io');
    if (io) io.emit('moments_changed');

    res.json(moment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/moments/:id - Admin (delete moment and Cloudinary asset)
const deleteMoment = async (req, res) => {
  try {
    const moment = await ClassroomMoment.findById(req.params.id);
    if (!moment) return res.status(404).json({ message: 'Moment not found' });

    if (moment.cloudinaryPublicId) {
      const resourceType = moment.type === 'video' ? 'video' : 'image';
      await cloudinary.uploader.destroy(moment.cloudinaryPublicId, { resource_type: resourceType })
        .catch(err => console.error(`Error deleting Cloudinary asset ${moment.cloudinaryPublicId}:`, err.message));
    }

    await ClassroomMoment.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('moments_changed');

    res.json({ message: 'Moment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMoments,
  createMoment,
  updateMoment,
  deleteMoment
};
