# Postman Auto-Encrypt Setup Guide

This guide shows how to set up Postman to **automatically encrypt payloads** before sending requests to BMC services.

## Prerequisites

- Postman installed
- Node.js encryption tool running on `http://localhost:3000`
- Service running (user-api on 9011, front-desk-api on 9007, etc.)

## Setup Steps

### Step 1: Create a Postman Environment Variable (Optional)

1. Open Postman
2. Click **Environments** (left sidebar)
3. Click **Create New** or edit existing environment
4. Add this variable (optional - encryption tool URL is hardcoded):

```
SERVICE_URL = http://localhost:9007  (or your service URL)
```

Save the environment.

**Note**: The encryption tool URL is hardcoded as `http://localhost:3000` in the script, so you don't need to set it.

### Step 2: Add Pre-Request Script to Your Request

1. Create or open any POST request in Postman
2. Go to the **Pre-request Script** tab
3. **Copy and paste the entire script below**:

```javascript
// ===== AUTO-ENCRYPT PAYLOAD SCRIPT =====
// This script automatically encrypts your request body using the encryption tool
// before sending it to the backend service.

// Encryption tool URL is hardcoded (runs on port 3000)
const encryptionToolUrl = "http://localhost:3000";

// Get the current request body
const requestBody = pm.request.body.raw;

if (!requestBody) {
    console.warn("Request body is empty! Skipping encryption...");
    return;
}

// Parse the body if it's JSON
let payload;
try {
    payload = JSON.parse(requestBody);
} catch (e) {
    payload = requestBody; // Send as-is if not JSON
}

console.log("Original payload:", payload);

// Call the encryption tool API
const encryptRequest = {
    url: `${encryptionToolUrl}/api/postman-encrypt`,
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({ payload })
    }
};

pm.sendRequest(encryptRequest, function(err, response) {
    if (err) {
        console.error("Encryption failed:", err);
        postman.setNextRequest(null);
        return;
    }

    try {
        const responseData = response.json();
        
        if (responseData.success && responseData.postmanPayload) {
            // Replace request body with encrypted payload
            pm.request.body.raw = JSON.stringify(responseData.postmanPayload);
            
            console.log("✅ Payload encrypted successfully!");
            console.log("Encrypted payload:", responseData.postmanPayload);
            
            // Store for debugging (optional)
            pm.environment.set("lastEncryptedPayload", JSON.stringify(responseData.postmanPayload));
        } else {
            console.error("Encryption failed:", responseData.error);
            postman.setNextRequest(null);
        }
    } catch (parseErr) {
        console.error("Failed to parse encryption response:", parseErr);
        postman.setNextRequest(null);
    }
});
```

### Step 3: Send Your Request

1. Set your request URL to the backend service:
   ```
   POST http://localhost:9007/api/your-endpoint
   ```

2. Set the raw body (JSON) to your **unencrypted** payload:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com"
   }
   ```

3. Make sure you're using the environment with `ENCRYPTION_TOOL_URL` set

4. Click **Send** - Postman will:
   - ✅ Call the encryption tool
   - ✅ Encrypt your payload
   - ✅ Replace the request body with encrypted version
   - ✅ Send encrypted payload to your service
   - ✅ Service automatically decrypts it

## What's Happening Behind the Scenes

```
Your Request Body (Plain JSON)
         ↓
[Pre-Request Script Runs]
         ↓
Sends to: POST http://localhost:3000/api/postman-encrypt
         ↓
Returns encrypted: { payload: { data, iv, key } }
         ↓
Request body replaced with encrypted payload
         ↓
Your Service receives encrypted payload
         ↓
PayloadCryptoFilter decrypts automatically
         ↓
Controller receives decrypted JSON
```

## Example: Testing User API

### Request Setup in Postman

**Tab: Body (Raw, JSON)**
```json
{
  "firstName": "Artem",
  "lastName": "Sharma",
  "email": "artem@example.com"
}
```

**Tab: Pre-request Script**
Paste the script from Step 2 above.

**URL**
```
POST http://localhost:9011/api/users
```

**Headers**
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

**Click Send** ✅

The payload will be encrypted automatically before reaching your service!

## Debugging

### View Encrypted Payload
In Postman Console (Ctrl+Alt+C / Cmd+Option+C):
- Look for "Encrypted payload:" log
- The full encrypted structure is shown

### Check if Tool is Running
In pre-request script console, if you see:
```
ENCRYPTION_TOOL_URL environment variable not set!
```
→ Make sure environment is selected

If you see connection error:
→ Make sure Node.js tool is running on port 3000

### Verify Decryption
- Check backend logs to see if decryption succeeded
- If you see error logs, the decryption failed
- Compare keys in `application-local.yml` with those in encryption tool

## Multiple Services

You can use the same pre-request script for multiple services:

1. Create separate requests for each service
2. Use the same pre-request script for all
3. Just change the request URL:
   - `POST http://localhost:9011/...` (user-api)
   - `POST http://localhost:9007/...` (front-desk-api)
   - etc.

The script automatically encrypts for all of them!

## Disable Encryption (Temporarily)

To test without encryption:
1. Go to Pre-request Script tab
2. Comment out the entire script or delete it
3. Send raw unencrypted payload

## Import from Collection

Alternatively, you can import the pre-configured Postman collection:
- See `postman-collection-with-encryption.json` for a complete setup example
- Import into Postman → Collections → Import
- All requests have the auto-encrypt script pre-configured

---

**Need Help?**
- Check Postman Console for logs and errors
- Verify encryption tool is running: http://localhost:3000/health
- Verify backend is running and has correct keys in application-local.yml
