/*

Filename: updateUser.js

This file contains the controller function for updating a user's information. It updates the user's information in the database and returns a success message to the client.

Author: Affan and Shahrez

*/

import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES, REGEX_PATTERNS } from "../../utils/constants.js";
import bcrypt from 'bcryptjs';



/**
 * Update the user's bio.
 * @param {Object} req - request object. Must contain userId and bio.
 * @param {Object} res - response object
 * @returns {Object} - response object
 */
export const updateUserBio = async (req, res) => {
    const { userId, bio } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        user.bio = bio;
        await user.save();

        return res.status(200).json({ message: SUCCESS_MESSAGES.USER_UPDATED });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
}

export const updateUserProfilePicture = async (req, res) => {
    
}

export const updateUserUsername = async (req, res) => {
    const { userId, username } = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        user.username = username;
        await user.save();

        return res.status(200).json({ message: SUCCESS_MESSAGES.USER_UPDATED });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
}

export const updateUserPassword = async (req, res) => {
    const {userId, oldPassword, newPassword} = req.body;

    try {
        const user = await User.findById(userId);

        if (!user) {
            console.log("User not found");
            return res.status(404).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        }

        oldPassword = bcrypt.hash(oldPassword, 10);

        if (!(user.password == oldPassword)) {
            console.log("Incorrect password");
            return res.status(400).json({ message: ERROR_MESSAGES.INCORRECT_PASSWORD });
        }

        user.password = bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ message: SUCCESS_MESSAGES.USER_UPDATED });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
}

