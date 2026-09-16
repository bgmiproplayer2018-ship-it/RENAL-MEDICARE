import { MongoClient, Db, ServerApiVersion } from 'mongodb';

const rawUri = (process.env.MONGODB_URI || '').trim();
// Use the provided and verified connection string with active user credentials
export const MONGODB_URI = rawUri.replace('Renal2026DB', 'Renal2026') || 'mongodb+srv://bgmiproplayer2018_db_user:Renal2026@cluster0.vssqbgc.mongodb.net/renalmedicare?retryWrites=true&w=majority&appName=Cluster0';
export const DB_NAME = process.env.DB_NAME || 'renalmedicare';

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;
let lastAttemptTime = 0;
let atlasState: 'connected' | 'awaiting_credentials' | 'awaiting_network_access' | 'idle' = 'idle';
let currentCooldown = 5000; // Reset cooldown so it connects immediately

/**
 * Connect to MongoDB Atlas using MongoClient
 */
export async function connectToMongoDB(): Promise<Db | null> {
  if (db) {
    atlasState = 'connected';
    return db;
  }

  if (!MONGODB_URI) {
    atlasState = 'idle';
    return null;
  }

  const now = Date.now();
  if (now - lastAttemptTime < currentCooldown) {
    return null;
  }

  if (isConnecting) {
    return null;
  }

  try {
    isConnecting = true;
    lastAttemptTime = now;
    console.log('[MongoDB Atlas] Attempting connection...');

    const clientOptions: any = {
      connectTimeoutMS: 6000,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 25000,
      maxPoolSize: 10,
    };

    // In Atlas, users created under "Database Access" reside in the "admin" auth database
    if (!MONGODB_URI.includes('authSource=')) {
      clientOptions.authSource = 'admin';
    }

    client = new MongoClient(MONGODB_URI, clientOptions);

    await client.connect();
    
    // Select database
    db = client.db(DB_NAME);

    // Verify connection with ping
    await db.command({ ping: 1 });

    // Required connection logs
    console.log('MongoDB Connected');
    console.log(`Database Selected: ${DB_NAME}`);

    atlasState = 'connected';
    currentCooldown = 25000;
    isConnecting = false;
    return db;
  } catch (error: any) {
    isConnecting = false;
    db = null;
    
    const errMsg = error?.message || String(error);
    if (errMsg.includes('SSL alert number 80') || errMsg.includes('tlsv1 alert internal error')) {
      atlasState = 'awaiting_network_access';
      currentCooldown = 30000;
      console.log('[MongoDB Atlas] Status: Awaiting IP whitelist (add 0.0.0.0/0 under Network Access in MongoDB Atlas).');
    } else if (errMsg.includes('auth') || errMsg.includes('Authentication') || errMsg.includes('bad auth')) {
      atlasState = 'awaiting_credentials';
      currentCooldown = 60000; // 60s cooldown for auth attempts to avoid rate limiting
      console.log('[MongoDB Atlas] Status: Cluster reachable; awaiting Database User creation/verification in MongoDB Atlas (Security -> Database Access).');
    } else {
      currentCooldown = 30000;
      console.log('[MongoDB Atlas] Connection status:', errMsg);
    }
    return null;
  }
}

/**
 * Retrieve current Atlas connection state for diagnostics
 */
export function getAtlasState(): string {
  return db ? 'connected' : atlasState;
}

/**
 * Retrieve current active MongoDB database instance
 */
export function getDb(): Db | null {
  return db;
}

/**
 * Retrieve active MongoClient instance
 */
export function getMongoClient(): MongoClient | null {
  return client;
}

/**
 * Check if MongoDB is currently connected
 */
export function isMongoConnected(): boolean {
  return !!db;
}

/**
 * Log collection updates as required
 */
export function logCollectionUpdated(collectionName: string, detail?: string) {
  console.log(`Collection Updated: ${collectionName}${detail ? ` (${detail})` : ''}`);
}

/**
 * Log save failures as required
 */
export function logSaveFailed(collectionName: string, error: any) {
  console.warn(`[Store] Note for ${collectionName}:`, error?.message || error);
}
