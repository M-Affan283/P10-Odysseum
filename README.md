# Odysseum
## Group 10 Senior Year Project

## Table of Contents

1. [Pre-Requisites](#pre-requisites)
2. [Managing Odysseum Repository](#managing-odysseum-repository)
3. [Running the Project](#running-the-project)
4. [File Directories Present](#file-directories-present)

### Pre-Requisites
Install nodemon by typing the following command in your terminal.
``` npm install -g nodemon ```
Nodmeon allows you to run both and server and client scripts and will automatically rerun any script that is edited without having to do `npm start`.
The `-g` flag installs `nodemon` globally.

Run the following command in your terminal to clone the repo:
```
  git clone https://github.com/M-Affan283/P10-Odysseum.git
```

When you have the repository on your local machine both the client and server folders will have a `package.json` file that contains the node module dependencies.
In both folders, using your terminal run the following terminal commands. The bulk of code will be written inside the Development folder.
```
  
  # Navigate to the Development/Spring-<N>/Code directory
  
  cd server
  npm install
  cd ../oddyseum-frontend
  npm install
```

Additionally we will be using MongoDB for our database. I have created an account on MongoDB Atlas. However, if you wish to use MongoDB locally, install the MongoDB Community Server from [here](https://www.mongodb.com/try/download/community). The installer will also ask you if you wish to download MongoDB Compass. You must select it for local database access.
If it doesn't you can download MongoDB Compass manually from [here](https://www.mongodb.com/try/download/compass).

Once installed, create a new connection to in MongoDB compass and create a database with name `OdysseumDataBase` and collection with name `OdysseumCollection`. You can then run the node server.


### Managing Odysseum Repository

After cloning the Odysseum to your local machine, all work must be done on your own branch. Create your branch by typing the following in your terminal:
``` git checkout -b <name>-branch ```
Replace `<name>` with your name.

>[!IMPORTANT]
>1. Do not attempt to work on the code in the main branch.
>2. Do not merge your code into the main branch on your local machine.
>3. Only commit and push your own branches onto the GitHub repo and submit a pull request.

To commit and push your code onto your branch use the following commands in the terminal:
```
  #If you want to add all modified files use:
  git add .
  git commit -a -m "your commit message"

  #Otherwise use:
  git add <filename-1>.....<filename-n>
  git commit -m "your commit message"

  # This code is necessary in both cases
  git push origin <your-branch>
```

Once pushed submit a pull a request and I will merge your code into main. After the code is merged i will notify you and you must pull the changes into your machine:
```
  git switch main
  git pull
```

If you wish to merge main with your own branch so that your branch gets the latest code you may type the following:
```
  git switch <your-branch>
  git merge main

  // OR

  git switch <your-branch>
  git pull origin main
```
Always make sure that your branch has the latest code.


### Running the Project

If you have followed all instructions in the Pre-Requisites Section, you should be able to run the project.
Start of by opening two terminals in the directory. Then run the following:
```
  #Terminal 1
  cd server
  nodemon server.js local (if you wish to use local MongoDB database)

  or

  nodemon server.js remote (if you wish to use MongoDB Atlas database)

  #Terminal 2
  cd odysseum-frontend
  npx expo start or npx expo start -c for cacheless run

```

Upon successful startup a you will be provided a QR code which you can scan on your phones to run the app using Expo Go. You must install the Expo Go app on your phone.

### File Directories Present

The repository consists of multiple file directories. You can navigate to each folder and read the ``` purpose.txt ``` file to learn more about them.



