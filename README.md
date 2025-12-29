# 🔐 Payload Crypto Tool

A developer-friendly tool for encrypting and decrypting JSON payloads using hybrid AES+RSA encryption, the same logic as implemented in BMC services.

## Features

✅ **Web Interface** - Encrypt/decrypt payloads with interactive cards  
✅ **REST API** - Use via Postman or other HTTP clients  
✅ **Hybrid Encryption** - AES-256 + RSA encryption for security  
✅ **Postman Integration** - Built-in endpoint for Postman pre-request scripts  
✅ **Copy to Clipboard** - One-click copying of encrypted payloads  
✅ **JSON Formatting** - Auto-format decrypted JSON  

## Installation

```bash
cd payload-crypto-tool
npm install
```

## Running the Tool

```bash
npm start
```

The tool will start on `http://localhost:3000`

## API Endpoints

### 1. POST `/api/encrypt`
Encrypts a plain JSON payload

**Request:**
```json
{
  "payload": {
    "patientChiefComplaintDtos": [...],
    "name": "John Doe"
  }
}
```

**Response:**
```json
{
  "success": true,
  "encrypted": {
    "data": "encrypted_hex_string",
    "iv": "initialization_vector_hex",
    "key": "encrypted_aes_key_hex"
  },
  "message": "Payload encrypted successfully"
}
```

### 2. POST `/api/decrypt`
Decrypts an encrypted payload

**Request:**
```json
{
  "encrypted": {
    "data": "encrypted_hex_string",
    "iv": "initialization_vector_hex",
    "key": "encrypted_aes_key_hex"
  }
}
```

**Response:**
```json
{
  "success": true,
  "decrypted": { "original": "payload" },
  "message": "Payload decrypted successfully"
}
```

### 3. POST `/api/postman-encrypt`
Postman-friendly endpoint for pre-request scripts

**Request:**
```json
{
  "payload": { "your": "data" }
}
```

**Response:**
```json
{
  "success": true,
  "postmanPayload": {
    "payload": {
      "data": "...",
      "iv": "...",
      "key": "..."
    }
  },
  "curlExample": "curl example..."
}
```

## Using with Postman

### Pre-request Script

```javascript
// Encrypt payload before sending to server
const plainPayload = {
  patientChiefComplaintDtos: [
    {
      id: null,
      complaintName: "Fever",
      onSetDate: "2025-12-22",
      remarks: "High fever"
    }
  ]
};

fetch('http://localhost:3000/api/postman-encrypt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ payload: plainPayload })
})
.then(response => response.json())
.then(data => {
  pm.environment.set('encryptedPayload', JSON.stringify(data.postmanPayload));
  console.log('Payload encrypted successfully');
});
```

### Request Body

Use the environment variable in your request:
```json
{{encryptedPayload}}
```

## Encryption Logic

The tool implements **Hybrid AES+RSA encryption**:

1. **Generate AES-256 Key** - A random 256-bit key
2. **Encrypt Data** - Encrypt payload with AES-256-CBC
3. **Generate IV** - Random 16-byte initialization vector
4. **Encrypt AES Key** - Encrypt the AES key using RSA public key
5. **Return Bundle** - { data, iv, key }

### Decryption Flow

1. **Decrypt AES Key** - Use RSA private key to decrypt the key
2. **Decrypt Data** - Use AES key and IV to decrypt the data
3. **Return Plain** - Original JSON payload

## Project Structure

```
payload-crypto-tool/
├── package.json              # Dependencies
├── server.js                 # Express server & API endpoints
├── keys/
│   ├── private_key.pem      # RSA private key
│   └── public_key.pem       # RSA public key
├── src/
│   └── utils/
│       └── RsaCryptoUtil.js # Encryption utility class
└── public/
    ├── index.html           # Web interface
    ├── style.css            # Styling
    └── script.js            # Frontend logic
```

## Testing

### Using curl

**Encrypt:**
```bash
curl -X POST http://localhost:3000/api/encrypt \
  -H "Content-Type: application/json" \
  -d '{"payload": {"name": "John", "age": 30}}'
```

**Decrypt:**
```bash
curl -X POST http://localhost:3000/api/decrypt \
  -H "Content-Type: application/json" \
  -d '{"encrypted": {"data": "...", "iv": "...", "key": "..."}}'
```

## Same Encryption as BMC Services

This tool uses the **exact same encryption logic** implemented in:
- bmc-user-api
- bmc-front-desk-api
- bmc-medico-models (shared library)

The RsaCryptoUtil class matches the Java implementation, ensuring payloads encrypted here can be decrypted by BMC services and vice versa.

## Security Notes

⚠️ **Keys are shared for demo purposes** - In production, use service-specific keys stored securely.

- Private keys should be kept secure
- Never commit keys to version control
- Use environment variables for key management
- Rotate keys regularly

## Development

For development with hot reload:

```bash
npm run dev
```

## License

Internal BMC Tool - For development purposes only
