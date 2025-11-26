/*
  Auth middleware:
  - Verifies JWT
  - Optionally loads fresh user from DB
  - Checks roles for protected routes
*/

import jwtService from "../services/jwtService.js";
import Users from "../models/Users.js";

const getToken = (headers) => jwtService.extractTokenFromHeader(headers);

const authMiddleware =  {
    verifyToken: (req, res, next) => {
         /*
            Verify JWT from Authorization header.
            If valid, attach payload to req.user.
            If invalid or missing, respond with 401.
        */
        try {
           const token = getToken(req.headers);
           
           if(!token) {
                return res.status(401).json({
                    success: false,
                    error: 'ACCESS_DENIED',
                    message: 'Access denied. No token provided.'
                });
           }

           const decoded = jwtService.verifyToken(token);
           req.user = decoded;
           console.log(`Authenticated user: ${decoded.username} ${decoded.role}`);
           next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                error: 'INVALID_TOKEN',
                message: error.message || 'Invalid token.'
            });
        }
    },

    optionalAuth: async (req, res, next) => {
        try {
            const token = getToken(req.headers);
            if(token) {
                const decoded = jwtService.verifyToken(token);
                const user = await Users.findById(decoded.id);
                if(user) {
                    req.user = {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        role: user.role
                    };
                    console.log(`${user.username} authenticated with optional auth.`);
                }
            }
        } catch (error) {
            console.log('Optional auth failed:', error.message);
        }
        next();
    },

    ensureAuth: (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({
                success: false,
                error: 'AUTH_REQUIRED',
                message: 'Authentication is required to access this resource.'
            });
        }
        next();
    },

    loadFreshUser: async (req, res, next) => {
        // Load latest user info from DB using req.user.id
        if(!req.user?.id) return next();
        try {
            const user = await Users.findById(req.user.id);
            if(!user){
                return res.status(401).json({
                    success: false,
                    error: 'USER_NOT_FOUND',
                    message: 'User not found.'
                });
            }
            req.user = {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.is_active ?? true
            };
            next();
        } catch (error) {
            console.error(error.message);
            return res.status(500).json({message: 'Internal server error'});
        }
    },

    required: [authMiddleware.verifyToken, authMiddleware.loadFreshUser],

    tokenOnly: (req, res, next) => {
        authMiddleware.verifyToken(req, res, next);
    },

    optional: authMiddleware.optionalAuth,

    requiredRole: (allowedRoles) => (req, res, next) => {
        // Allow route access only for specified roles
        if (!req.user) {
            return res.status(401).json({error: 'AUTH_REQUIRED'});
        }
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: "FORBIDDEN",
                message: `Need role: ${allowedRoles.join(" or ")}`
            });
        }
        next();
    }

};

export default authMiddleware;
