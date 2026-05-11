const express = require('express');
const router = express.Router();
const pool = require('../db');
const verifyToken = require('../middleware/auth');

// submit a claim
router.post('/:itemId', verifyToken, async (req, res) => {
  const { proof_text, proof_photo_url } = req.body;
  const { itemId } = req.params;

  if (!proof_text) {
    return res.status(400).json({ error: 'Please describe why this item is yours' });
  }

  try {
    // To make sure item exists
    const item = await pool.query('SELECT * FROM items WHERE id = $1', [itemId]);
    if (item.rows.length === 0) return res.status(404).json({ error: 'Item not found' });

    // To make sure you can't claim your own item
    if (item.rows[0].user_id === req.user.id) {
      return res.status(400).json({ error: 'You cannot claim your own post' });
    }

    // To check if already claimed this item
    const existing = await pool.query(
      'SELECT id FROM claims WHERE item_id = $1 AND claimant_id = $2',
      [itemId, req.user.id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already submitted a claim for this item' });
    }

    const result = await pool.query(
      `INSERT INTO claims (item_id, claimant_id, proof_text, proof_photo_url)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [itemId, req.user.id, proof_text, proof_photo_url]
    );

    // notify the item owner
    const io = req.app.get('io');
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, item_id)
       VALUES ($1, $2, $3, $4)`,
      [
        item.rows[0].user_id,
        'claim_received',
        `${req.user.name} submitted a claim for your item: ${item.rows[0].title}`,
        itemId
      ]
    );

    io.to(`user_${item.rows[0].user_id}`).emit('notification', {
      message: `${req.user.name} submitted a claim for your item: ${item.rows[0].title}`
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TO get claims for an item 
router.get('/:itemId', verifyToken, async (req, res) => {
  try {
    const item = await pool.query('SELECT * FROM items WHERE id = $1', [req.params.itemId]);
    if (item.rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    if (item.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the item owner can view claims' });
    }

    const result = await pool.query(
      `SELECT claims.*, users.name AS claimant_name, users.email AS claimant_email
       FROM claims
       JOIN users ON claims.claimant_id = users.id
       WHERE claims.item_id = $1
       ORDER BY claims.created_at DESC`,
      [req.params.itemId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TO approve a claim (owner only)
router.put('/:claimId/approve', verifyToken, async (req, res) => {
  try {
    const claim = await pool.query(
      `SELECT claims.*, items.user_id AS owner_id, items.title AS item_title
       FROM claims JOIN items ON claims.item_id = items.id
       WHERE claims.id = $1`,
      [req.params.claimId]
    );

    if (claim.rows.length === 0) return res.status(404).json({ error: 'Claim not found' });
    if (claim.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the item owner can approve claims' });
    }

    const { item_id, claimant_id, item_title } = claim.rows[0];

    // TO approve this claim
    await pool.query('UPDATE claims SET status = $1 WHERE id = $2', ['approved', req.params.claimId]);

    // TO reject all other claims on the same item
    await pool.query(
      'UPDATE claims SET status = $1 WHERE item_id = $2 AND id != $3',
      ['rejected', item_id, req.params.claimId]
    );

    // TO mark item as claimed
    await pool.query('UPDATE items SET status = $1 WHERE id = $2', ['claimed', item_id]);

    // TO notify the claimant
    const io = req.app.get('io');
    await pool.query(
      `INSERT INTO notifications (user_id, type, message, item_id)
       VALUES ($1, $2, $3, $4)`,
      [claimant_id, 'claim_approved', `Your claim for "${item_title}" was approved!`, item_id]
    );

    io.to(`user_${claimant_id}`).emit('notification', {
      message: `Your claim for "${item_title}" was approved!`
    });

    res.json({ message: 'Claim approved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// TO reject a claim (owner only)
router.put('/:claimId/reject', verifyToken, async (req, res) => {
  try {
    const claim = await pool.query(
      `SELECT claims.*, items.user_id AS owner_id
       FROM claims JOIN items ON claims.item_id = items.id
       WHERE claims.id = $1`,
      [req.params.claimId]
    );

    if (claim.rows.length === 0) return res.status(404).json({ error: 'Claim not found' });
    if (claim.rows[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'Only the item owner can reject claims' });
    }

    await pool.query('UPDATE claims SET status = $1 WHERE id = $2', ['rejected', req.params.claimId]);
    res.json({ message: 'Claim rejected' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;