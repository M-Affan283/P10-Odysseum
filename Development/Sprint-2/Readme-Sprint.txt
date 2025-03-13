Project: Oddyseum
Group: P-10
Team:
1. Muhammad Affan Naved - 25100283
2. Mohammad Haroon Khawaja - 25100225
3. Shahrez Aezad - 25100212
4. Pir M. Shahraiz Chishty - 25100097
5. Luqman Aadil - 25100023

SPRINT-2 SUBMISSION GUIDELINES

1. Properly tested working system deployed on an online hosting platform.
2. Code with readable comments uploaded in “Development/Sprint-1” folder of your project’s Github repository.
3. 3-4 minutes video that explains the functionality of your system developed so far. This must be uploaded in “Sprint-1” folder of your project’s Github repository.
4. Updated architecture and data model must be uploaded in the respective folders on Github.
5. Test case execution report. 
6. Update project schedule.  
7. This "Readme" file must be uploaded in Sprint-1 folder. 



------------------------------------------------------------------------------------------------

LIST OF REQUIREMENTS COMPLETED IN THE SPRINT


<List down use cases completed in the current sprint>

1. Complete Overhaul of several screen UIs.
2. Ability for any user to be able to create a business at any tourist location.
3. Users can also search for businesses and view their profiles (inlcuding contact, email, website).
4. Users can report another user for any behaviour outside community guidelines. These reports will be stored in the database for a moderation team to check.
5. Users can add reviews for locations and businesses they visit and others can view them to make better decisions.
6. Basic backend of creating an itinerary.
7. Added a popularity scoring metric for businesses and location based on interactions.




------------------------------------------------------------------------------------------------


LIST OF REQUIREMENTS COMPLETED SO FAR

<List down use cases completed so far including those in the previous sprints>

Prototype Phase:

1. As any user (tourist or business owner), I want to be able to create and login to an account using my email or username.
2. As any user (tourist or business owner), I should be able to edit my profile and add information such as a bio.
3. As any user (tourist or business owner), I should be able to make a post which can contain images and share them with everyone.
4. As a user, I should be able to search for and view different locations and user profiles.
5. Improvements in overall UI
6. Added frontend for Home Screen. Currently, we get all available posts. We will change this to show posts of only followed users along with pagination in the next sprint.
7. Added ability of users to bookmark location they are interested in visiting.
8. Added a Post Details Screen for users to view an individual post.
9. Added the ability to write comments under a post.
10. Separated logic for searching users and locations. Previously, in the prototype both locations and users were being searched simultaneously.
11. Added a discover locations screen where users can look for popular tourist destinations and a screen to provide more details of a certain location.
12. Added ability for users to update their usernames or passwords.




------------------------------------------------------------------------------------------------

HOW TO ACCESS THE SYSTEM

<Specify how your system can be accessed including URLs, user credentials etc.>

On your Android phone, download the Expo Go app from the following URL: https://d1ahtucjixef4r.cloudfront.net/Exponent-2.31.2.apk

This will download an APK file and you must install it on your phone.

Now on your machine:
1. For the frontend to work, clone the repository and navigate to Development/Sprint-1/Code/odysseum-frontend

2. Install the required packages using "npm install".

3. In the terminal, run "npx expo start" or "npm run start".

4. This will start the app display a QR Code in the terminal.

5. Open Expo App on you phone, select scan QR code and scan the code. This will open up the app and you will now be able to navigate and use it.

For server:
1. In case the deployed backend server does not respond you can try to run the server on your local machine.
2. To do so open another terminal and navigate to server directory.
3. Install nodemon using "npm i nodemon -g".
4. Then run "npm install"
5. Finally run "nodemon server.js" to start up the server.
6. In the front end, navigate to /src/util/axios.js. There in API_BASE_URL, replace the value there to <your-ip-address>:8000/api
7. Your frontend should now be able to communicate with the server. (Restart the frontend too)

NOTE:
If you wish to use the deployed backend URL: https://p10-odysseum.onrender.com You must replace the API_BASE_URL to https://p10-odysseum.onrender.com/api.



------------------------------------------------------------------------------------------------



ADDITIONAL INFORMATION

<Any additional information that you would like me to know>

Date Submitted: 02-February-2025


