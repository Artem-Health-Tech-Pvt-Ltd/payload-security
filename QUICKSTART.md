# ⚡ Quick Start Guide

## 1️⃣ Installation (2 minutes)

```bash
# Navigate to project
cd c:\Users\Artem\Desktop\BMC\payload-crypto-tool

# Install dependencies
npm install
```

## 2️⃣ Start the Server

```bash
npm start
```

✅ Server running on: **http://localhost:3000**

## 3️⃣ Use the Tool

### Option A: Web Interface (Easiest)
1. Open http://localhost:3000 in browser
2. Paste JSON in "Plain JSON" field
3. Click "🔒 Encrypt" button
4. Copy encrypted payload

### Option B: Postman
1. Import `Postman_Collection.json` into Postman
2. Set `baseUrl` to `http://localhost:3000`
3. Use "Encrypt Payload" endpoint
4. Pass JSON in request body

### Option C: cURL
```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"payload": {"name": "John", "age": 30}}'
```

## 📋 Example Workflow

### Step 1: Prepare Payload
```json
{
  "payload": {
    "patientChiefComplaintDtos": [
      {
        "complaintName": "Fever",
        "onSetDate": "2025-12-22",
        "remarks": "High fever"
      }
    ]
  }
}
```

### Step 2: Send to Encrypt Endpoint
```
POST http://localhost:3000/api/encrypt
Content-Type: application/json

{ "payload": {...} }
```

### Step 3: Get Encrypted Response
```json
{
  "success": true,
  "encrypted": {
    "data": "a7f2e8b3d4c5...",
    "iv": "f1e2d3c4b5a6...",
    "key": "9a8b7c6d5e4f..."
  }
}
```

### Step 4: Send to BMC Service
```json
{
  "payload": {
    "data": "a7f2e8b3d4c5...",
    "iv": "f1e2d3c4b5a6...",
    "key": "9a8b7c6d5e4f..."
  }
}
```

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/health` | Health check |
| POST | `/api/encrypt` | Encrypt payload |
| POST | `/api/decrypt` | Decrypt payload |
| POST | `/api/postman-encrypt` | Postman script endpoint |

## 🎯 Use Cases

### 1. Testing User API
```bash
# Encrypt test payload
POST http://localhost:3000/api/encrypt
Body: { "payload": {...} }

# Send encrypted payload to user-api
POST http://localhost:9011/api/v1/user/endpoint
Body: { "payload": {...} }
```

### 2. Testing Front Desk API
```bash
# Encrypt test payload
POST http://localhost:3000/api/encrypt
Body: { "payload": {...} }

# Send to front-desk-api
POST http://localhost:9012/api/v1/front-desk/endpoint
Body: { "payload": {...} }
```

### 3. Postman Automation
Add to Pre-request Script:
```javascript
const plainPayload = pm.environment.get('payloadData');
fetch('http://localhost:3000/api/postman-encrypt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ payload: plainPayload })
})
.then(r => r.json())
.then(data => {
  pm.environment.set('encryptedPayload', JSON.stringify(data.postmanPayload));
});
```

## 🆘 Troubleshooting

### Port 3000 already in use?
```bash
# Use different port
PORT=3001 npm start
```

### Keys not found error?
```
Error: ENOENT: no such file or directory
```
✅ Make sure you're in the project directory
```bash
cd c:\Users\Artem\Desktop\BMC\payload-crypto-tool
npm start
```

### CORS error in browser?
✅ Already configured! All endpoints allow CORS

### Can't decrypt payload?
- Verify encrypted structure: `{ "data": "...", "iv": "...", "key": "..." }`
- Use same keys (shared across BMC services)
- Check payload wasn't modified

## 📚 More Info

- Full API docs: See `README.md`
- Project structure: See `PROJECT_OVERVIEW.md`
- Postman templates: Import `Postman_Collection.json`

## ✨ Pro Tips

1. **Copy encrypted payload quickly** - Use the 📋 Copy button
2. **Format decrypted JSON** - Click ✨ Format JSON
3. **Test both directions** - Encrypt then decrypt to verify
4. **Use environment variables** - Set `baseUrl` in Postman
5. **Check health endpoint** - `GET /health` to verify server is running

---

🎉 **You're ready to go!** Start encrypting payloads now.

Questions? Check README.md or PROJECT_OVERVIEW.md
