import Blog from '../models/Blog.js';

export const getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'published' }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    next(error);
  }
};

export const createBlog = async (req, res, next) => {
  try {
    const { title, content, author, coverImage, tags, status } = req.body;
    const slug = title.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');

    const blog = await Blog.create({
      title,
      slug,
      content,
      author: author || req.user.name,
      coverImage,
      tags,
      status
    });

    res.status(201).json({ success: true, message: 'Blog article created', data: blog });
  } catch (error) {
    next(error);
  }
};

export const deleteBlog = async (req, res, next) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Blog article deleted' });
  } catch (error) {
    next(error);
  }
};
