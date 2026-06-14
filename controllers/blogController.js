const BlogPost = require('../models/BlogPost');
const cloudinary = require('../config/cloudinary');
const sanitizeHtml = require('sanitize-html');
const slugify = require('slugify');

const uploadToCloudinary = async (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

const generateSlug = async (title) => {
  let slug = slugify(title, { lower: true, strict: true });
  const existing = await BlogPost.findOne({ slug });
  if (existing) slug = `${slug}-${Date.now()}`;
  return slug;
};

// GET /api/blog - Public (published posts)
const getBlogPosts = async (req, res) => {
  try {
    const isAdmin = req.query.all === 'true' && req.admin;
    const filter = isAdmin ? {} : { published: true };
    const posts = await BlogPost.find(filter)
      .select('-content')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/blog/:slug - Public single post
const getBlogPostBySlug = async (req, res) => {
  try {
    const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/blog/admin/:id - Admin single post by ID
const getBlogPostById = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/blog - Admin
const createBlogPost = async (req, res) => {
  try {
    const { title, content, published } = req.body;
    let coverImage = '';
    let coverImagePublicId = '';

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'portfolio/blog');
      coverImage = result.secure_url;
      coverImagePublicId = result.public_id;
    }

    const slug = await generateSlug(title);
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
      allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'] },
    });

    const post = await BlogPost.create({
      title,
      slug,
      content: sanitizedContent,
      coverImage,
      coverImagePublicId,
      published: published === 'true' || published === true,
    });

    const io = req.app.get('io');
    if (io) io.emit('blog_changed');

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/blog/:id - Admin
const updateBlogPost = async (req, res) => {
  try {
    const { title, content, published } = req.body;
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    let coverImage = post.coverImage;
    let coverImagePublicId = post.coverImagePublicId;

    if (req.file) {
      if (coverImagePublicId) await cloudinary.uploader.destroy(coverImagePublicId);
      const result = await uploadToCloudinary(req.file.buffer, 'portfolio/blog');
      coverImage = result.secure_url;
      coverImagePublicId = result.public_id;
    }

    if (title && title !== post.title) {
      post.slug = await generateSlug(title);
      post.title = title;
    }
    if (content) {
      post.content = sanitizeHtml(content, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
        allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ['src', 'alt', 'width', 'height'] },
      });
    }
    if (published !== undefined) post.published = published === 'true' || published === true;
    post.coverImage = coverImage;
    post.coverImagePublicId = coverImagePublicId;

    await post.save();

    const io = req.app.get('io');
    if (io) io.emit('blog_changed');

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/blog/:id - Admin
const deleteBlogPost = async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.coverImagePublicId) {
      await cloudinary.uploader.destroy(post.coverImagePublicId);
    }

    await BlogPost.findByIdAndDelete(req.params.id);

    const io = req.app.get('io');
    if (io) io.emit('blog_changed');

    res.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBlogPosts, getBlogPostBySlug, getBlogPostById, createBlogPost, updateBlogPost, deleteBlogPost };
