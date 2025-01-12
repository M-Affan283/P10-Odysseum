/*

Filename: firebaseService.js

This file contains the functions to upload and delete files from Firebase Storage. The uploadFile function takes an array of files and a user ID as arguments and uploads the files to Firebase Storage. The deleteFiles function takes an array of file paths and deletes the files from Firebase Storage.

Author: Affan
*/



import { storage } from "../config/firebase.js";
import { getDownloadURL } from "firebase-admin/storage";
import { v4 as uuidv4 } from "uuid";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../utils/constants.js";

/**
 * Function to upload a file to firebase storage
 * @param {Array} files - Array of files to upload
 * @param {String} userId - User ID to create a folder in storage
 * @returns {Object} - Object containing status and message indicating success or error
 * @returns {Object} - Object containing status and urls of the uploaded files
 */

export const uploadFile = async (files = [], userId = "") => 
{
  if (!files || files.length === 0) return { status: 200, message: SUCCESS_MESSAGES.NO_FILES, urls: [] };
  if (!userId) return { status: 400, message: ERROR_MESSAGES.NO_USER_ID, urls: [] };

  const fileURLS = []; // store the URLs of the uploaded files here to return to main router function to save in Post model

  for (const file of files) 
  {
    const filepath = `${userId}/${uuidv4()}_${file.originalname}`; // generate a unique file path

    try 
    {
      const fileUpload = storage.file(filepath); // create a file object in the storage

      const metadata = {
        contentType: file.mimetype, // set the content type of the file
      };

      await fileUpload.save(file.buffer, { metadata: metadata }); // save the file to the storage
      await fileUpload.makePublic(); // make the file public
      const url = await getDownloadURL(fileUpload); // get the URL of the uploaded file

      // store the URL and filename in the array
      fileURLS.push(url);
    } 
    catch (error) 
    {
      return { status: 500, message: error.message, urls: [] };
    }
  }

  return {
    status: 200,
    message: SUCCESS_MESSAGES.FILES_UPLOADED,
    urls: fileURLS,
  };
};



/**
 * Function to delete files from firebase storage
 * @param {Array} filePathList - Array of file paths to delete
 * @returns {Object} - Object containing status and message indicating success or error
 */
export const deleteFiles = async (filePathList = []) => 
{
    if (!filePathList) return { status: 200, message: SUCCESS_MESSAGES.NO_FILES };
  
    try 
    {
      for (const url of filePathList)
      {
        // console.log(url.split('/o/')[1].split('?')[0])
        // console.log(decodeURIComponent(url.split('/o/')[1].split('?')[0]))
        let decodedUrl = decodeURIComponent(url.split('/o/')[1].split('?')[0])
        let file = storage.file(decodedUrl);
        await file.delete();
      }
  
      return { status: 200, message: SUCCESS_MESSAGES.FILE_DELETED };
    } 
    catch (error)
    {
      console.log("error: ", error);
      return { status: 500, message: ERROR_MESSAGES.SERVER_ERROR };
    }
  };
  

//testing (the code works)

// const filepath = 'testimg.png'
// import fs from 'fs'
// const fileBuffer = fs.readFileSync(filepath)

// const files = [{buffer: fileBuffer, originalname: 'testimg.png', mimetype: 'image/png'}]
// const userId = '10292103849179'

// uploadFile(files, userId).then((result) => {
//     console.log(result)
// }).catch((error) => {
//     console.log(error)
// }
// )