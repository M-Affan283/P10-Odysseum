Project: Oddyseum
Group: P-10
Team:
1. Muhammad Affan Naved - 25100283
2. Mohammad Haroon Khawaja - 25100225
3. Shahrez Aezad - 25100212
4. Pir M. Shahraiz Chishty - 25100097
5. Luqman Aadil - 25100023

SPRINT-3 SUBMISSION GUIDELINES

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

1. Completed proof of concept payment system for booking system. (Muhammad Affan)
2. Admin can create more admins and moderators via dashboard. (Shahrez Aezad)
3. Flask server to serve review summarizer. (Muhammad Affan, Haroon Khawaja)
4. Ability to view posts based on locations and various other filters. (Shahraiz Chisty, Luqman Aadil)
5. Admin can now add new tourist locations via dashboard. (Shahrez Aezad)
6. Newly created businesses now need an approval from admin before advertising on platform. (Shahrez Aezad, Muhammad Affan)
7. Improved itinerary creation logic. (Haroon Khawaja)




------------------------------------------------------------------------------------------------


LIST OF REQUIREMENTS COMPLETED SO FAR

<List down use cases completed so far including those in the previous sprints>

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
13. Complete Overhaul of several screen UIs.
14. Ability for any user to be able to create a business at any tourist location.
15. Users can also search for businesses and view their profiles (inlcuding contact, email, website).
16. Users can report another user for any behaviour outside community guidelines. These reports will be stored in the database for a moderation team to check.
17. Users can add reviews for locations and businesses they visit and others can view them to make better decisions.
18. Basic backend of creating an itinerary.
19. Added a popularity scoring metric for businesses and location based on interactions.
20. Complete Overhaul of several screen UIs. (Muhammad Affan, Haroon Khawaja)
21. Ability for any user who owns a business to create a service offering for customers. (Muhammad Affan)
22. Added a fully customizable service creation system allowing users to specify intricate details such as pricing, booking, availability and payment settings. (Muhammad Affan)
23. Added the ability to make use of maps when creating a business to specify business coordinates.(Muhammad Affan)
24. Users can also search for services and view their profiles. (Muhammad Affan)
25. Users can now also view the location of a business on a map on its profile page. (Muhammad Affan)
26. Users can also view all the businesses in a location in the form of a map or a heatmap. (Both choices are given) (Muhammad Affan)
27. Web scraped data from multiple websites such as Booking.com and Airbnb to get businesses, locations and user reviews. This data is fed to the customized chatbot for providing recommendations to users. Certain python scripts were also used to perform data analysis, parse and store data in the remote database (Shahraiz Chishty, Luqman Aadil)
28. Created a web app for admins and moderators to respond to user and post reports take appropriate actions. (Shahrez Aezad)
29. Real time chat feature between users. (Shahrez Aezad)
30. Chatbot for providing location recommendations to users and creating an itinerary for them. (Haroon Khawaja)




------------------------------------------------------------------------------------------------

HOW TO ACCESS THE SYSTEM

<Specify how your system can be accessed including URLs, user credentials etc.>

On your Android phone, download the Expo Go app from the following URL: https://d1ahtucjixef4r.cloudfront.net/Exponent-2.31.2.apk

This will download an APK file and you must install it on your phone.
Make sure the Expo Go app supports Expo SDK v51.

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

For LLM Server:
1. To run the LLM server locally, you must have python installed on your machine.

2. Navigate to server directory and run "pip install -r requirements.txt".

3. Then run py llm_server.py to start the server.

4. In the front end, navigate to /src/util/llm_axios.js. There in API_BASE_URL, replace the value there to <your-ip-address>:5000/api/llm.

5. Your frontend should now be able to communicate with the server. (Restart the frontend too)

NOTE:
If you wish to use the deployed backend URL: https://p10-odysseum.onrender.com You must replace the API_BASE_URL to https://p10-odysseum.onrender.com/api.

If you wish to use the deployed LLM Server URL: https://p10-odysseum-1.onrender.com. You must replace the API_BASE_URL to https://p10-odysseum-1.onrender.com/api/llm.



------------------------------------------------------------------------------------------------



ADDITIONAL INFORMATION

<Any additional information that you would like me to know>

Date Submitted: 13-April-2025


