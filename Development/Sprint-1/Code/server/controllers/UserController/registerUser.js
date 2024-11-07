/*

Filename: registerUser.js

This file contains the controller function for registering a new user. It checks if the email or username provided by the user already exists in the database. If not, it creates a new user in the database.

Author: Affan

*/

import { User } from "../../models/User.js";
import bcrypt from 'bcryptjs';
import { ERROR_MESSAGES, SUCCESS_MESSAGES,REGEX_PATTERNS } from "../../utils/constants.js";
import validator from "validator";

export const registerUser = async (req,res) =>
{
    const { firstName, lastName, email, username, password} = req.body;

    if(!firstName || !lastName || !email || !username || !password) return res.status(400).json({success:false, message: ERROR_MESSAGES.MISSING_FIELDS});

    if(!validator.isEmail(email)) return res.status(400).json({success:false, message: ERROR_MESSAGES.INVALID_EMAIL});

    if(!validator.isAlphanumeric(username)) return res.status(400).json({success:false, message: ERROR_MESSAGES.INVALID_USERNAME});

    if(REGEX_PATTERNS.PASSWORD.test(password) === false) return res.status(400).json({success:false, message: ERROR_MESSAGES.INVALID_PASSWORD});

    try
    {
        //check if user already exists
        const userExists = await User.findOne({$or: [{email: email}, {username: username}]});

        if(userExists) return res.status(400).json({success:false, message: ERROR_MESSAGES.USER_EXISTS});

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            username,
            password: hashedPassword,
            role: 'user',
        });

        return res.status(201).json({
            success: true,
            message: SUCCESS_MESSAGES.USER_REGISTERED,
            user: {
                _id: newUser._id,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role
        }});

    }
    catch(error)
    {
        console.log("Error registering user",error);
        res.status(500).json({success:false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR});
    }
}