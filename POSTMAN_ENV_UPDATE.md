# Postman Multi-Environment Integration - Done ✅

## What Changed

The Postman pre-request script now **automatically sends the environment parameter** to the encryption tool API.

### Before
```javascript
body: { 
    payload  // No environment specified
}
```

### After
```javascript
body: { 
    payload,
    environment  // ← Tells API which keys to use (DEV/QA/UAT/PRUN/LIVE)
}
```

## How to Use

### 1 Minute Setup

**Add to Postman Environment:**
```
ENVIRONMENT = DEV
```

**Add to Pre-Request Script:**
```javascript
const encryptionToolUrl = "http://localhost:3000";
const environment = pm.environment.get("ENVIRONMENT") || "DEV";

pm.sendRequest({
    url: `${encryptionToolUrl}/api/postman-encrypt`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: { 
        mode: 'raw', 
        raw: JSON.stringify({ 
            payload,
            environment  // ← Passes environment to API
        }) 
    }
}, ...);
```

**Click Send** → Script automatically encrypts with DEV keys ✅

## Switch Environments

Just change the Postman variable:
```
ENVIRONMENT = DEV    → Uses DEV keys
ENVIRONMENT = QA     → Uses QA keys (when configured)
ENVIRONMENT = UAT    → Uses UAT keys (when configured)
```

All requests automatically use the correct keys!

## API Endpoint Updates

### Encrypt Endpoint
```bash
POST /api/postman-encrypt
{
  "payload": {...},
  "environment": "DEV"  # NEW parameter
}
```

### Decrypt Endpoint
```bash
POST /api/decrypt
{
  "encrypted": {...},
  "environment": "DEV"  # NEW parameter
}
```

### Main Encrypt Endpoint
```bash
POST /api/encrypt
{
  "payload": {...},
  "environment": "DEV"  # NEW parameter
}
```

## Documentation Files

- **POSTMAN_QUICK_START.md** - Quick setup (30 seconds)
- **POSTMAN_MULTI_ENV.md** - Complete multi-environment guide
- **POSTMAN_SETUP.md** - Detailed step-by-step (if needed)

## Real Example

**Postman Environment:**
```
ENCRYPTION_TOOL_URL = http://localhost:3000
SERVICE_URL = http://localhost:9007
ENVIRONMENT = DEV
```

**Request:**
```
POST {{SERVICE_URL}}/api/users
{
  "name": "John",
  "email": "john@example.com"
}
```

**What Happens:**
1. Pre-request script reads `ENVIRONMENT = DEV`
2. Calls `/api/postman-encrypt` with `environment: "DEV"`
3. Tool uses DEV's RSA keys to encrypt
4. Request body replaced with encrypted payload
5. Sends to backend
6. Backend decrypts using same DEV keys ✅

## Console Output

When you send a request, Postman Console shows:

```
🔐 Using environment: DEV
📤 Encrypting payload for DEV...
✅ Payload encrypted with DEV keys! Ready to send.
```

## Error Handling

| Scenario | Error | Fix |
|----------|-------|-----|
| QA not configured | `Keys not configured for environment: QA` | Use DEV or add QA keys |
| Missing variable | `ENVIRONMENT not set` | Add `ENVIRONMENT = DEV` to Postman |
| Tool offline | `Connection error` | Start tool: `npm start` |

## Files Updated

- ✅ `server.js` - All endpoints accept `environment` parameter
- ✅ `src/utils/RsaCryptoUtil.js` - Environment-based key loading
- ✅ `src/config/env-keys-config.js` - Configuration for all 5 environments
- ✅ `POSTMAN_QUICK_START.md` - Updated script with environment support
- ✅ `POSTMAN_MULTI_ENV.md` - Complete multi-environment guide

## Testing

### Test DEV Environment
1. Set `ENVIRONMENT = DEV` in Postman
2. Write JSON body
3. Click Send
4. Check Postman Console - should see ✅ success message

### Test Environment Switching
1. Change `ENVIRONMENT = QA` in Postman
2. Try to send request
3. Should error: `Keys not configured for environment: QA` (expected since QA not yet configured)
4. Change back to `ENVIRONMENT = DEV` 
5. Send again - works ✅

## Next: Add More Environments

When you're ready to add QA keys:

1. Generate QA keys (same process as DEV)
2. Add to `src/config/env-keys-config.js` under QA
3. Restart tool: `npm start`
4. Set `ENVIRONMENT = QA` in Postman
5. All requests now use QA keys automatically ✅

---

**Status: Complete!** ✅

Postman now has full multi-environment encryption support. Users can switch environments by simply changing one Postman variable.
