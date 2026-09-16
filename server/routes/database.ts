import express from 'express';
import { db } from '../db/store.ts';
import { mongoService } from '../db/mongo.ts';
import { requireAuth } from './auth.ts';

export const databaseRouter = express.Router();

// GET /api/database/status (MongoDB connection status & metrics)
databaseRouter.get('/status', async (req, res) => {
  try {
    const status = await db.getMongoStatus();
    res.json({
      success: true,
      status,
      activeDriver: status.isConnected ? 'MongoDB (Cluster)' : 'Persistent Local Store (Fallback)',
      databaseName: status.dbName,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to check database status'
    });
  }
});

// POST /api/database/sync (Push all local data to MongoDB)
databaseRouter.post('/sync', requireAuth, async (req, res) => {
  try {
    const result = await db.syncToMongo();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to sync to MongoDB'
    });
  }
});

// POST /api/database/pull (Pull MongoDB data into store)
databaseRouter.post('/pull', requireAuth, async (req, res) => {
  try {
    const result = await db.pullFromMongo();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || 'Failed to pull from MongoDB'
    });
  }
});

// POST /api/database/test (Test connection to MongoDB)
databaseRouter.post('/test', requireAuth, async (req, res) => {
  try {
    const { uri } = req.body;
    if (uri && typeof uri === 'string') {
      process.env.MONGODB_URI = uri.trim();
    }
    const { db: connectedDb } = await mongoService.connect(true);
    const status = await mongoService.getStatus();
    
    if (connectedDb && status.isConnected) {
      // Also automatically trigger initial sync
      await db.syncToMongo();
      res.json({
        success: true,
        message: `Connected successfully to MongoDB database "${status.dbName}" (ping: ${status.pingMs}ms). Initial collections verified and synchronized.`,
        status
      });
    } else {
      res.status(400).json({
        success: false,
        message: status.message || 'Could not connect to MongoDB cluster.',
        status
      });
    }
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.message || 'Failed to test MongoDB connection'
    });
  }
});
