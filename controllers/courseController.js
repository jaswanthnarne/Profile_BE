const CourseCategory = require('../models/CourseCategory');

// GET /api/courses - Public
const getCourses = async (req, res) => {
  try {
    let categories = await CourseCategory.find().sort({ order: 1, createdAt: -1 });
    if (categories.length === 0) {
      const defaultSkills = [
        {
          skillName: 'Cyber Security',
          description: 'Ethical hacking, penetration testing, and enterprise security frameworks.',
          icon: 'lock',
          image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
          order: 1,
          topics: ['Network Security & Firewalls', 'Ethical Hacking & Pen Testing', 'OWASP Top 10', 'Security Auditing', 'Cryptography Fundamentals']
        },
        {
          skillName: 'Cloud Computing',
          description: 'AWS, Azure, GCP architecture and DevOps workflows.',
          icon: 'globe',
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
          order: 2,
          topics: ['AWS / Azure / GCP Fundamentals', 'Cloud Architecture & Deployment', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Serverless Computing']
        },
        {
          skillName: 'Networking',
          description: 'TCP/IP, routing, switching, and infrastructure design.',
          icon: 'network',
          image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80',
          order: 3,
          topics: ['TCP/IP & OSI Model', 'Routing & Switching', 'Network Administration', 'Wireless Networks', 'VPN & Network Security']
        },
        {
          skillName: 'Web Development',
          description: 'Full stack with HTML, CSS, JavaScript, React, and Node.js.',
          icon: 'code',
          image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
          order: 4,
          topics: ['HTML5 & Semantic Markup', 'CSS3 & Responsive Design', 'JavaScript ES6+', 'React & Next.js', 'Node.js & Express.js', 'REST API Design']
        },
        {
          skillName: 'Python Programming',
          description: 'Core Python, automation, data analysis, and Django.',
          icon: 'cpu',
          image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
          order: 5,
          topics: ['Core Python & OOP', 'Data Structures & Algorithms', 'NumPy, Pandas & Matplotlib', 'Django & Flask Frameworks', 'Automation & Scripting']
        },
        {
          skillName: 'Java Programming',
          description: 'Core Java programming, object-oriented concepts, exception handling, and collections.',
          icon: 'cpu',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
          order: 6,
          topics: ['Java Language Basics & Syntax', 'Object-Oriented Programming (OOP)', 'Exception Handling & Packages', 'Java Collections Framework', 'Multithreading & Concurrency']
        },
        {
          skillName: 'Data Science',
          description: 'Analytics, ML models, and business intelligence.',
          icon: 'database',
          image: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&q=80',
          order: 7,
          topics: ['Exploratory Data Analysis', 'Machine Learning Algorithms', 'Deep Learning Foundations', 'Data Visualization (Tableau/PowerBI)', 'Statistical Modeling']
        }
      ];
      await CourseCategory.insertMany(defaultSkills);
      categories = await CourseCategory.find().sort({ order: 1, createdAt: -1 });
    }
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/courses - Admin
const createCourse = async (req, res) => {
  try {
    const { skillName, description, topics, icon, image, order } = req.body;

    if (!skillName) {
      return res.status(400).json({ message: 'Skill Name is required' });
    }

    const category = await CourseCategory.create({
      skillName,
      description: description || '',
      topics: Array.isArray(topics) ? topics : [],
      icon: icon || 'cpu',
      image: image || '',
      order: order || 0,
    });

    const io = req.app.get('io');
    if (io) io.emit('courses_changed');

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/courses/:id - Admin
const updateCourse = async (req, res) => {
  try {
    const { skillName, description, topics, icon, image, order } = req.body;
    const category = await CourseCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Course category not found' });
    }

    category.skillName = skillName !== undefined ? skillName : category.skillName;
    category.description = description !== undefined ? description : category.description;
    category.topics = Array.isArray(topics) ? topics : category.topics;
    category.icon = icon !== undefined ? icon : category.icon;
    category.image = image !== undefined ? image : category.image;
    category.order = order !== undefined ? order : category.order;

    await category.save();

    const io = req.app.get('io');
    if (io) io.emit('courses_changed');

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/courses/:id - Admin
const deleteCourse = async (req, res) => {
  try {
    const category = await CourseCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Course category not found' });
    }

    const io = req.app.get('io');
    if (io) io.emit('courses_changed');

    res.json({ message: 'Course category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse };
