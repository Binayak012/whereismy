const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

// To Get all items
router.get('/', async (req, res) => {
  const { type, category, status } = req.query;

  let query = `
    SELECT items.*, users.name AS poster_name
    FROM items
    JOIN users ON items.user_id = users.id
    WHERE 1=1
  `;
  const values = [];
  let count = 1;

  if (type) {
    query += ` AND items.type = $${count}`;
    values.push(type);
    count++;
  }
  if (category) {
    query += ` AND items.category = $${count}`;
    values.push(category);
    count++;
  }
  if (status) {
    query += ` AND items.status = $${count}`;
    values.push(status);
    count++;
  }

  query += ' ORDER BY items.created_at DESC';

  try {
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// To Get single item
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT items.*, users.name AS poster_name, users.email AS poster_email
       FROM items
       JOIN users ON items.user_id = users.id
       WHERE items.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// To Create item
router.post('/', verifyToken, async (req, res) => {
  const { type, title, description, category, photo_url, location_name, lat, lng } = req.body;

  if (!type || !title || !category) {
    return res.status(400).json({ error: 'Type, title and category are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO items (user_id, type, title, description, category, photo_url, location_name, lat, lng)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [req.user.id, type, title, description, category, photo_url, location_name, lat, lng]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// To Update item
router.put('/:id', verifyToken, async (req, res) => {
  const { title, description, category, location_name, lat, lng, status } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    const result = await pool.query(
      `UPDATE items
       SET title = $1, description = $2, category = $3,
           location_name = $4, lat = $5, lng = $6, status = $7
       WHERE id = $8
       RETURNING *`,
      [title, description, category, location_name, lat, lng, status, req.params.id]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// To Delete item 
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const existing = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    if (existing.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    await pool.query('DELETE FROM items WHERE id = $1', [req.params.id]);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;