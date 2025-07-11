import { sql } from '@vercel/postgres';
import jwt from 'jsonwebtoken';

function verifyToken(req) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw new Error('No token provided');
  return jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
}

export default async function handler(req, res) {
  try {
    const decoded = verifyToken(req);
    const userId = decoded.userId;

    if (req.method === 'GET') {
      const result = await sql`SELECT * FROM tasks WHERE user_id = ${userId} ORDER BY created_at DESC`;
      res.json(result.rows);
    }

    else if (req.method === 'POST') {
      const { text, date, frequency, endDate } = req.body;
      const result = await sql`
        INSERT INTO tasks (user_id, text, date, frequency, end_date)
        VALUES (${userId}, ${text}, ${date}, ${frequency || 'once'}, ${endDate || null})
        RETURNING *
      `;
      res.json(result.rows[0]);
    }

    else if (req.method === 'PUT') {
      const { id, text, date, frequency, endDate } = req.body;
      const result = await sql`
        UPDATE tasks 
        SET text = ${text}, date = ${date}, frequency = ${frequency}, end_date = ${endDate}
        WHERE id = ${id} AND user_id = ${userId}
        RETURNING *
      `;
      res.json(result.rows[0]);
    }

    else if (req.method === 'DELETE') {
      const { id } = req.query;
      await sql`DELETE FROM tasks WHERE id = ${id} AND user_id = ${userId}`;
      res.json({ success: true });
    }

    else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Tasks API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}