# Postman Multi-Environment Encryption Guide

## Updated Script Features

The Postman pre-request script now **automatically detects and uses the correct encryption keys** for different environments.

### What's New

```javascript
const environment = pm.environment.get("ENVIRONMENT") || "DEV";
// ... passes environment to API:
body: { 
    payload,
    environment  // ← NEW: Sends environment to /api/postman-encrypt
}
```

## Setup Instructions

### Step 1: Add Environment Variable

In Postman, create/edit your environment and add:

```
Variable Name: ENVIRONMENT
Value: DEV
```

Or for different environments:
```
ENVIRONMENT = DEV    (uses DEV keys)
ENVIRONMENT = QA     (uses QA keys when configured)
ENVIRONMENT = UAT    (uses UAT keys when configured)
ENVIRONMENT = PRUN   (uses PRUN keys when configured)
ENVIRONMENT = LIVE   (uses LIVE keys when configured)
```

### Step 2: Copy Updated Pre-Request Script

Paste this in your request's **Pre-request Script** tab:

```javascript
// ===== AUTO-ENCRYPT WITH ENVIRONMENT SUPPORT =====
const encryptionToolUrl = "http://localhost:3000";
const environment = pm.environment.get("ENVIRONMENT") || "DEV";

console.log(`🔐 Using environment: ${environment}`);

if (!environment) {
    console.error("❌ ENVIRONMENT not set in Postman environment!");
    postman.setNextRequest(null);
    return;
}

const requestBody = pm.request.body.raw;

if (!requestBody) {
    console.warn("⚠️ Empty request body, skipping encryption");
    return;
}

let payload;
try {
    payload = JSON.parse(requestBody);
} catch (e) {
    payload = requestBody;
}

console.log(`📤 Encrypting payload for ${environment}...`, payload);

pm.sendRequest({
    url: `${encryptionToolUrl}/api/postman-encrypt`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: { 
        mode: 'raw', 
        raw: JSON.stringify({ 
            payload,
            environment  // Send environment to API
        }) 
    }
}, function(err, response) {
    if (err) {
        console.error("❌ Encryption failed:", err);
        postman.setNextRequest(null);
        return;
    }

    try {
        const data = response.json();
        
        if (data.success && data.postmanPayload) {
            pm.request.body.raw = JSON.stringify(data.postmanPayload);
            console.log(`✅ Payload encrypted with ${environment} keys! Ready to send.`);
            pm.environment.set("lastEncrypted", JSON.stringify(data.postmanPayload));
        } else {
            console.error("❌ Server error:", data.error);
            postman.setNextRequest(null);
        }
    } catch (e) {
        console.error("❌ Parse error:", e);
        postman.setNextRequest(null);
    }
});
```

### Step 3: Set Your Variables

Your Postman environment should have:

```
ENCRYPTION_TOOL_URL = http://localhost:3000
SERVICE_URL = http://localhost:9007  (or your actual service)
ENVIRONMENT = DEV                      (or QA/UAT/PRUN/LIVE)
```

### Step 4: Send Request

1. Write your JSON body
2. Click **Send**
3. Script automatically:
   - Reads `ENVIRONMENT` variable (DEV, QA, etc.)
   - Calls encryption tool with environment parameter
   - Encryption tool uses **environment-specific keys**
   - Replaces request body with encrypted payload
   - Sends to your service ✅

## API Endpoint Behavior

### Before (Without Environment)
```bash
POST /api/postman-encrypt
{
  "payload": {...}
}
# Used default DEV keys
```

### After (With Environment)
```bash
POST /api/postman-encrypt
{
  "payload": {...},
  "environment": "DEV"  ← Specifies which environment's keys to use
}
# Uses DEV, QA, UAT, PRUN, or LIVE keys depending on value
```

## Real-World Example

### Testing DEV Environment

**Postman Environment:**
```
ENVIRONMENT = DEV
SERVICE_URL = http://localhost:9007
```

**Request:**
- URL: `{{SERVICE_URL}}/api/users`
- Body: `{"name": "John", "email": "john@example.com"}`

**Console Output:**
```
🔐 Using environment: DEV
📤 Encrypting payload for DEV...
✅ Payload encrypted with DEV keys! Ready to send.
```

### Testing QA Environment

**Postman Environment:**
```
ENVIRONMENT = QA
SERVICE_URL = http://qa-server:9007
```

**Request:**
- URL: `{{SERVICE_URL}}/api/users`
- Body: `{"name": "John", "email": "john@example.com"}`

**Console Output:**
```
🔐 Using environment: QA
📤 Encrypting payload for QA...
✅ Payload encrypted with QA keys! Ready to send.
```

## How It Works

### Key Selection Flow

```
Postman Pre-Request Script
         ↓
Reads ENVIRONMENT variable
         ↓
Calls POST /api/postman-encrypt with { payload, environment }
         ↓
Node.js Tool receives request
         ↓
RsaCryptoUtil.createForEnvironment(environment)
         ↓
Loads environment-specific keys from env-keys-config.js
         ↓
Encrypts payload with that environment's RSA keys
         ↓
Returns encrypted payload
         ↓
Postman replaces request body
         ↓
Sends to backend service
         ↓
Backend decrypts using same environment keys ✅
```

## Error Handling

### Error: Keys not configured for environment: QA

**Cause**: You set `ENVIRONMENT = QA` but QA keys haven't been added to the tool yet

**Solution**:
1. Either change to `ENVIRONMENT = DEV` (only one with keys)
2. OR add QA keys to tool and restart

### Error: ENVIRONMENT not set in Postman environment!

**Cause**: `ENVIRONMENT` variable missing from Postman environment

**Solution**: Add to Postman environment:
```
ENVIRONMENT = DEV
```

## Multiple Services Example

You can use the same script for multiple services by only changing the `SERVICE_URL`:

```
// Service 1 (User API)
SERVICE_URL = http://localhost:9011
ENVIRONMENT = DEV

// Service 2 (Front Desk API)
SERVICE_URL = http://localhost:9007
ENVIRONMENT = DEV

// Service 3 (QA Testing)
SERVICE_URL = http://qa-server:9007
ENVIRONMENT = QA
```

All will automatically use the correct encryption keys!

## Postman Collection Variables

Quick reference of recommended variables:

| Variable | Example | Purpose |
|----------|---------|---------|
| `ENCRYPTION_TOOL_URL` | `http://localhost:3000` | Where encryption tool runs |
| `SERVICE_URL` | `http://localhost:9007` | Where backend service runs |
| `ENVIRONMENT` | `DEV` | Which encryption keys to use |
| `lastEncrypted` | (auto-set) | Last encrypted payload for debugging |

## Debugging

To see what's happening:

1. Open **Postman Console** (Ctrl+Alt+C)
2. Look for messages like:
   - `🔐 Using environment: DEV`
   - `📤 Encrypting payload for DEV...`
   - `✅ Payload encrypted with DEV keys! Ready to send.`
3. If errors, you'll see detailed error messages

## Switching Environments

To switch from DEV to QA:

1. Edit your Postman environment
2. Change: `ENVIRONMENT = QA`
3. All requests now use QA keys automatically
4. No script changes needed! ✅

---

**That's it!** The tool now supports multi-environment encryption with automatic key selection. 🚀
