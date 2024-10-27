/*

Filename: constants.js

This file contains all the constants used in the application. This includes error messages, success messages, regex patterns, etc.

Author: Affan

*/

const ERROR_MESSAGES = { //add more error messages as needed
    INTERNAL_SERVER_ERROR: "Internal server error",
    INVALID_CREDENTIALS: "Invalid username or password",
    INVALID_EMAIL: "Invalid email",
    INVALID_USERNAME: "Invalid username",
    EMAIL_ALREADY_EXISTS: "Email already exists",
    USERNAME_ALREADY_EXISTS: "Username already exists",
    INVALID_TOKEN: "Invalid token",
    TOKEN_EXPIRED: "Token expired",
    NO_TOKEN_PROVIDED: "No token provided",
    UNAUTHORIZED: "Unauthorized",
    USER_NOT_FOUND: "User not found",
    INVALID_PASSWORD: "Invalid password",
    INVALID_IDENTIFIER: "Invalid email/username",
    INVALID_RESET_TOKEN: "Invalid reset token",
    INVALID_PASSWORD_RESET: "Invalid password reset",
    INVALID_FILE_TYPE: "Invalid file type",
    FILE_TOO_LARGE: "File too large",
    INVALID_FILE: "Invalid file",
    INVALID_USER: "Invalid user",
    INVALID_POST: "Invalid post",
    INVALID_COMMENT: "Invalid comment",
    INVALID_LIKE: "Invalid like",
    INVALID_FOLLOW: "Invalid follow",
    INVALID_UNFOLLOW: "Invalid unfollow",
    INVALID_REQUEST: "Invalid request",
    INVALID_NOTIFICATION: "Invalid notification",
    INVALID_MESSAGE: "Invalid message",
    INVALID_CHAT: "Invalid chat",
    INVALID_GROUP: "Invalid group",
    DATABASE_CONNECTION_ERROR: "Error connecting to database",
    MISSING_FIELDS: "Please fill in all fields",
}

const SUCCESS_MESSAGES = { //add more success messages as needed
    USER_REGISTERED: "User registered successfully",
    USER_LOGGED_IN: "User logged in successfully",
    PASSWORD_RESET: "Password reset successful",
    PASSWORD_CHANGED: "Password changed successfully",
    PROFILE_UPDATED: "Profile updated successfully",
    POST_CREATED: "Post created successfully",
    POST_UPDATED: "Post updated successfully",
    POST_DELETED: "Post deleted successfully",
    COMMENT_CREATED: "Comment created successfully",
    COMMENT_DELETED: "Comment deleted successfully",
    LIKE_CREATED: "Like created successfully",
    LIKE_DELETED: "Like deleted successfully",
    FOLLOWED: "Followed successfully",
    UNFOLLOWED: "Unfollowed successfully",
    REQUEST_SENT: "Request sent successfully",
    REQUEST_ACCEPTED: "Request accepted successfully",
    REQUEST_REJECTED: "Request rejected successfully",
    NOTIFICATION_SENT: "Notification sent successfully",
    MESSAGE_SENT: "Message sent successfully",
    CHAT_CREATED: "Chat created successfully",
    GROUP_CREATED: "Group created successfully",
    GROUP_UPDATED: "Group updated successfully",
    GROUP_DELETED: "Group deleted successfully"
}

const REGEX_PATTERNS =  {
    EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, //email should be in the format of text@text
    USERNAME: /^[a-zA-Z0-9._-]{3,}$/, //username should be at least 3 characters long and can contain letters, numbers, dots, underscores, and hyphens
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, //password should be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number and one special character
    IMAGE_TYPE: /\.(jpg|jpeg|png|gif)$/i, //file type should be jpg, jpeg, png, or gif
    VIDEO_TYPE: /\.(mp4|avi|mov|flv)$/i //file type should be mp4, avi, mov, or flv
}
    
export { ERROR_MESSAGES, SUCCESS_MESSAGES, REGEX_PATTERNS};