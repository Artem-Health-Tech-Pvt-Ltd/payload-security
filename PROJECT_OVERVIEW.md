# 🚀 Payload Crypto Tool - Project Overview

## ✅ Project Created Successfully

A complete encryption/decryption tool for BMC developers to test and work with payload encryption.

## 📁 Project Structure

```
payload-crypto-tool/
├── package.json                    # NPM dependencies
├── server.js                       # Express backend (REST API)
├── README.md                       # Documentation
├── .gitignore                      # Git ignore rules
├── keys/
│   ├── private_key.pem            # RSA Private Key (for decryption)
│   └── public_key.pem             # RSA Public Key (for encryption)
├── src/
│   └── utils/
│       └── RsaCryptoUtil.js       # Hybrid AES+RSA encryption utility
└── public/
    ├── index.html                 # Web UI
    ├── style.css                  # Styling (responsive design)
    └── script.js                  # Frontend JavaScript logic
```

## 🎯 Features Implemented

### 1. **Frontend Web Interface** (public/index.html)
- 📝 Encrypt Card - Input plain JSON, get encrypted payload
- 🔓 Decrypt Card - Input encrypted payload, get plain JSON
- 📋 Copy Buttons - One-click copy to clipboard
- ✨ Format JSON - Pretty-print decrypted JSON
- 📊 Responsive Design - Works on desktop and mobile

### 2. **Backend REST API** (server.js)
- `POST /api/encrypt` - Encrypt plain payload
- `POST /api/decrypt` - Decrypt encrypted payload  
- `POST /api/postman-encrypt` - Postman-specific endpoint
- `GET /health` - Health check endpoint

### 3. **Encryption Engine** (src/utils/RsaCryptoUtil.js)
- **Hybrid Encryption**: AES-256 + RSA
  - Generates random AES-256 key
  - Encrypts payload with AES-256-CBC
  - Generates random IV
  - Encrypts AES key with RSA public key
  - Returns: { data, iv, key }

## 🔐 Encryption Flow

### Encrypt
```
Plain JSON 
    ↓
Generate AES-256 key + IV
    ↓
Encrypt with AES-256-CBC
    ↓
Encrypt AES key with RSA public key
    ↓
Return { data, iv, key }
```

### Decrypt
```
{ data, iv, key }
    ↓
Decrypt key with RSA private key
    ↓
Decrypt data with AES-256-CBC
    ↓
Return Plain JSON
```

## 🚀 Quick Start

### Installation
```bash
cd c:\Users\Artem\Desktop\BMC\payload-crypto-tool
npm install
```

### Start Server
```bash
npm start
```
Server runs on: http://localhost:3000

### Usage

#### Web Interface
1. Open http://localhost:3000
2. Paste JSON in "Plain JSON" field
3. Click "🔒 Encrypt" button
4. Copy encrypted payload

#### Using Postman
```javascript
// Pre-request script
fetch('http://localhost:3000/api/postman-encrypt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ payload: {...} })
})
.then(r => r.json())
.then(data => pm.environment.set('encryptedPayload', JSON.stringify(data.postmanPayload)));
```

#### Using cURL
```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"payload": {"name": "John"}}'
```

## 🔑 Keys Used

- **Private Key**: `keys/private_key.pem` (for decryption)
- **Public Key**: `keys/public_key.pem` (for encryption)
- **Same Keys**: As used in bmc-user-api and bmc-front-desk-api

## 📝 Example Request/Response

### Request (Encrypt)
```json
{
  "payload": {
    "patientChiefComplaintDtos": [
      {
        "id": null,
        "days": "",
        "complaintName": "Fever",
        "onSetDate": "2025-12-22",
        "remarks": "High fever",
        "encounterIDF": 2279998
      }
    ]
  }
}
```

### Response
```json
{
  "success": true,
  "encrypted": {
    "data": "a7f2e8b3d4c5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0",
    "iv": "f1e2d3c4b5a6978869584748",
    "key": "9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f"
  },
  "message": "Payload encrypted successfully"
}
```

## 💡 Use Cases

### 1. **Testing BMC Services**
- Encrypt payloads before sending to services
- Decrypt response payloads from services

### 2. **Postman Automation**
- Automated encryption in pre-request scripts
- Dynamic payload generation

### 3. **Development & Debugging**
- Understand encryption format
- Test payloads independently
- Verify encryption logic

### 4. **Integration Testing**
- Prepare test data
- Validate encrypted payloads
- Debug encryption issues

## 📊 Technology Stack

- **Backend**: Node.js + Express
- **Encryption**: Node.js built-in `crypto` module
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **API**: RESTful with JSON
- **Deployment**: Can run on any Node.js environment

## 🛠️ Development

For development with auto-reload:
```bash
npm run dev
```

## 📚 Documentation

See [README.md](README.md) for:
- Detailed API documentation
- Postman integration guide
- Security notes
- Troubleshooting

## ✨ Benefits

✅ Same encryption logic as BMC services  
✅ Easy-to-use web interface  
✅ REST API for automation  
✅ Postman integration ready  
✅ Fast encryption/decryption  
✅ Developer-friendly  
✅ No external dependencies (Node crypto)  
✅ Open source structure  

---

**Next Steps**: 
1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Open http://localhost:3000
4. Start encrypting payloads! 🔐
