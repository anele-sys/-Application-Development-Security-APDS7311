# -Application-Development-Security-APDS7311

## Overview
This project demonstrates a simple Express application that serves a basic web page.

## Objective
To create and run a minimal Node.js web application that displays "Hello APDS7311" in the browser.

## Setup Instructions
1. Ensure Node.js is installed.
2. Navigate to the project folder.
3. Run:
   ```bash
   npm install
   npm start

   http://localhost:3000
   
## Technologies
  JavaScript
  Node.js
  Express


## Ensure the below is done to start testing

1. Update .env file with your own JWT_SECRET. You can generate one by running the below command in bash.
    ```bash
    openssl rand -base64 64

2. Generate your Certs. Navigate to the certs folder and open that folder in bash and then run the below command.
    ```bash
    MSYS_NO_PATHCONV=1 openssl req -x509 -newkey rsa:2048 -nodes -sha256 -days 365 -keyout localhost-key.pem -out localhost-cert.pem -subj "/CN=localhost"

3. Navigate to the api folder first and then run do not run it in the root folder:
    ```bash
    npm install
    npm start or npm run dev

Note I have added location files to show folders and structure for the team.