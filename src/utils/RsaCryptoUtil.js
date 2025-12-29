import crypto from 'crypto';
import environmentConfig from '../config/env-keys-config.js';

class RsaCryptoUtil {
  // Private constructor - use static factory method
  constructor(privateKey, publicKey, environment) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.environment = environment;
  }

  // Static method to create instance for a specific environment
  static createForEnvironment(environment = 'DEV') {
    const config = environmentConfig[environment];
    
    if (!config) {
      throw new Error(`Unknown environment: ${environment}. Available: ${Object.keys(environmentConfig).join(', ')}`);
    }

    if (!config.privateKey || !config.publicKey) {
      throw new Error(`Keys not configured for environment: ${environment}`);
    }

    return new RsaCryptoUtil(config.privateKey, config.publicKey, environment);
  }

  // Get all available environments
  static getAvailableEnvironments() {
    return Object.keys(environmentConfig);
  }

  // Check if environment has keys configured
  static isEnvironmentConfigured(environment) {
    const config = environmentConfig[environment];
    return config && config.privateKey && config.publicKey;
  }

  /**
   * Encrypt data using Hybrid AES+RSA
   * 1. Generate AES-256 key
   * 2. Encrypt data with AES
   * 3. Base64 encode AES key, then encrypt with RSA (public key)
   */
  encrypt(plainText) {
    try {
      // 1. Generate AES-256 key
      const aesKey = crypto.randomBytes(32); // 256-bit key

      // 2. Generate random IV
      const iv = crypto.randomBytes(16);

      // 3. Encrypt data with AES
      const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
      let encrypted = cipher.update(plainText, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      // 4. Base64 encode AES key first, then encrypt with RSA
      // Java backend expects: RSA(Base64(aesKey))
      const aesKeyBase64 = aesKey.toString('base64');
      const rsaEncrypted = crypto.publicEncrypt(
        {
          key: this.publicKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        Buffer.from(aesKeyBase64, 'utf8')
      );

      return {
        data: encrypted,
        iv: Buffer.from(iv).toString('base64'),
        key: rsaEncrypted.toString('base64'),
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using Hybrid AES+RSA
   * 1. Decrypt AES key with RSA (private key), then Base64 decode
   * 2. Decrypt data with AES
   */
  decrypt(encryptedMap) {
    try {
      // Validate input
      if (!encryptedMap.key || !encryptedMap.iv || !encryptedMap.data) {
        throw new Error('Missing required fields: key, iv, or data');
      }

      if (!this.privateKey) {
        throw new Error('Private key not initialized');
      }

      // Step 1: Decrypt RSA-encrypted AES key (result is Base64 encoded)
      const encryptedKey = Buffer.from(encryptedMap.key, 'base64');
      const aesKeyBase64 = crypto.privateDecrypt(
        {
          key: this.privateKey,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        encryptedKey
      );

      // Step 2: Base64 decode to get raw AES key bytes
      const aesKey = Buffer.from(aesKeyBase64.toString('utf8'), 'base64');

      // Step 3: Decrypt data with AES
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        aesKey,
        Buffer.from(encryptedMap.iv, 'base64')
      );
      let decrypted = decipher.update(encryptedMap.data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }
}

export default RsaCryptoUtil;
