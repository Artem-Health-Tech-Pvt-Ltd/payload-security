            import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import RsaCryptoUtil from './src/utils/RsaCryptoUtil.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Payload Crypto Tool is running' });
});

// Get available environments
app.get('/api/environments', (req, res) => {
  const environments = RsaCryptoUtil.getAvailableEnvironments();
  const environmentStatus = environments.map(env => ({
    name: env,
    configured: RsaCryptoUtil.isEnvironmentConfigured(env)
  }));

  res.json({
    success: true,
    environments: environmentStatus,
    totalEnvironments: environments.length,
    configuredEnvironments: environmentStatus.filter(e => e.configured).length
  });
});

/**
 * POST /api/encrypt
 * Encrypts plain JSON payload using hybrid AES+RSA
 * Request body: { payload: "JSON string or object", environment: "DEV" }
 * Response: { data: "...", iv: "...", key: "..." }
 */
app.post('/api/encrypt', (req, res) => {
  try {
    const { payload, environment = 'DEV' } = req.body;

    if (!payload) {
      return res.status(400).json({ error: 'Payload is required' });
    }

    // Check if environment is configured
    if (!RsaCryptoUtil.isEnvironmentConfigured(environment)) {
      return res.status(400).json({ 
        error: `Keys not configured for environment: ${environment}`,
        availableEnvironments: RsaCryptoUtil.getAvailableEnvironments()
      });
    }

    // Create crypto util for the specified environment
    const envCryptoUtil = RsaCryptoUtil.createForEnvironment(environment);

    // Convert payload to string if it's an object
    const plainText = typeof payload === 'string' ? payload : JSON.stringify(payload);

    // Encrypt
    const encrypted = envCryptoUtil.encrypt(plainText);

    res.json({
      success: true,
      encrypted,
      environment,
      message: `Payload encrypted successfully for ${environment}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/decrypt
 * Decrypts encrypted payload
 * Request body: { encrypted: { data: "...", iv: "...", key: "..." }, environment: "DEV" }
 * Response: { decrypted: "plain JSON" }
 */
app.post('/api/decrypt', (req, res) => {
  try {
    const { encrypted, environment = 'DEV' } = req.body;

    if (!encrypted || !encrypted.data || !encrypted.iv || !encrypted.key) {
      return res.status(400).json({ error: 'Invalid encrypted payload structure' });
    }

    // Check if environment is configured
    if (!RsaCryptoUtil.isEnvironmentConfigured(environment)) {
      return res.status(400).json({ 
        error: `Keys not configured for environment: ${environment}`,
        availableEnvironments: RsaCryptoUtil.getAvailableEnvironments()
      });
    }

    // Create crypto util for the specified environment
    const envCryptoUtil = RsaCryptoUtil.createForEnvironment(environment);

    // Decrypt
    let decrypted;
    try {
      decrypted = envCryptoUtil.decrypt(encrypted);
    } catch (decryptError) {
      console.error('Decryption error details:', {
        error: decryptError.message,
        stack: decryptError.stack,
        environment,
        encryptedKeys: Object.keys(encrypted)
      });
      throw decryptError;
    }

    // Try to parse as JSON, otherwise return as string
    let parsedData;
    try {
      parsedData = JSON.parse(decrypted);
    } catch (e) {
      parsedData = decrypted;
    }

    res.json({
      success: true,
      decrypted: parsedData,
      environment,
      message: `Payload decrypted successfully from ${environment}`,
    });
  } catch (error) {
    console.error('Decrypt endpoint error:', error.message);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

/**
 * POST /api/postman-encrypt
 * Postman script endpoint - encrypts payload and returns in Postman-friendly format
 * Request body: { payload: "...", environment: "DEV" }
 */
app.post('/api/postman-encrypt', (req, res) => {
  try {
    const { payload, environment = 'DEV' } = req.body;

    if (!payload) {
      return res.status(400).json({ error: 'Payload is required' });
    }

    // Check if environment is configured
    if (!RsaCryptoUtil.isEnvironmentConfigured(environment)) {
      return res.status(400).json({ 
        error: `Keys not configured for environment: ${environment}`,
        availableEnvironments: RsaCryptoUtil.getAvailableEnvironments()
      });
    }

    // Create crypto util for the specified environment
    const envCryptoUtil = RsaCryptoUtil.createForEnvironment(environment);

    const plainText = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const encrypted = envCryptoUtil.encrypt(plainText);

    // Return in format suitable for Postman
    const postmanPayload = {
      payload: encrypted,
    };

    res.json({
      success: true,
      postmanPayload,
      environment,
      curlExample: `curl -X POST http://localhost:3000/api/decrypt -H "Content-Type: application/json" -d '${JSON.stringify(postmanPayload)}'`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Payload Crypto Tool running on http://localhost:${PORT}`);
  console.log(`📝 Frontend: http://localhost:${PORT}`);
  console.log(`🔐 API: http://localhost:${PORT}/api`);
});
