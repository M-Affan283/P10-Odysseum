/*
    Filename: forgotPassword.js
    This file contains the controller functions for handling forgot password functionality
    Author: Chishty
*/

import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

/**
 * TODO: Team needs to:
 * 1. Set up Gmail account
 * 2. Generate app password from Google Account settings
 * 3. Add credentials to .env file
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,      // Add to .env: team's Gmail address
        pass: process.env.EMAIL_PASSWORD   // Add to .env: Gmail app password (not regular password)
    }
});

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        const resetToken = jwt.sign(
            { id: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        // TODO: Team needs to:
        // 1. Set up deep linking in React Native app
        // 2. Update FRONTEND_URL in .env
        // 3. Test deep linking works with this URL format
        const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        // TODO: Team should customize email template:
        // 1. Add app logo
        // 2. Use app's color scheme
        // 3. Add footer with support contact
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
                <h1>You have requested a password reset</h1>
                <p>Please click on the following link to reset your password:</p>
                <a href="${resetURL}">${resetURL}</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.RESET_EMAIL_SENT
        });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.INVALID_TOKEN
            });
        }

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: ERROR_MESSAGES.USER_NOT_FOUND
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS
        });

    } catch (error) {
        console.error('Error in resetPassword:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({
                success: false,
                message: ERROR_MESSAGES.TOKEN_EXPIRED
            });
        }
        res.status(500).json({
            success: false,
            message: ERROR_MESSAGES.SERVER_ERROR
        });
    }
};