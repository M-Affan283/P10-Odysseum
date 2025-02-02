/*

Filename: tokenGeneration.js

This file contains the function to generate a JWT access or refresh token for a user. The token is generated using the user's id and a secret key stored in the environment variables.

Author: Affan & Shahrez

*/

import jwt from 'jsonwebtoken';

/**
 * Generate a JWT access token for a user. This token can be used to authenticate and authorize the user to access protected routes.
 * @param {string} userId - The id of the user for whom the token is generated.
 * @returns {string} - The generated access token.
 */
export const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_KEY_SECRET,
        { expiresIn: '1h' } // Access tokens expire in 1 hour
    );
};

/**
 * Generate a JWT refresh token for a user. This token can be used to refresh the access token when it expires. It is stored securely on the client side and sent to the server when needed.
 * @param {string} userId - The id of the user for whom the token is generated.
 * @returns {string} - The generated refresh token.
 */
export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_KEY_SECRET,
        { expiresIn: '7d' } // Refresh tokens expire in 7 days
    );
};

/**
 * Verify a refresh token
 * @param {string} refreshToken - The refresh token to verify
 * @returns {object|null} - The decoded token payload or null if invalid
 */
export const verifyRefreshToken = (refreshToken) => {
    try {
        return jwt.verify(refreshToken, process.env.REFRESH_KEY_SECRET);
    } catch (error) {
        return null;
    }
};