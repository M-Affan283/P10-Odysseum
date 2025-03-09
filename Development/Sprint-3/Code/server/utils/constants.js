/*

Filename: constants.js

This file contains all the constants used in the application. This includes error messages, success messages, regex patterns, etc.

Author: Affan & Shahrez

*/

/**
 * Common Error messages to be used in the application
 * @constant ERROR_MESSAGES'
 */
const ERROR_MESSAGES = { //add more error messages as needed
    INTERNAL_SERVER_ERROR: "Internal server error",
    INVALID_CREDENTIALS: "Invalid email/username or password",
    INVALID_EMAIL: "Invalid email",
    INVALID_USERNAME: "Invalid username",
    EMAIL_ALREADY_EXISTS: "Email already exists",
    USERNAME_ALREADY_EXISTS: "Username already exists",
    INVALID_TOKEN: "Invalid or expired token",
    NO_TOKEN_PROVIDED: "No token provided",
    TOKEN_EXPIRED: "Token has expired",
    INVALID_REFRESH_TOKEN: "Invalid refresh token",
    REFRESH_TOKEN_EXPIRED: "Refresh token has expired",
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
    NO_FILE_UPLOADED: "No file uploaded",
    NO_FILE_PATH: "No file path provided",
    NO_USER_ID: "No user ID provided",
    NO_LOCATION_ID: "No location ID provided",
    FILE_DELETE_ERROR: "Error deleting file",
    NO_POST_ID: "No post ID provided",
    NO_TEXT: "No text provided",
    SERVER_ERROR: "Internal Server error. Check the server logs for more information",
    NO_COMMENTS: "No comments found",
    NO_COMMENT_ID: "No comment ID provided",
    CANNOT_REPLY_TO_REPLY: "Cannot reply to a reply",
    NOT_FOLLOWING: "You are not following this user",
    NO_POSTS: "No posts found",
    NO_REQUESTOR_ID: "No requestor ID provided",
    NO_CURSORS: "No cursors provided for pagination",
    REQUESTOR_NOT_FOUND: "Requestor not found",
    LOCATION_NOT_FOUND: "Location not found",
    LOCATION_ALREADY_EXISTS: "Location already exists",
    USER_EXISTS: "User already exists",
    INVALID_ITINERARY: "Invalid itinerary",
    USER_NOT_FOUND: "User not found",
    CANNOT_REPORT_SELF: "You cannot report yourself",
    CHAT_NOT_FOUND: "Chat not found",
    MESSAGE_NOT_FOUND: "Message not found",
    INVALID_CHAT_PARTICIPANTS: "Invalid chat participants",
    INVALID_MESSAGE_CONTENT: "Message content cannot be empty",
    UNAUTHORIZED_CHAT_ACCESS: "You are not authorized to access this chat",
    MESSAGE_SEND_FAILED: "Failed to send message",
    SOCKET_AUTH_FAILED: "Socket authentication failed",
    SOCKET_CONNECTION_LIMIT: "Maximum connection limit reached",
    INVALID_MEDIA_TYPE: "Invalid media type",
    MEDIA_UPLOAD_FAILED: "Failed to upload media",
}

/**
 * Common Success messages to be used in the application
 * @constant SUCCESS_MESSAGES
*/
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
    GROUP_DELETED: "Group deleted successfully",
    FILE_DELETED: "File deleted successfully",
    NO_FILES: "No files to delete",
    USER_FOLLOWED: "User followed successfully",
    USER_UNFOLLOWED: "User unfollowed successfully",
    COMMENTS_FOUND: "Comments found successfully",
    REPLY_ADDED: "Reply added successfully",
    FILES_UPLOADED: "Files uploaded successfully",
    USER_UPDATED: "User updated successfully",
    LOCATION_ADDED: "Location added successfully",
    ITINERARY_CREATED: "Itinerary created successfully",
    REPORT_SUBMITTED: "Report submitted successfully",
}


/**
 * Common Regex patterns to be used in the application
 * @constant REGEX_PATTERNS
 * @property {RegExp} EMAIL - email should be in the format of text@text
 * @property {RegExp} USERNAME - username should be at least 3 characters long and can contain letters, numbers, dots, underscores, and hyphens
 * @property {RegExp} PASSWORD - password should be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number and one special character
 * @property {RegExp} IMAGE_TYPE - file type should be jpg, jpeg, png
 * @property {RegExp} VIDEO_TYPE - file type should be mp4, avi, mov, or flv
*/

const REGEX_PATTERNS =  {
    EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, //email should be in the format of text@text
    USERNAME: /^[a-zA-Z0-9._-]{3,}$/, //username should be at least 3 characters long and can contain letters, numbers, dots, underscores, and hyphens
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/, //password should be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number and one special character
    IMAGE_TYPE: /\.(jpg|jpeg|png|gif)$/i, //file type should be jpg, jpeg, png
    VIDEO_TYPE: /\.(mp4|avi|mov|flv)$/i //file type should be mp4, avi, mov, or flv
}
    
export { ERROR_MESSAGES, SUCCESS_MESSAGES, REGEX_PATTERNS};