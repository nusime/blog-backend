/** 
 * Input Validation Middleware
 * Validates request data for various endpoints
 */

const validationMiddleware = {
    //Validate user registration
    validateRegister: (req, res, next) => {
        const { username, email, password } = req.body;
        const errors = [];

        // Usernam validation
        if(!username || username.trim().length === 0) {
            errors.push('Username is required');
        } else if (username.length < 3) {
            errors.push('Username must be at least 3 characters long');
        } else if (username.length > 50) {
            errors.push('Username must not be more than 50 chars');
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            errors.push('Username can only contain letters, numbers and underscore');
        }

        // Email Validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || email.trim().length === 0) {
            errors.push('Email is required');
        } else if (!emailRegex.test(email)) {
            errors.push('Valid email is required');
        } else if (email.length > 100) {
            errors.push('Email must not be more than 100 characters long');
        }

        // Password Validation
        if (!password || password.trim().length === 0) {
            errors.push('Password is required');
        } else if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        } else if (password.length > 100) {
            errors.push('Password must not be more than 100 characters long');
        }

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_FAILED',
                message: 'Registration validation failed',
                details: errors
            });
        }

        next();
    },

    // Validate user login
    validateLogin: (req, res, next) => {
        const { email, password } = req.body;
        const errors = [];

        if (!email || email.trim().length === 0) {
            errors.push('Email is required.');
        }

        if (!password || password.trim().length === 0) {
            errors.push('Password is required.');
        }

        if (errors.length > 0){
            return res.status(400).json({
                success: false,
                error: 'VALIDATION_FAILED',
                message: 'Login validation failed',
                details: errors
            });
        }
        next();
    },
}


export default validationMiddleware;