/**
  Role Middleware:
  - Handles role-based authorization
  - Works with authMiddleware for permission checks
  - Provides flexible role requirements
 */
import Users from "../models/Users.js";

const roleMiddleware = {
    // Require minimum role level
    requireMinRole: (minRole) => (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'AUTH_REQUIRED',
                message: 'Authentication is required to access this resource.'
            });
        }

        const userLevel = Users.ROLE_HIERARCHY[req.user.role] || 0;
        const requiredLevel = Users.ROLE_HIERARCHY[minRole] || 0;

        if (userLevel < requiredLevel) {
            return res.status(403).json({
                success: false,
                error: 'INSUFICIENT_ROLE',
                message: `Minimum role required is ${minRole} and your role is ${req.user.role}`,
                requiredLevel: minRole,
                yourRole: req.user.role
            });
        }

        console.log(`Role access: ${req.user.username} (${req.user.role}) >= ${minRole}`);
        next();
    },
    // Require specific roles
    requireRoles: (roles) => (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'AUTH_REQUIRED',
                message: 'Authentication required'
            });
        }

        const allowedRoles = Array.isArray(roles)? roles: [roles];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'ROLE_MISMATCH',
                message: `Required roles: ${allowedRoles.join(' or ')}. Your role ${req.user.role}`,
                allowedRoles: allowedRoles,
                yourRole: req.user.role
            });
        }
        console.log(`Exact role match: ${req.user.username} (${req.user.role}) in [${allowedRoles.join(', ')}]`);
        next();
    },
    requireAdmin: (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({
                success: false,
                error: 'AUTH_REQUIRED',
                message: 'Authentication required'
            });
        }

        if(req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'ADMIN_REQUIRED',
                message: 'Administrator privilege is required',
                yourRole: req.user.role
            });
        }

        console.log(`Admin access: ${req.user.username}`);
        next();
    },
    requireBlogger: (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({
                success: false,
                error: 'AUTH_REQUIRED',
                message: 'Authentication required'
            });
        }

        if(!['blogger', 'admin'].includes(req.user.role)){
            return res.status(403).json({
                success: false,
                error: 'BLOGGER_REQUIRED',
                message: 'Blogger privileges required',
                yourRole: req.user.role
            });
        }
        console.log(`Blogger access ${req.user.username}`);
        next();
    },
    requireOwnershipOrAdmin: (resourceType, resourceGetter = null) => async (req, res, next) => {
        if(!req.user){
            return res.status(401).json({
                success: false,
                error: 'AUTH_REQUIRED',
                message: 'Authentication required'
            });
        }
        if (req.user.role === 'admin'){
            return next();
        }

        try {
            let resource;
            const resourceId = req.params.id;

            if(!resourceId) {
                return res.status(400).json({
                    success: false,
                    error: 'MISSING_RESOURCE_ID',
                    message: 'Resource Id is required'
                });
            }

            if (resourceGetter) {
                resource = await resourceGetter(resourceId);
            } else {
                switch (resourceType) {
                    case 'post':
                        const Posts = await import('../models/Posts.js');
                        resource = await Posts.default.findById(resourceId);
                        break;
                    case 'comment':
                        const Comment = await import('../models/Comments.js');
                        resource = await Comment.default.findById(resourceId);
                        break;
                    case 'user':
                        const Users = await import('../models/Users.js');
                        resource = await Users.default.findById(resourceId);
                        break;
                    default:
                        return res.status(400).json({
                            success: false,
                            error: 'INVALID_RESOURCE_TYPE',
                            message: `Unsupported resource type: ${resourceType}`
                        });
                }
            }

            if (!resource) {
                return res.status(404).json({
                    success: false,
                    error: 'RESOURCE_NOT_FOUND',
                    message: `${resourceType} not found`
                });
            }

            // Check ownership - compare resource user_id with current user id
            const resourceOwnerId = resource.user_id;
            if (resourceOwnerId !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    error: 'OWNERSHIP_REQUIRED',
                    message: `You can only manage your own ${resourceType}s`,
                    resourceOwner: resourceOwnerId,
                    currentUser: req.user.id
                });
            }

            console.log(`Ownership Verified: ${req.user.username} owns this ${resourceType}`);
            next();
        } catch (error) {
            console.error("Ownership check error:", error);
            res.status(500).json({
                success: false,
                error: 'SERVER_ERROR',
                message: 'Failed to verify resource ownership'
            });
        }
    }
    
}

export default roleMiddleware;