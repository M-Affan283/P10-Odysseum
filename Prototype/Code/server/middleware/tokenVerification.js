/*

Filname: tokenVerification.js

This file contains the middleware function for verifying the access token sent by the client.

Author: Affan

*/

import jwt from 'jsonwebtoken';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { User } from '../models/User.js';

export const verifyToken = async (req, res, next) =>
{
    const token = req.headers['authorization'];

    if (!token) return res.status(401).json({success:false, message: ERROR_MESSAGES.NO_TOKEN_PROVIDED});

    try
    {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        if (!decoded) return res.status(401).json({success:false, message: ERROR_MESSAGES.INVALID_TOKEN});

        console.log("Decoded token: \n",decoded);

        //attach user to request object
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) return res.status(401).json({success:false, message: ERROR_MESSAGES.INVALID_USER});

        next(); //call the actual function to handle the request
    }
    catch(error)
    {
        console.log("Error verifying token",error);
        return res.status(401).json({success:false, message: ERROR_MESSAGES.INVALID_TOKEN});
    }
}