/*
    Filename: adminTokenVerification.js
    Author: Shahrez
    Description: Middleware for verifying admin authentication
*/

import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { User } from '../models/User.js';
import { authConfig } from '../config/authConfig.js';

export const verifyAdminToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.NO_TOKEN_PROVIDED
            });
        }

        // Extract the token from "Bearer <token>"
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.NO_TOKEN_PROVIDED
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, {
                algorithms: [authConfig.tokenSettings.accessToken.algorithm],
                issuer: authConfig.tokenSettings.accessToken.issuer
            });

            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    message: ERROR_MESSAGES.INVALID_TOKEN
                });
            }

            // Get user and verify admin role
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: ERROR_MESSAGES.INVALID_USER
                });
            }

            // Check if user is an admin
            if (user.role !== 'admin') {
                return res.status(403).json({
                    success: false,
                    message: ERROR_MESSAGES.UNAUTHORIZED
                });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: ERROR_MESSAGES.TOKEN_EXPIRED
                });
            }
            console.log("Error verifying admin token", error);
            return res.status(401).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_TOKEN
            });
        }
    } catch (error) {
        console.error('Admin Auth Middleware Error:', error);
        return res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR
        });
    }
};

