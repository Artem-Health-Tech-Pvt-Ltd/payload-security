# Multi-Environment Configuration Guide

## Overview

The Payload Crypto Tool now supports multiple environments with separate encryption keys:
- **DEV** ✅ (Pre-configured)
- **QA** (Empty - configure when needed)
- **UAT** (Empty - configure when needed)
- **PRUN** (Empty - configure when needed)
- **LIVE** (Empty - configure when needed)

## How It Works

1. **Environment Selection**: Users select an environment from the dropdown in the web UI
2. **Key Management**: Each environment uses its own RSA key pair
3. **Automatic Encryption**: When encrypting, the selected environment's keys are used
4. **API Integration**: All API calls include the selected environment

## Configuring Keys

### Step 1: Generate RSA Keys for Each Environment

For each environment (QA, UAT, PRUN, LIVE), generate a new RSA key pair:

```bash
# Generate private key
openssl genrsa -out private_key.pem 2048

# Generate public key from private key
openssl rsa -in private_key.pem -pubout -out public_key.pem
```

### Step 2: Update Environment Config

Edit `src/config/env-keys-config.js`:

```javascript
const environmentConfig = {
  DEV: {
    privateKey: `-----BEGIN PRIVATE KEY-----
[Your DEV private key content here]
-----END PRIVATE KEY-----`,
    publicKey: `-----BEGIN PUBLIC KEY-----
[Your DEV public key content here]
-----END PUBLIC KEY-----`
  },
  QA: {
    privateKey: `-----BEGIN PRIVATE KEY-----
[Your QA private key content here]
-----END PRIVATE KEY-----`,
    publicKey: `-----BEGIN PUBLIC KEY-----
[Your QA public key content here]
-----END PUBLIC KEY-----`
  },
  // ... repeat for UAT, PRUN, LIVE
};
```

### Step 3: Format Keys Correctly

⚠️ **Important**: Keys must be in PEM format with newlines properly escaped:

✅ Correct format:
```javascript
privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
[rest of key]
-----END PRIVATE KEY-----`
```

❌ Wrong (no line breaks):
```javascript
privateKey: `-----BEGIN PRIVATE KEY-----MIIEvQIBADANBgkqhkiG9w0...-----END PRIVATE KEY-----`
```

### Step 4: Update Backend Service Keys

For each microservice, update `application-local.yml` to match the DEV keys:

```yaml
encryption:
  private-key: |
    -----BEGIN PRIVATE KEY-----
    [Same as env-keys-config.js DEV privateKey]
    -----END PRIVATE KEY-----
  public-key: |
    -----BEGIN PUBLIC KEY-----
    [Same as env-keys-config.js DEV publicKey]
    -----END PUBLIC KEY-----
```

## Environment Status Indicators

### In the UI

- ✅ **Green (Configured)**: Environment has keys configured and is ready to use
- ⚠️ **Yellow (Not Configured)**: Environment is disabled until keys are added
- ⚠️ Disabled options cannot be selected

### In the Console

Run in browser console to check status:
```javascript
fetch('http://localhost:3000/api/environments')
  .then(r => r.json())
  .then(data => console.table(data.environments))
```

Output example:
```
┌─────────────┬────────────┬─────────────────────────────────┐
│ (index)     │ name       │ configured                      │
├─────────────┼────────────┼─────────────────────────────────┤
│ 0           │ 'DEV'      │ true                            │
│ 1           │ 'QA'       │ false                           │
│ 2           │ 'UAT'      │ false                           │
│ 3           │ 'PRUN'     │ false                           │
│ 4           │ 'LIVE'     │ false                           │
└─────────────┴────────────┴─────────────────────────────────┘
```

## API Usage with Environments

### Encryption Endpoint

```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"name": "John", "email": "john@example.com"},
    "environment": "DEV"
  }'
```

Response:
```json
{
  "success": true,
  "environment": "DEV",
  "encrypted": {
    "data": "base64-encoded-data",
    "iv": "base64-encoded-iv",
    "key": "base64-encoded-key"
  },
  "message": "Payload encrypted successfully for DEV"
}
```

### Decryption Endpoint

```bash
curl -X POST http://localhost:3000/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted": {
      "data": "...",
      "iv": "...",
      "key": "..."
    },
    "environment": "DEV"
  }'
```

### Get Environments Endpoint

```bash
curl http://localhost:3000/api/environments
```

Response:
```json
{
  "success": true,
  "environments": [
    { "name": "DEV", "configured": true },
    { "name": "QA", "configured": false },
    { "name": "UAT", "configured": false },
    { "name": "PRUN", "configured": false },
    { "name": "LIVE", "configured": false }
  ],
  "totalEnvironments": 5,
  "configuredEnvironments": 1
}
```

## Postman Integration with Environments

### Update Pre-Request Script

Add environment parameter:

```javascript
pm.sendRequest({
    url: 'http://localhost:3000/api/postman-encrypt',
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: { 
        mode: 'raw', 
        raw: JSON.stringify({ 
            payload,
            environment: pm.environment.get('CURRENT_ENVIRONMENT') || 'DEV'
        }) 
    }
}, function(err, response) {
    // ... rest of script
});
```

### Set Environment Variable in Postman

Add this to your Postman environment:
```
CURRENT_ENVIRONMENT = DEV
```

Then update it based on which environment you're testing against.

## Troubleshooting

### Error: "Keys not configured for environment: QA"

**Cause**: You selected QA but haven't added keys yet

**Solution**:
1. Generate RSA keys for QA
2. Add them to `src/config/env-keys-config.js`
3. Restart the Node.js tool: `npm start`

### Decryption fails for QA payload in DEV

**Cause**: Using different environment keys

**Solution**: Make sure to:
1. Encrypt with QA environment key
2. Decrypt with QA environment key (same key pair)

### Keys are empty but environment shows as "Configured"

**Cause**: Empty strings are still evaluated as configured

**Fix**: Either delete the environment from config OR add actual keys

## Key Rotation

To rotate keys for an environment:

1. Generate new RSA keys
2. Update `env-keys-config.js` with new keys
3. Update backend service `application-local.yml` with new DEV keys
4. Restart both tool and service
5. Re-encrypt all payloads with new keys

## Security Best Practices

⚠️ **Important**:
- Never commit actual keys to Git
- Use environment variables or secrets manager for production
- Rotate keys regularly
- Use different key pairs for each environment
- Keep private keys secure and never share

## Future: Use Environment Variables

For production deployment, replace hardcoded keys with environment variables:

```javascript
const environmentConfig = {
  DEV: {
    privateKey: process.env.DEV_PRIVATE_KEY,
    publicKey: process.env.DEV_PUBLIC_KEY
  },
  QA: {
    privateKey: process.env.QA_PRIVATE_KEY,
    publicKey: process.env.QA_PUBLIC_KEY
  },
  // ... etc
};
```

Then set via `.env` file or deployment secrets.
