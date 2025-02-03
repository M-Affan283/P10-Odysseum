/*

Filname: tokenVerification.js

This file contains the middleware function for verifying the access token sent by the client.

Author: Shahrez

*/

import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { User } from '../models/User.js';

export const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) return res.status(401).json({success:false, message: ERROR_MESSAGES.NO_TOKEN_PROVIDED});

    // Extract the token from "Bearer <token>"
    const token = authHeader.split(' ')[1];
    
    if (!token) return res.status(401).json({success:false, message: ERROR_MESSAGES.NO_TOKEN_PROVIDED});

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded) return res.status(401).json({success:false, message: ERROR_MESSAGES.INVALID_TOKEN});

        console.log("Decoded token: \n", decoded);

        //attach user to request object
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) return res.status(401).json({success:false, message: ERROR_MESSAGES.INVALID_USER});

        next();
    }
    catch(error) {
        console.log("Error verifying token", error);
        return res.status(401).json({success:false, message: ERROR_MESSAGES.INVALID_TOKEN});
    }
}