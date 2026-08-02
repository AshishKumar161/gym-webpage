import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    content: { type: String, required: true },
    author: { type: String, default: 'A² ReVamp Gym Team' },
    coverImage: { type: String, default: '' },
    tags: [{ type: String }],
    status: { type: String, enum: ['published', 'draft'], default: 'published' }
  },
  { timestamps: true }
);

const Blog = mongoose.model('Blog', blogSchema);
export default Blog;
