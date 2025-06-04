/**
 * Escapes special characters in a string to their corresponding HTML entities.
 * 
 * @param {*} unsafe - The string to be escaped.
 * @returns {string} - The escaped string.
 */
function escapeHTML(unsafe) {
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export default escapeHTML;