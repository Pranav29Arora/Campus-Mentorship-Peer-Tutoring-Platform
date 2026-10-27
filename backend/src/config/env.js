const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

module.exports = {
  PORT: process.env.PORT || 5001,
  JWT_SECRET: process.env.JWT_SECRET || 'campusconnect_jwt_secret_token_12345',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || 'campusconnect-demo',
  SUPABASE_URL: process.env.SUPABASE_URL || 'https://vxzbrmrnziaplrkbjhxc.supabase.co',
  SUPABASE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '',
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || ''
};

