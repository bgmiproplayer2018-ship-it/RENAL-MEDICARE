import express from 'express';
import jwt from 'jsonwebtoken';

export const authRouter = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'renal_medicity_jwt_secret_key_2026';
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@renalmedicity.com').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@RenalMedicity2026';

// Middleware to authenticate JWT
export const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Token missing.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }
};

// POST /api/auth/login
authRouter.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  
  if (cleanEmail === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { email: cleanEmail, role: 'admin', name: 'Dr. Medical Director' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      token,
      user: {
        email: cleanEmail,
        name: 'Dr. Medical Director',
        role: 'admin'
      }
    });
  }

  return res.status(401).json({ error: 'Invalid administrator credentials' });
});

// GET /api/auth/me
authRouter.get('/me', requireAuth, (req, res) => {
  return res.json({
    user: (req as any).user
  });
});
