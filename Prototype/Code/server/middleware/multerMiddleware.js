/*

Filename: multerMiddleware.js

This file contains the multer middleware to handle file uploads. It uses the multer library to handle file uploads and restricts the file types to images and videos.

Author: Affan


*/

import multer from "multer";
import { ERROR_MESSAGES } from "../utils/constants.js";

// Setup multer middleware to handle file uploads
/**
 * Multer middleware to handle file uploads
 */
const upload = multer({
    storage: multer.memoryStorage(), // store files in memory
    limits: {
        fileSize: 20 * 1024 * 1024, // 20 MB file size limit
    },
    fileFilter: (req, file, cb) => { // only allow images and videos
        if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
            cb(null, true);
        } else {
            cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
        }
    }
});

//disk storage multer (might use later)
// const upload = multer({
//     storage: multer.diskStorage({
//         destination: function (req, file, cb) {
//             let temp_folder = '../uploads'
//             cb(null, temp_folder)
//         },
//         filename: function (req, file, cb) {
//             cb(null, file.originalname)
//         }
//     }),
//     limits: {
//         fileSize: 30 * 1024 * 1024, // 30 MB file size limit
//     },
//     fileFilter: (req, file, cb) => { // only allow images and videos
//         if (file.mimetype.startsWith('image') || file.mimetype.startsWith('video')) {
//             cb(null, true);
//         } else {
//             cb(new Error(ERROR_MESSAGES.INVALID_FILE_TYPE), false);
//         }
//     }
// })

export default upload;