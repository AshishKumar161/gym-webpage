import { sendResponse } from '../utils/responseFormatter.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getBlogs = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Blog articles retrieved successfully.', []);
});

export const createBlog = asyncHandler(async (req, res) => {
  const { title, content, author, coverImage, tags, status } = req.body;
  const slug = (title || 'post').toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
  const blog = { id: 'blog_' + Date.now(), title, slug, content, author: author || req.user?.name || 'Admin', coverImage, tags, status };
  return sendResponse(res, 201, 'Blog article created successfully.', blog);
});

export const deleteBlog = asyncHandler(async (req, res) => {
  return sendResponse(res, 200, 'Blog article deleted successfully.');
});
