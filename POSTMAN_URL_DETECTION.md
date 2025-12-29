# Postman URL-Based Environment Detection

## Overview

The Postman script now **automatically detects which environment to use** based on the request URL domain.

**No more manual environment selection!** ✨

## How It Works

### URL Pattern Matching

```
https://dev.bmchealth.in/...   → Detects DEV   → Uses DEV keys
https://qa.bmchealth.in/...    → Detects QA    → Uses QA keys
https://uat.bmchealth.in/...   → Detects UAT   → Uses UAT keys
https://prun.bmchealth.in/...  → Detects PRUN  → Uses PRUN keys
https://live.bmchealth.in/...  → Detects LIVE  → Uses LIVE keys
```

### Detection Logic

```javascript
const requestUrl = pm.request.url.toString();
let environment = "DEV"; // Default fallback

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

## Setup (No Configuration Needed!)

### 1. Single Pre-Request Script

Paste this in **Pre-request Script** tab of any POST request:

```javascript
const encryptionToolUrl = "http://localhost:3000";

// AUTO-DETECT environment from URL
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

console.log(`📤 Encrypting payload with ${environment} keys...`);

pm.sendRequest({
    url: `${encryptionToolUrl}/api/postman-encrypt`,
    method: 'POST',
    header: { 'Content-Type': 'application/json' },
    body: { 
        mode: 'raw', 
        raw: JSON.stringify({ payload, environment })
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
            console.error("❌ Error:", data.error);
            postman.setNextRequest(null);
        }
    } catch (e) {
        console.error("❌ Parse error:", e);
        postman.setNextRequest(null);
    }
});
```

### 2. Create Requests

Create a request with URL from different environments:

```
POST https://dev.bmchealth.in/api/users
Body: {"name": "John", "email": "john@example.com"}
Pre-request Script: [Paste the script above]
Click Send!
```

**That's it!** No environment variables needed. ✅

## Real-World Example

### Testing All Environments

#### 1. DEV Request
```
POST https://dev.bmchealth.in/api/users
Body:
{
  "firstName": "Artem",
  "lastName": "Sharma",
  "email": "artem@dev.example.com"
}

Console Output:
🌍 Detected environment from URL: DEV
📍 URL: https://dev.bmchealth.in/api/users
📤 Encrypting payload with DEV keys...
✅ Payload encrypted with DEV keys! Ready to send.
```

#### 2. QA Request
```
POST https://qa.bmchealth.in/api/users
Body:
{
  "firstName": "Artem",
  "lastName": "Sharma",
  "email": "artem@qa.example.com"
}

Console Output:
🌍 Detected environment from URL: QA
📍 URL: https://qa.bmchealth.in/api/users
📤 Encrypting payload with QA keys...
✅ Payload encrypted with QA keys! Ready to send.
```

#### 3. LIVE Request
```
POST https://live.bmchealth.in/api/users
Body:
{
  "firstName": "Artem",
  "lastName": "Sharma",
  "email": "artem@live.example.com"
}

Console Output:
🌍 Detected environment from URL: LIVE
📍 URL: https://live.bmchealth.in/api/users
📤 Encrypting payload with LIVE keys...
✅ Payload encrypted with LIVE keys! Ready to send.
```

## Supported Domains

| Domain | Environment | Encryption Keys |
|--------|-------------|-----------------|
| `dev.bmchealth.in` | DEV | DEV keys ✅ |
| `qa.bmchealth.in` | QA | QA keys (when configured) |
| `uat.bmchealth.in` | UAT | UAT keys (when configured) |
| `prun.bmchealth.in` | PRUN | PRUN keys (when configured) |
| `live.bmchealth.in` | LIVE | LIVE keys (when configured) |

Any other URL defaults to **DEV**.

## Adding Custom Domains

To add support for custom domains (e.g., staging, demo):

```javascript
} else if (requestUrl.includes("staging.bmchealth.in")) {
    environment = "STAGING";  // Would need STAGING keys configured
} else if (requestUrl.includes("demo.bmchealth.in")) {
    environment = "DEMO";  // Would need DEMO keys configured
```

Then configure keys in `src/config/env-keys-config.js`.

## Console Messages

### Success
```
🌍 Detected environment from URL: DEV
📍 URL: https://dev.bmchealth.in/api/users
📤 Encrypting payload with DEV keys...
✅ Payload encrypted with DEV keys! Ready to send.
```

### Error: Empty Body
```
⚠️ Empty request body, skipping encryption
```

### Error: Connection Failed
```
❌ Encryption failed: [error details]
```

### Error: Keys Not Configured
```
❌ Error: Keys not configured for environment: QA
```

## Advantages

✅ **No Manual Configuration** - Just use the right URL  
✅ **Automatic Detection** - Script reads URL automatically  
✅ **No Environment Variables** - No setup needed  
✅ **Copy & Paste** - One script works for all requests  
✅ **Prevents Mistakes** - Uses correct keys based on actual URL  
✅ **Multi-Team Ready** - Everyone can use same script  

## Security Notes

- Script reads the URL in plain text
- Environment detection happens client-side in Postman
- Encryption tool receives environment parameter
- Tool validates and uses corresponding keys

## Troubleshooting

### URL Not Detected
If script says `Detected environment from URL: DEV` but URL is QA:
- Check URL exactly matches: `https://qa.bmchealth.in/...`
- Typos in domain won't match (e.g., `qaa.bmchealth.in` → defaults to DEV)

### Error: Keys not configured for environment: QA
- QA domain is detected
- But encryption tool doesn't have QA keys
- Either: Use dev URL or add QA keys to tool and restart

### Request Still Uses DEV When Should Use QA
- Check your URL - does it contain `qa.bmchealth.in`?
- Check console output - what environment is detected?
- If mismatch, verify URL is correct

## Migration from Variable-Based

**Old Way** (with variables):
```
- Set ENVIRONMENT = DEV in Postman env
- Request uses variable
- Must manually change for QA/UAT/LIVE
```

**New Way** (URL-based):
```
- Just use correct URL: dev.bmchealth.in, qa.bmchealth.in, etc.
- Script detects automatically
- No manual changes needed
```

---

**Result: Better UX, fewer mistakes, automatic environment selection!** 🚀
