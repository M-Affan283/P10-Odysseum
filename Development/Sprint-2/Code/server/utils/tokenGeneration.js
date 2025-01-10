/*

Filename: tokenGeneration.js

This file contains the function to generate a JWT access or refresh token for a user. The token is generated using the user's id and a secret key stored in the environment variables.

Author: Affan

*/


import jwt from 'jsonwebtoken';



/**
 * Generate a JWT access token for a user. This token can be used to authenticate and authorize the user to access protected routes.
 * @param {string} userId - The id of the user for whom the token is generated.
 * @returns {string} - The generated access token.
 */
export const generateAccessToken = (userId, secret) => //may need to add more params
{

}

/**
 * Generate a JWT refresh token for a user. This token can be used to refresh the access token when it expires. It is stored securely on the client side and sent to the server when needed.
 * @param {string} userId - The id of the user for whom the token is generated.
 * @returns {string} - The generated refresh token.
 */
export const generateRefreshToken = (userId, secret) => //may need to add more params
{

}

