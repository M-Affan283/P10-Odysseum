/*

Filename: loginUser.js

This file contains the controller function for logging in a user. It checks if the email and password provided by the user match an existing user in the database.

Author: Affan
*/


import { User } from "../../models/User.js";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../utils/constants.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/tokenGeneration.js";
import bcrypt from 'bcryptjs';

export const loginUser = async (req, res) =>
{
    //user can login with either email or username
    const { identifier, password } = req.body;
    // console.log(req.body)
    console.log("Logging in user", identifier, " " ,password);
    if(!identifier || !password) return res.status(400).json({success:false, message: ERROR_MESSAGES.MISSING_FIELDS});

    try
    {
        //check if user exists
        const user = await User.findOne({$or: [{email: identifier}, {username: identifier}]}).select('+password');

        if (!user) return res.status(401).json({success:false, message: ERROR_MESSAGES.INVALID_CREDENTIALS});

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) return res.status(401).json({success:false, message: ERROR_MESSAGES.INVALID_CREDENTIALS});

        //generate access and new refresh token. store refresh token in db and send access token in response
        let refreshToken;
        let accessToken; //placeholder (add code later)
        //
    
        let newuser = user.newUser;

        user.newUser = false;
        await user.save();

        return res.status(200).json({
                success: true,
                message: SUCCESS_MESSAGES.USER_LOGGED_IN,
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    username: user.username,
                    profilePicture: user.profilePicture,
                    bio: user.bio,
                    role: user.role,
                    newUser: newuser,
                    following: user.following,
                    followers: user.followers
                },
                // accessToken: accessToken //send access token in response. store in react native secure store
            })
    }
    catch(error)
    {
        console.log("Error logging in user",error);
        res.status(500).json({success:false, message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR});
    }
}


//If user is logging in with google. In frontend, use expo-google-sign-in to get the user's google id token and send it to the server. (IMplement this in the future)
export const oAuthLoginUser = async (req, res) =>
{
    return null;
}