const API_BASE = 'http://192.168.1.8:3000';
let selectedEnvironment = 'DEV';

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
