# Multi-Environment Tool - Quick Reference

## User: Select Environment Before Encrypting ✅

1. Open http://localhost:3000
2. **Select from dropdown**: DEV / QA / UAT / PRUN / LIVE
3. ✅ Green badge = Ready to use
4. ⚠️ Grayed out = Not configured yet
5. Type your JSON → Click Encrypt/Decrypt

## Admin: Add New Environment Keys

**File to edit**: `src/config/env-keys-config.js`

### Steps:

1. Generate keys:
   ```bash
   openssl genrsa -out env_private.pem 2048
   openssl rsa -in env_private.pem -pubout -out env_public.pem
   ```

2. Copy private and public keys to `env-keys-config.js`:
   ```javascript
   QA: {
     privateKey: `-----BEGIN PRIVATE KEY-----
[Your key here - keep line breaks]
-----END PRIVATE KEY-----`,
     publicKey: `-----BEGIN PUBLIC KEY-----
[Your key here - keep line breaks]
-----END PUBLIC KEY-----`
   }
   ```

3. Restart tool: `npm start`

4. Dropdown now shows QA ✅

5. **Update backend** `application-local.yml` with **DEV keys** (for now)

## API Examples

### Encrypt (Specifying Environment)
```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{
    "payload": {"name": "John"},
    "environment": "DEV"
  }'
```

### Decrypt (Specifying Environment)
```bash
curl -X POST http://localhost:3000/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{
    "encrypted": {...},
    "environment": "DEV"
  }'
```

### Check Available Environments
```bash
curl http://localhost:3000/api/environments
```

## Current Status

| Environment | Status |
|-------------|--------|
| DEV | ✅ Ready |
| QA | ⚠️ Empty |
| UAT | ⚠️ Empty |
| PRUN | ⚠️ Empty |
| LIVE | ⚠️ Empty |

## Structure

```
payload-crypto-tool/
├── src/
│   ├── config/
│   │   └── env-keys-config.js ← EDIT THIS TO ADD ENVIRONMENTS
│   └── utils/
│       └── RsaCryptoUtil.js
├── public/
│   ├── index.html (environment dropdown added)
│   ├── script.js (environment handling)
│   └── style.css (dropdown styling)
├── server.js (all endpoints updated)
├── ENVIRONMENT_CONFIGURATION.md ← Full guide
└── MULTI_ENV_SUMMARY.md ← Overview
```

## Postman

Pre-request script automatically sends selected environment. No changes needed if using defaults.

To override:
```javascript
environment: pm.environment.get('MY_ENV') || 'DEV'
```

---

**That's it!** 🚀 Environment support is fully integrated. Start with DEV, add others as needed!
