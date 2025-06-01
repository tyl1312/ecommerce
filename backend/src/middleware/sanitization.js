const sanitizeInput = (input) => {
    if (typeof input !== 'string') return input;
    
    return input
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Encode dangerous characters
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        // Remove dangerous protocols
        .replace(/javascript:/gi, '')
        .replace(/vbscript:/gi, '')
        .replace(/data:/gi, '')
        // Remove event handlers
        .replace(/on\w+\s*=/gi, '')
        // Remove null bytes and control characters
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .trim();
};


const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
        return sanitizeInput(obj);
    }
    
    if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
            // Sanitize keys as well to prevent object pollution
            const cleanKey = sanitizeInput(key);
            sanitized[cleanKey] = sanitizeObject(value);
        }
        return sanitized;
    }
    
    return obj;
};

const sanitizationMiddleware = (options = {}) => {
    const {
        body = true,
        query = true,
        params = true
    } = options;
    
    return (req, res, next) => {
        try {
            if (body && req.body && typeof req.body === 'object') {
                req.body = sanitizeObject(req.body);
            }
            
            if (query && req.query && typeof req.query === 'object') {
                req.query = sanitizeObject(req.query);
            }
            
            if (params && req.params && typeof req.params === 'object') {
                req.params = sanitizeObject(req.params);
            }
            
            next();
        } catch (error) {
            console.error('Sanitization middleware error:', error);
            // Continue with unsanitized data rather than breaking the request
            next();
        }
    };
};

module.exports = {
    sanitizeInput,
    sanitizeObject,
    sanitizationMiddleware
};