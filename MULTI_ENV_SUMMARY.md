# Multi-Environment Encryption Tool - Quick Summary

## What's New ✨

The Payload Crypto Tool now supports **5 environments**:
- **DEV** ✅ Configured (ready to use)
- **QA** ⚠️ Not configured yet
- **UAT** ⚠️ Not configured yet
- **PRUN** ⚠️ Not configured yet
- **LIVE** ⚠️ Not configured yet

## Updated Features

### 1. Environment Dropdown in UI
Select environment before encrypting/decrypting:
- Dropdown shows which environments are ready (✅) or need configuration (⚠️)
- Only configured environments can be selected
- Status indicator shows current environment

### 2. API Changes
All endpoints now accept `environment` parameter:

```javascript
// Encrypt with environment
POST /api/encrypt
{
  "payload": {...},
  "environment": "DEV"  // NEW
}

// Decrypt with environment
POST /api/decrypt
{
  "encrypted": {...},
  "environment": "DEV"  // NEW
}

// Postman encrypt with environment
POST /api/postman-encrypt
{
  "payload": {...},
  "environment": "DEV"  // NEW
}
```

### 3. Environment Status Endpoint
Check which environments are configured:

```bash
GET /api/environments
```

Response:
```json
{
  "environments": [
    { "name": "DEV", "configured": true },
    { "name": "QA", "configured": false },
    ...
  ]
}
```

## Configuration (For Admins)

### File to Edit: `src/config/env-keys-config.js`

Currently only DEV has keys. To add QA:

1. Generate RSA keys for QA:
   ```bash
   openssl genrsa -out qa_private.pem 2048
   openssl rsa -in qa_private.pem -pubout -out qa_public.pem
   ```

2. Open `src/config/env-keys-config.js` and add keys:
   ```javascript
   QA: {
     privateKey: `-----BEGIN PRIVATE KEY-----
     [paste your QA private key here]
     -----END PRIVATE KEY-----`,
     publicKey: `-----BEGIN PUBLIC KEY-----
     [paste your QA public key here]
     -----END PUBLIC KEY-----`
   }
   ```

3. Restart Node.js tool: `npm start`

4. Dropdown will now show QA ✅

5. Update backend `application-local.yml` with DEV keys (for now, only DEV is active)

## How Users Use It

### Via Web UI
1. Open http://localhost:3000
2. Select environment from dropdown (only shows configured ones)
3. Enter payload and click Encrypt
4. Environment's keys are used automatically ✅

### Via Postman
Pre-request script now sends environment:
```javascript
pm.sendRequest({
    url: 'http://localhost:3000/api/postman-encrypt',
    method: 'POST',
    body: JSON.stringify({ 
        payload,
        environment: 'DEV'  // Can be parameterized
    })
});
```

### Via cURL
```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"payload": {...}, "environment": "DEV"}'
```

## File Changes Made

| File | Change |
|------|--------|
| `src/config/env-keys-config.js` | NEW - Environment key configuration |
| `src/utils/RsaCryptoUtil.js` | Updated - Support environment-based keys |
| `server.js` | Updated - All endpoints accept environment param |
| `public/index.html` | Updated - Added environment dropdown selector |
| `public/style.css` | Updated - Styling for environment selector |
| `public/script.js` | Updated - Load environments, pass to API |
| `ENVIRONMENT_CONFIGURATION.md` | NEW - Complete configuration guide |

## Default Behavior

If `environment` parameter is not provided:
- **Web UI**: Uses selected environment from dropdown
- **API**: Defaults to "DEV"
- **Postman**: Can be set via environment variable

## Next Steps

1. ✅ DEV is ready - test with it
2. When QA is ready:
   - Generate QA keys
   - Add to `env-keys-config.js`
   - Restart tool
   - Select QA from dropdown
3. Repeat for UAT, PRUN, LIVE

## Files to Know

- **Configuration**: `src/config/env-keys-config.js`
- **Encryption Logic**: `src/utils/RsaCryptoUtil.js`
- **API Server**: `server.js`
- **Frontend**: `public/index.html`, `public/script.js`, `public/style.css`
- **Documentation**: `ENVIRONMENT_CONFIGURATION.md`

## Testing

### Test DEV Environment
```bash
# 1. Open http://localhost:3000
# 2. DEV should be in dropdown with ✅ (selected by default)
# 3. Type JSON in Encrypt field
# 4. Click Encrypt
# 5. Copy encrypted payload
# 6. Paste in Decrypt field
# 7. Click Decrypt - should get original JSON back ✅
```

### Check Environments
Open browser console and run:
```javascript
fetch('http://localhost:3000/api/environments')
  .then(r => r.json())
  .then(d => console.table(d.environments))
```

Should show DEV as configured, rest not configured.

---

**Ready to add more environments?** See `ENVIRONMENT_CONFIGURATION.md` for detailed instructions!
