import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const blogRouter = express.Router();

// GET /api/blogs
blogRouter.get('/', (req, res) => {
  const blogs = db.getBlogs();
  res.json({ success: true, blogs });
});

// GET /api/blogs/:idOrSlug
blogRouter.get('/:idOrSlug', (req, res) => {
  const { idOrSlug } = req.params;
  const blog = db.getBlogs().find(b => b.id === idOrSlug || b.slug === idOrSlug);
  if (!blog) {
    return res.status(404).json({ error: 'Article not found' });
  }
  res.json({ success: true, blog });
});

// POST /api/blogs (Admin add blog)
blogRouter.post('/', requireAuth, (req, res) => {
  const { title, excerpt, content, category, tags, featuredImage, author, readTime, metaTitle, metaDescription } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const newBlog = db.addBlog({
    title,
    slug,
    excerpt: excerpt || content.slice(0, 150) + '...',
    content,
    category: category || 'Dialysis Care',
    tags: Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : ['Dialysis']),
    featuredImage: featuredImage || 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80',
    author: author || 'Renal Medicare Clinical Team',
    readTime: readTime || '5 min read',
    metaTitle: metaTitle || title,
    metaDescription: metaDescription || excerpt
  });

  res.status(201).json({ success: true, message: 'Blog published successfully', blog: newBlog });
});

// PUT /api/blogs/:id (Admin edit blog)
blogRouter.put('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  if (updates.tags && typeof updates.tags === 'string') {
    updates.tags = updates.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
  }

  const updated = db.updateBlog(id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Blog not found' });
  }

  res.json({ success: true, message: 'Blog updated successfully', blog: updated });
});

// DELETE /api/blogs/:id (Admin delete blog)
blogRouter.delete('/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const deleted = db.deleteBlog(id);
  if (!deleted) {
    return res.status(404).json({ error: 'Blog not found' });
  }

  res.json({ success: true, message: 'Blog removed successfully' });
});
