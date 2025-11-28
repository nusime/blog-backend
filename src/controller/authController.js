import { query } from '../config/db.js';
import Users from '../models/Users.js';
import hashService from '../services/hashService.js';
import jwtService from '../services/jwtService.js';

const authController = {
    register: async(req, res) => {
        try {
            const { username, email, password } = req.body;

            const existingUser = await Users.findByEmail(email.trim().toLowerCase());
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    error: 'USER_EXISTS',
                    message: 'User with this email already exists'
                });
            }

            const existingUsername = await Users.findByUsername(username);
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    error: 'USERNAME_TAKEN',
                    message: 'Username is already taken'
                });
            }

            const hashedPassword = await hashService.hashedPassword(password);
            const userData = await Users.create({
                username: username.trim(),
                email: email.trim().toLowerCase(),
                password: hashedPassword,
                role: 'reader'
            });

            const token = jwtService.generateToken({
                id: userData._id,
                username: userData.username,
                role: userData.role
            });

            return res.status(201).json({
                success: true,
                message: 'Account created successfully',
                token,
                user: {
                    id: userData.id,
                    username: userData.username,
                    email: userData.email,
                    role: userData.role
                }
            });

        } catch (error) {
            console.error("Registration Error", error.message);
            return res.status(422).json({
                success: false,
                error: 'REGISTRATION_FAILED',
                message: 'Unable to create Account'
            });
        }
    },

    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const user = await Users.findByEmail(email.trim().toLowerCase());
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: 'Email or Password is incorrect'
                });
            }

            const isMatch = await hashService.comparePassword(password, user.password);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'INVALID_CREDENTIALS',
                    message: 'Email or Password is incorrect'
                });
            }

            const token = jwtService.generateToken({
                id: user.id,
                username: user.username,
                role: user.role
            });

            return res.json({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });

        } catch (error) {
            console.error("Login Error", error.message);
            return res.status(500).json({
                success: false,
                error: 'LOGIN_FAILED',
                message: 'Unable to login, please try again later'
            });
        }
    },

    getProfile: async (req, res) => {
        try {
            const user = await Users.findById(req.user.id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'USER_NOT_FOUND',
                    message: 'User not found'
                });
            }
            res.json({
                success: true,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                }
            });
        } catch (error) {
            return res.status(500).json({
                success: false,
                error: 'FETCH_PROFILE_FAILED',
                message: 'Unable to fetch profile, please try again later'
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { username, email } = req.body;
            const userId = req.user.id;

            if (username) {
                const existingUsername = await Users.findByUsername(username);
                if (existingUsername && existingUsername.id !== userId) {
                    return res.status(400).json({
                        success: false,
                        error: 'USERNAME_TAKEN',
                        message: 'Username is already taken'
                    });
                }
            }

            if (email) {
                const existingUser = await Users.findByEmail(email);
                if (existingUser && existingUser.id !== userId) {
                    return res.status(400).json({
                        success: false,
                        error: 'EMAIL_TAKEN',
                        message: 'Email is already in use'
                    });
                }
            }

            const sql = `
                UPDATE users
                SET username  = COALESCE($1, username),
                    email = COALESCE($2, email),
                    updated_at = NOW()
                WHERE id = $3
                RETURNING id, username, email, role, created_at, updated_at`;
            const values = [
                username ? username.trim() : null,
                email ? email.trim().toLowerCase() : null,
                userId
            ];

            const { rows } = await query(sql, values);
            const updatedUser = rows[0];

            res.json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    role: updatedUser.role
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'UPDATE_PROFILE_FAILED',
                message: 'Unable to update profile, please try again later'
            });
        }
    }
}

export default authController;