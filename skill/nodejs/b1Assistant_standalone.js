/**
 * This is a nodejs express web server wrapper as a standalone version of b1Assistant(b1Assistant.js) 
 * alexa skill,which is orginally based on AWS Lambda function. With this wrapper, you can deploy 
 * the b1Assistant as a standalone nodejs app on a local server or cloud env, such as SAP Cloud Platform Cloud Foundry.
 * 
 * Steps of local deployment:
 * 1.The default port is 46999
 * 2.Change g_hdbServer = '<YOUR HANA HOST or IP Address HERE!>' to your HANA host or IP.
 * 3.(Optional if you need to open the local server for public internet access)Download ngrok from https://ngrok.com/download
 * 4.(Optional if using ngrok to public internet access)Run ngrok with command: ./ngrok http 46999
 * 5.Copy the public url of standalone b1Assistant nodejs app to the configuration of b1Assistant 
 * alexa skill as the end point.
 * 
 * Steps of SAP Cloud Platform Cloud Foundry:
 * 1.The port will be allocated by Cloud Foundry when the app is started.
 * 2.Change g_hdbServer = '<YOUR HANA HOST or IP Address HERE!>' to your HANA host or IP.
 * 3.Deploy the b1Assistant nodejs app to SCP CF with command: cf push
 * 4.5.Copy the public url of standalone b1Assistant nodejs app to the configuration of b1Assistant 
 * alexa skill as the end point.
 * 
 * Athors: 
 * Yatsea Li - Solution Architect - Twitter: @YatseaLi
 * All rights resversed by SAP SE
 * last mondifed on July 27 2017
 * License: This is not an offiical solution from SAP. The code is published with SCN AS-IS license.
 * You can download and modify this code by yourself. No SAP official support available.
 */

//begin of wrapper for https endpoint of b1Assistant.js
//You could deploy this alexa nodejs skill locally or on cloud foundry
const express = require('express');
const bodyParser = require('body-parser');
const b1Assistant = require('./b1Assistant.js');
const app = express();
const PORT = process.env.PORT || 46999;

app.use(({
    method,
    url
}, rsp, next) => {
    rsp.on('finish', () => {
        console.log(`${rsp.statusCode} ${method} ${url}`);
    });
    next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

app.post('/', function (req, res) {
    const context = {
        fail: () => {
            //fail with internal server error
            console.log('failure in context');
            res.sendStatus(500);
        },
        succeed: data => {
            res.send(data);
        }
    };
    b1Assistant.handler(req.body, context);
});

app.listen(PORT, function () {
    console.log('B1AssistantAlexa App listening to port ...' + PORT);
});
//end of wrapper for cloud foundry