const API_BASE = 'http://localhost:3000';
let selectedEnvironment = 'DEV';

// ============== TAB NAVIGATION ==============

/**
 * Initialize tab navigation
 */
function initTabs() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
}

/**
 * Switch to a specific tab
 */
function switchTab(tabId) {
    // Remove active class from all links and tabs
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // Add active class to selected link and tab
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

/**
 * Load available environments on page load
 */
async function loadEnvironments() {
    try {
        const response = await fetch(`${API_BASE}/api/environments`);
        const data = await response.json();

        const select = document.getElementById('environmentSelect');
        select.innerHTML = '';

        data.environments.forEach(env => {
            const option = document.createElement('option');
            option.value = env.name;
            option.textContent = `${env.name}${env.configured ? ' ✅' : ' ⚠️'}`;
            option.disabled = !env.configured;
            select.appendChild(option);
        });

        // Set default to first configured environment
        const firstConfigured = data.environments.find(e => e.configured);
        if (firstConfigured) {
            select.value = firstConfigured.name;
            selectedEnvironment = firstConfigured.name;
            updateEnvironmentStatus(firstConfigured);
        }
    } catch (error) {
        console.error('Error loading environments:', error);
        document.getElementById('environmentSelect').innerHTML = 
            '<option value="DEV" selected>DEV (Fallback)</option>';
    }
}

/**
 * Handle environment change
 */
function handleEnvironmentChange() {
    const select = document.getElementById('environmentSelect');
    selectedEnvironment = select.value || 'DEV';
    
    // Find the selected environment status
    const option = select.options[select.selectedIndex];
    const isConfigured = !option.disabled;
    
    updateEnvironmentStatus({
        name: selectedEnvironment,
        configured: isConfigured
    });
    
    console.log(`🌍 Environment switched to: ${selectedEnvironment}`);
}

/**
 * Update environment status display
 */
function updateEnvironmentStatus(env) {
    const statusEl = document.getElementById('envStatus');
    if (env.configured) {
        statusEl.className = 'env-status configured';
        statusEl.textContent = `✅ ${env.name} (Ready)`;
    } else {
        statusEl.className = 'env-status not-configured';
        statusEl.textContent = `⚠️ ${env.name} (Not Configured)`;
    }
}

/**
 * Encrypt the input payload
 */
async function encrypt() {
    const input = document.getElementById('encryptInput').value.trim();
    
    if (!input) {
        showError('encryptResult', 'Please enter a payload to encrypt');
        return;
    }

    try {
        // Parse input if it's JSON, otherwise send as string
        let payload;
        try {
            payload = JSON.parse(input);
        } catch (e) {
            payload = input;
        }

        const response = await fetch(`${API_BASE}/api/encrypt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload, environment: selectedEnvironment })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            // Display results
            document.getElementById('encryptResultData').value = data.encrypted.data;
            document.getElementById('encryptResultIv').value = data.encrypted.iv;
            document.getElementById('encryptResultKey').value = data.encrypted.key;
            
            // Full payload for Postman
            const fullPayload = {
                payload: data.encrypted
            };
            document.getElementById('encryptResultFull').value = JSON.stringify(fullPayload, null, 2);
            
            document.getElementById('encryptResult').classList.remove('hidden');
            showSuccess('encryptResult', 'Payload encrypted successfully! ✅');
        } else {
            showError('encryptResult', data.error || 'Encryption failed');
        }
    } catch (error) {
        showError('encryptResult', `Error: ${error.message}`);
    }
}

/**
 * Decrypt the input payload
 */
async function decrypt() {
    const input = document.getElementById('decryptInput').value.trim();
    
    if (!input) {
        showError('decryptResult', 'Please enter an encrypted payload to decrypt');
        return;
    }

    try {
        let encrypted = JSON.parse(input);
        
        // Handle both formats: direct {data, iv, key} or wrapped {payload: {data, iv, key}}
        if (encrypted.payload && encrypted.payload.data) {
            encrypted = encrypted.payload;
        }

        const response = await fetch(`${API_BASE}/api/decrypt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ encrypted, environment: selectedEnvironment })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.success) {
            const decryptedText = typeof data.decrypted === 'string' 
                ? data.decrypted 
                : JSON.stringify(data.decrypted, null, 2);
            
            document.getElementById('decryptResultData').value = decryptedText;
            document.getElementById('decryptResult').classList.remove('hidden');
            showSuccess('decryptResult', 'Payload decrypted successfully! ✅');
        } else {
            showError('decryptResult', data.error || 'Decryption failed');
        }
    } catch (error) {
        showError('decryptResult', `Error: ${error.message}`);
    }
}

/**
 * Format decrypted JSON
 */
function formatJsonDecrypt() {
    const textarea = document.getElementById('decryptResultData');
    try {
        const parsed = JSON.parse(textarea.value);
        textarea.value = JSON.stringify(parsed, null, 2);
    } catch (error) {
        alert('Invalid JSON format');
    }
}

/**
 * Copy text to clipboard
 */
function copyToClipboard(elementId) {
    const textarea = document.getElementById(elementId);
    textarea.select();
    document.execCommand('copy');
    
    // Show feedback
    const originalText = event.target.textContent;
    event.target.textContent = '✓ Copied!';
    setTimeout(() => {
        event.target.textContent = originalText;
    }, 2000);
}

/**
 * Show success message
 */
function showSuccess(resultElementId, message) {
    const resultDiv = document.getElementById(resultElementId);
    let successMsg = resultDiv.querySelector('.success-message');
    
    if (!successMsg) {
        successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        resultDiv.insertBefore(successMsg, resultDiv.firstChild);
    }
    
    successMsg.textContent = message;
    setTimeout(() => {
        successMsg.remove();
    }, 3000);
}

/**
 * Show error message
 */
function showError(resultElementId, message) {
    const resultDiv = document.getElementById(resultElementId);
    resultDiv.classList.remove('hidden');
    
    let errorMsg = resultDiv.querySelector('.error-message');
    
    if (!errorMsg) {
        errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        resultDiv.insertBefore(errorMsg, resultDiv.firstChild);
    }
    
    errorMsg.textContent = message;
}

// ============== BASE64 FUNCTIONS ==============

/**
 * Base64 Encode
 */
function base64Encode() {
    const input = document.getElementById('base64Input').value;
    
    if (!input) {
        showError('base64Result', 'Please enter text to encode');
        return;
    }

    try {
        // Handle UTF-8 characters properly
        const encoded = btoa(unescape(encodeURIComponent(input)));
        document.getElementById('base64ResultData').value = encoded;
        document.getElementById('base64Result').classList.remove('hidden');
        showSuccess('base64Result', 'Text encoded to Base64 successfully! ✅');
    } catch (error) {
        showError('base64Result', `Encoding error: ${error.message}`);
    }
}

/**
 * Base64 Decode
 */
function base64Decode() {
    const input = document.getElementById('base64Input').value.trim();
    
    if (!input) {
        showError('base64Result', 'Please enter Base64 string to decode');
        return;
    }

    try {
        // Handle UTF-8 characters properly
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('base64ResultData').value = decoded;
        document.getElementById('base64Result').classList.remove('hidden');
        showSuccess('base64Result', 'Base64 decoded successfully! ✅');
    } catch (error) {
        showError('base64Result', `Decoding error: Invalid Base64 string`);
    }
}

// ============== JWT FUNCTIONS ==============

/**
 * Base64URL encode (for JWT)
 */
function base64UrlEncode(str) {
    return btoa(unescape(encodeURIComponent(str)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * Base64URL decode (for JWT)
 */
function base64UrlDecode(str) {
    // Add padding if needed
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) {
        base64 += '='.repeat(4 - padding);
    }
    return decodeURIComponent(escape(atob(base64)));
}

/**
 * Simple HMAC-SHA256 for JWT signing (client-side)
 */
async function hmacSha256(key, message) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

/**
 * JWT Encode - Create a JWT token
 */
async function jwtEncode() {
    const input = document.getElementById('jwtInput').value.trim();
    const secret = document.getElementById('jwtSecret').value || 'your-secret-key';
    
    if (!input) {
        showError('jwtResult', 'Please enter a JSON payload to encode');
        return;
    }

    try {
        // Parse the payload
        let payload;
        try {
            payload = JSON.parse(input);
        } catch (e) {
            showError('jwtResult', 'Invalid JSON payload');
            return;
        }

        // Create header
        const header = { alg: 'HS256', typ: 'JWT' };
        
        // Add standard claims if not present
        if (!payload.iat) {
            payload.iat = Math.floor(Date.now() / 1000);
        }
        if (!payload.exp) {
            payload.exp = payload.iat + 3600; // 1 hour expiry
        }

        // Encode header and payload
        const encodedHeader = base64UrlEncode(JSON.stringify(header));
        const encodedPayload = base64UrlEncode(JSON.stringify(payload));
        
        // Create signature
        const signature = await hmacSha256(secret, `${encodedHeader}.${encodedPayload}`);
        
        // Create full token
        const token = `${encodedHeader}.${encodedPayload}.${signature}`;

        // Display results
        document.getElementById('jwtResultHeader').value = JSON.stringify(header, null, 2);
        document.getElementById('jwtResultPayload').value = JSON.stringify(payload, null, 2);
        document.getElementById('jwtResultToken').value = token;
        document.getElementById('jwtResult').classList.remove('hidden');
        showSuccess('jwtResult', 'JWT created successfully! ✅');
    } catch (error) {
        showError('jwtResult', `JWT encoding error: ${error.message}`);
    }
}

/**
 * JWT Decode - Decode a JWT token (without verification)
 */
function jwtDecode() {
    const input = document.getElementById('jwtInput').value.trim();
    
    if (!input) {
        showError('jwtResult', 'Please enter a JWT token to decode');
        return;
    }

    try {
        const parts = input.split('.');
        
        if (parts.length !== 3) {
            showError('jwtResult', 'Invalid JWT format. JWT must have 3 parts separated by dots.');
            return;
        }

        const header = JSON.parse(base64UrlDecode(parts[0]));
        const payload = JSON.parse(base64UrlDecode(parts[1]));

        // Check expiration
        let expiryInfo = '';
        if (payload.exp) {
            const expDate = new Date(payload.exp * 1000);
            const now = new Date();
            if (expDate < now) {
                expiryInfo = ` ⚠️ EXPIRED on ${expDate.toLocaleString()}`;
            } else {
                expiryInfo = ` ✅ Valid until ${expDate.toLocaleString()}`;
            }
        }

        // Display results
        document.getElementById('jwtResultHeader').value = JSON.stringify(header, null, 2);
        document.getElementById('jwtResultPayload').value = JSON.stringify(payload, null, 2);
        document.getElementById('jwtResultToken').value = input;
        document.getElementById('jwtResult').classList.remove('hidden');
        showSuccess('jwtResult', `JWT decoded successfully!${expiryInfo}`);
    } catch (error) {
        showError('jwtResult', `JWT decoding error: ${error.message}`);
    }
}
