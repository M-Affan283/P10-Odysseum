/*

Filename: tokenGeneration.js

This file contains the function to generate a JWT access or refresh token for a user. The token is generated using the user's id and a secret key stored in the environment variables.

Author: Shahrez

*/

import jwt from 'jsonwebtoken';
import { authConfig } from '../config/authConfig.js';

export const generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: authConfig.tokenExpiration.access,
            algorithm: authConfig.tokenSettings.accessToken.algorithm,
            issuer: authConfig.tokenSettings.accessToken.issuer
        }
    );
};

export const generateRefreshToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: authConfig.tokenExpiration.refresh,
            algorithm: authConfig.tokenSettings.refreshToken.algorithm,
            issuer: authConfig.tokenSettings.refreshToken.issuer
        }
    );
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, {
            algorithms: [authConfig.tokenSettings.refreshToken.algorithm],
            issuer: authConfig.tokenSettings.refreshToken.issuer
        });
    } catch (error) {
        return null;
    }
};