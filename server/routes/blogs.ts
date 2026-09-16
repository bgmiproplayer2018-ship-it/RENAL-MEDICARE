import express from 'express';
import { db } from '../db/store.ts';
import { requireAuth } from './auth.ts';

export const blogRouter = express.Router();

// GET /api/blogs
blogRouter.get('/', async (req, res) => {
  try {
    const blogs = await db.getBlogs();
    res.json({ success: true, blogs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch blogs' });
  }
});

// GET /api/blogs/:idOrSlug
blogRouter.get('/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    const blogs = await db.getBlogs();
    const blog = blogs.find(b => b.id === idOrSlug || b.slug === idOrSlug);
    if (!blog) {
      return res.status(404).json({ error: 'Article not found' });
    }
    res.json({ success: true, blog });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to fetch blog' });
  }
});

// POST /api/blogs (Admin add blog)
blogRouter.post('/', requireAuth, async (req, res) => {
  try {
    const { title, excerpt, content, category, tags, featuredImage, author, readTime, metaTitle, metaDescription } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const newBlog = await db.addBlog({
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
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to create blog' });
  }
});

// PUT /api/blogs/:id (Admin edit blog)
blogRouter.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.tags && typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    }

    const updated = await db.updateBlog(id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ success: true, message: 'Blog updated successfully', blog: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to update blog' });
  }
});

// DELETE /api/blogs/:id (Admin delete blog)
blogRouter.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await db.deleteBlog(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    res.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Failed to delete blog' });
  }
});
