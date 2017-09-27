# This files are NOT part of the HANA XS Application 
The alexa skill b1Assistant.js has been moved from ./skill folder to ./skill/nodejs folder for sharing the same code between AWS Lambda function and stand alone alexa deloyment below.

Apart from deployment with AWS Lambda function,  Now you also can deploy the alexa skill locally or cloud foundry as standalone nodejs app. Follow the steps below:

### Step 1: Deploy the standalone b1Assistant locally or on a cloud platform with node run-time. 
   - To deploy locally, run the command below:
```sh
$ cd ./skill/nodejs
$ npm install
$ npm start
```
   - To deploy on SAP Cloud Platform Cloud Foundry, run the command below:
```sh
$ cd ./skill/nodejs
$ cf push
```

If you are new to SAP Cloud Platform Cloud Foundry, please refer to this youtube video:
https://youtu.be/fOraTnTZktI

### Step 2: Update the end point of alexa skill with HTTPS instead of AWS Lambda ARN in the configuration section of your Alexa skill.
