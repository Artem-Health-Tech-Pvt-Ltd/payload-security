# Postman Auto-Encrypt Script - Quick Copy

## Step-by-Step Setup (30 seconds)

### 1. Create a Request (No Setup Needed!)
- New request in Postman
- **Method**: POST
- **URL**: Use your actual service URL:
  - `https://dev.bmchealth.in/api/endpoint` (auto-detects DEV)
  - `https://qa.bmchealth.in/api/endpoint` (auto-detects QA)
  - `https://uat.bmchealth.in/api/endpoint` (auto-detects UAT)
  - `https://prun.bmchealth.in/api/endpoint` (auto-detects PRUN)
  - `https://live.bmchealth.in/api/endpoint` (auto-detects LIVE)

- **Body** (Raw, JSON):
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### 2. Add Pre-Request Script
Click the **Pre-request Script** tab and paste this:

```javascript
// AUTO-ENCRYPT: Detects environment from URL and uses correct encryption keys
// Examples:
//   https://dev.bmchealth.in/... → Uses DEV keys
//   https://qa.bmchealth.in/... → Uses QA keys
//   https://uat.bmchealth.in/... → Uses UAT keys
//   https://prun.bmchealth.in/... → Uses PRUN keys
//   https://live.bmchealth.in/... → Uses LIVE keys

const encryptionToolUrl = "http://localhost:3000";

// Extract environment from request URL
const requestUrl = pm.request.url.toString();
let environment = "DEV"; // Default

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
console.log(`📍 URL: ${requestUrl}`);

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

console.log(`📤 Encrypting payload with ${environment} keys...`, payload);

pm.sendRequest({
    url: `${encryptionToolUrl}/api/postman-encrypt`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: { 
        mode: 'raw', 
        raw: JSON.stringify({ 
            payload,
            environment  // Uses auto-detected environment
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

### 3. Click Send ✅

That's it! Your payload will be encrypted automatically before sending.

**That's all!** No environment variables needed. Script detects environment from URL automatically.

## How It Works

```
You enter URL: https://dev.bmchealth.in/api/users
You type JSON in Body tab
Click Send
         ↓
Pre-request script runs
         ↓
Detects "dev.bmchealth.in" in URL → Environment = DEV
         ↓
Calls POST http://localhost:3000/api/postman-encrypt
with { payload, environment: "DEV" }
         ↓
Gets back encrypted: { payload: { data, iv, key } }
         ↓
Script replaces request body with encrypted version
         ↓
Your request sends encrypted payload to backend
         ↓
Backend decrypts using same DEV keys ✅
```

## Debug Console

Open **Postman Console** (Ctrl+Alt+C) to see:
- 🌍 `Detected environment from URL: DEV`
- 📍 `URL: https://dev.bmchealth.in/...`
- 📤 `Encrypting payload with DEV keys...`
- ✅ `Payload encrypted with DEV keys! Ready to send.` - Success
- ❌ Error messages if something fails
- 📤 Original and encrypted payload details

## What Happens

```
You enter JSON in Body tab
         ↓
Pre-request script runs
         ↓
Calls POST http://localhost:3000/api/postman-encrypt
         ↓
Gets back encrypted: { payload: { data, iv, key } }
         ↓
Script replaces request body with encrypted version
         ↓
Your request sends encrypted payload to backend
         ↓
Backend PayloadCryptoFilter decrypts automatically ✅
```

## Reuse for Other Endpoints

Once you have the pre-request script in one request:
1. Copy the request
2. Change the URL to another endpoint
3. Change the JSON body
4. Click Send - **script automatically runs!**

## Troubleshooting

| Error | Solution |
|-------|----------|
| `Detected environment from URL: DEV` | Expected output. Script detected DEV environment ✅ |
| Connection error | Make sure Node.js tool is running: `npm start` in `payload-crypto-tool/` |
| `❌ Encryption failed` | Check console for details. Verify tool is on port 3000 |
| `Keys not configured for environment: QA` | Tool doesn't have QA keys yet. Use dev/qa/uat/prun/live URL with configured environment or add keys |
| Request goes through but backend decrypt fails | Check backend keys match tool keys in `application-local.yml` |

## URL Examples (Auto-Detects Environment)

| URL | Auto-Detected | Keys Used |
|-----|-------------------|-----------|
| `https://dev.bmchealth.in/api/users` | DEV | DEV keys ✅ |
| `https://qa.bmchealth.in/api/users` | QA | QA keys (when configured) |
| `https://uat.bmchealth.in/api/users` | UAT | UAT keys (when configured) |
| `https://prun.bmchealth.in/api/users` | PRUN | PRUN keys (when configured) |
| `https://live.bmchealth.in/api/users` | LIVE | LIVE keys (when configured) |

## Multi-Environment Support

Just change your request URL - no script changes needed!

### Testing DEV
```
POST https://dev.bmchealth.in/api/users
Body: {"name": "John"}
→ Uses DEV encryption keys automatically ✅
```

### Testing QA
```
POST https://qa.bmchealth.in/api/users
Body: {"name": "John"}
→ Uses QA encryption keys automatically ✅
```

### Testing LIVE
```
POST https://live.bmchealth.in/api/users
Body: {"name": "John"}
→ Uses LIVE encryption keys automatically ✅
```

Same pre-request script works for all - it detects from URL!

## How Environment Detection Works

```javascript
const requestUrl = pm.request.url.toString();
let environment = "DEV"; // Default

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
```

The script reads the request URL and extracts the subdomain to determine which environment's keys to use!

## Example: Using with Different Services

### User API (port 9011)
```
SET: SERVICE_URL = http://localhost:9011
URL: {{SERVICE_URL}}/api/users
```

### Front Desk API (port 9007)
```
SET: SERVICE_URL = http://localhost:9007
URL: {{SERVICE_URL}}/api/appointments
```

Same pre-request script works for all! Just change the SERVICE_URL environment variable.

---

**That's all you need!** 🚀 No manual encryption. Just write your JSON and send.
