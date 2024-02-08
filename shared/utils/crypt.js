const crypto = require('crypto');
const config = require('../../config-secrets/secrets.json');

const ENCRYPTION_KEY = config.ENCRYPTION_KEY;
const ALGORITHM_NAME = config.ENCRYPTION_ALGORITHM;
const ivLength = 16;

/**
 * 
 * @param {*} plainText 
 * @return {*}
 */
async function encrypt(plainText) {
    const IV = crypto.randomBytes(ivLength);
    const cipher = crypto.createCipheriv(ALGORITHM_NAME, ENCRYPTION_KEY, IV);
    let encrypted = cipher.update(plainText);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const cipherText = IV.toString('hex') + ':' + encrypted.toString('hex');
    return cipherText;
}

/**
 * 
 * @param {*} cipherText 
 * @return {*}
 */
async function decrypt(cipherText) {
    const textParts = cipherText.split(':');
    const IV = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM_NAME, ENCRYPTION_KEY, IV);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

module.exports = {encrypt, decrypt};
