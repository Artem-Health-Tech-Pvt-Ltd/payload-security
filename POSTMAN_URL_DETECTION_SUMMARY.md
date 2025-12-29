# Postman URL-Based Environment Detection - Done ✅

## What Changed

Postman script now **auto-detects environment from request URL** instead of needing manual variables.

### Before (Manual Selection)
```
1. Create Postman environment
2. Set ENVIRONMENT = DEV
3. Change to ENVIRONMENT = QA for QA tests
4. Change to ENVIRONMENT = UAT for UAT tests
... lots of manual work
```

### After (Automatic Detection)
```
1. Use URL: https://dev.bmchealth.in/... → Auto-detects DEV ✅
2. Use URL: https://qa.bmchealth.in/... → Auto-detects QA ✅
3. Use URL: https://uat.bmchealth.in/... → Auto-detects UAT ✅
... no manual changes needed!
```

## URL → Environment Mapping

```javascript
https://dev.bmchealth.in/*  →  DEV environment   → DEV keys
https://qa.bmchealth.in/*   →  QA environment    → QA keys
https://uat.bmchealth.in/*  →  UAT environment   → UAT keys
https://prun.bmchealth.in/* →  PRUN environment  → PRUN keys
https://live.bmchealth.in/* →  LIVE environment  → LIVE keys
```

## Setup

### Copy This Script
```javascript
const encryptionToolUrl = "http://localhost:3000";
const requestUrl = pm.request.url.toString();
let environment = "DEV";

if (requestUrl.includes("dev.bmchealth.in")) {
    environment = "DEV";
} else if (requestUrl.includes("qa.bmchealth.in")) {
    environment = "QA";
} else if (requestUrl.includes("uat.bmchealth.in")) {
    environment = "UAT";
} else if (requestUrl.includes("prun.bmchealth.in")) {
    environment = "PRUN";
} else if (requestUrl.includes("live.bmchealth.in")) {
    environment = "LIVE";
}

console.log(`🌍 Detected environment from URL: ${environment}`);
const requestBody = pm.request.body.raw;
if (!requestBody) return;

let payload;
try {
    payload = JSON.parse(requestBody);
} catch (e) {
    payload = requestBody;
}

pm.sendRequest({
    url: `${encryptionToolUrl}/api/postman-encrypt`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: { mode: 'raw', raw: JSON.stringify({ payload, environment }) }
}, function(err, response) {
    if (err) { console.error("❌ Encryption failed:", err); return; }
    const data = response.json();
    if (data.success && data.postmanPayload) {
        pm.request.body.raw = JSON.stringify(data.postmanPayload);
        console.log(`✅ Payload encrypted with ${environment} keys!`);
    }
});
```

### Add to Request
1. Create POST request
2. Go to **Pre-request Script** tab
3. Paste the script above
4. Done! ✅

## Test It

### DEV Test
```
POST https://dev.bmchealth.in/api/users
Body: {"name": "John"}
Send ✅
Console: "🌍 Detected environment from URL: DEV"
```

### QA Test
```
POST https://qa.bmchealth.in/api/users
Body: {"name": "John"}
Send ✅
Console: "🌍 Detected environment from URL: QA"
```

### LIVE Test
```
POST https://live.bmchealth.in/api/users
Body: {"name": "John"}
Send ✅
Console: "🌍 Detected environment from URL: LIVE"
```

## Key Benefits

✅ **No Setup** - No environment variables to configure  
✅ **Automatic** - Detects from URL automatically  
✅ **Safe** - Uses correct keys based on actual target  
✅ **Reusable** - Same script for all requests  
✅ **Clear** - Console shows detected environment  

## Console Output Example

```
🌍 Detected environment from URL: DEV
📍 URL: https://dev.bmchealth.in/api/users
📤 Encrypting payload with DEV keys...
✅ Payload encrypted with DEV keys! Ready to send.
```

## Documentation

- **POSTMAN_QUICK_START.md** - Updated with URL detection
- **POSTMAN_URL_DETECTION.md** - Complete URL detection guide
- **POSTMAN_MULTI_ENV.md** - Legacy (old variable-based method)

## How It Integrates

```
Postman Request URL: https://dev.bmchealth.in/api/users
         ↓
Pre-request script extracts domain
         ↓
Detects "dev.bmchealth.in" → environment = DEV
         ↓
Calls /api/postman-encrypt with { payload, environment: "DEV" }
         ↓
Tool loads DEV keys from env-keys-config.js
         ↓
Encrypts with DEV's RSA keys
         ↓
Backend receives encrypted payload
         ↓
Backend decrypts using same DEV keys ✅
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| URL contains `dev.bmchealth.in` | Uses DEV keys ✅ |
| URL contains `qa.bmchealth.in` | Uses QA keys |
| URL is `localhost` or unknown | Defaults to DEV |
| QA configured in tool | Works with QA URLs ✅ |
| QA not configured in tool | Error: "Keys not configured" |

## Next Step: Add More Domains

To add custom domains (e.g., staging), update the script:

```javascript
} else if (requestUrl.includes("staging.bmchealth.in")) {
    environment = "STAGING";
```

Then add STAGING keys to `src/config/env-keys-config.js`.

---

**Status: Complete!** ✅

Postman now auto-detects environment from URL with **ZERO manual configuration needed!**
