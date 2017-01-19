/**
 * This code implements an integration of SAP Business One on HANA with Amazon Alexa
 * Built By Ralph Oliveira - B1 Solution Architect - Twitter: @Ralphive
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.

var g_hdbServer = 'YOUR HANA IP Adress';
var g_hdbPort  = 8000; // Http(8000) or Https(4300)  
var g_hdbService = '/b1Assistant/services';

exports.handler = function (event, context) {
    try {
        //console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * prevent someone else from configuring a skill that sends requests to this function.
         * To be uncommented when SKill is ready
        
        if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.c014e6d6-a7a4-44ee-8b2f-9b10c7969743") {
             context.fail("Invalid Application ID");
        }p
         */
        
        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
                onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId +
        ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    console.log("onLaunch requestId=" + launchRequest.requestId +
        ", sessionId=" + session.sessionId);

    // Dispatch to skill's launch.
    getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
   // console.log("onIntent requestId=" + intentRequest.requestId +
     //   ", sessionId=" + session.sessionId);

    console.log(intentRequest);
    var intent = intentRequest.intent;
        intentName = extractValue('PreviousIntent', intent, session);
        
    console.log('Itent RECEIVED is '+ intent.name);
    console.log('PREVIOUS intent was '+ intentName);

        
    if ("AMAZON.StopIntent" === intent.name || 
        "AMAZON.CancelIntent" === intent.name) {
        handleSessionEndRequest(callback);
    }
    
    
        
    if(intentName === null){
        intentName = intent.name;
    }


    // Dispatch to your skill's intent handlers
    
    switch(intentName){
    case "GetSalesGroups":
        getSalesGroups(intent, session, callback);
        break;
    
    case "SayHello":
        sayHello(intent, session, callback);
        break;
    
    case "SalesInfo":
        getSalesInfo(intent, session, callback);
        break;
    case "MakePurchase":
        postPurchase(intent, session, callback);
        break;
    case "SaleRecommend":
        saleRecommend(intent, session, callback);
        break;
    case "AMAZON.HelpIntent":
        getWelcomeResponse(callback);
        break;
    default:
        throw "Invalid intent";
    }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
    console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId +
        ", sessionId=" + session.sessionId);
    // Add cleanup logic here
}


// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
    // If we wanted to initialize the session to have some attributes we could add those here.
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = getWelcomeMessage();
        
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = 'What is my command, master?';
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    var speechOutput = "Thank you for using B1 Assistant. Have a nice day!";
    
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * SAP HANA Interactions
 */

 function sayHello(intent, session, callback) {
    
    var cardTitle = intent.name;
    var firstName = intent.slots.FirstName.value;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    
    var test = extractValue('FirstName', intent, session);

    console.log("Say Hello to: "+ firstName);

    if (firstName) {
        speechOutput = "Hello my lord, "+ firstName+
                        ". Brace yourself, winter is comming";
        repromptText = "At last we will have our revenge.";
    } else {
        speechOutput = "Your name is so weird that I can't say it.";
        repromptText = "Any other normal name?";
    }

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getSalesGroups(intent, session, callback) {
    
    
    var GroupFilter = intent.slots.ItemGroup.value;
    console.log("GroupFilter received is "+ GroupFilter)
    GroupFilter = formatItemGrp(GroupFilter);
    GroupFilter = GroupFilter.replace(/ /g, "%20");
    
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    restCall(    
            "/sales.xsodata/ItemGroupAll("+quotes(GroupFilter)+")",  // Endpoint
            "?$format=json", // Filter
        
        function (response) {
            console.log("response is "+ response)
            response = response.d;

            if(response.ITEMGROUP && response !== undefined){
                speechOutput =  "Currently, our " + response.ITEMGROUP +
                            " sales are on " + response.SumLineTotal + " " + 
                            response.ChkName
            }else{
                speechOutput =  "There are no sales for "+ intent.slots.ItemGroup.value
            }
            
            callback(sessionAttributes,
                buildSpeechletResponse(
                        intent.name, speechOutput, 
                        repromptText, shouldEndSession
                )
            );
        }
    );    
}
function saleRecommend(intent, session, callback) {
    
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";



    if (intent.name == "AMAZON.YesIntent"){
        ItemRecom = extractValue('ItemRecom', intent, session)
        
        var params =    '?action=SalesOrder' +
                        '&item='+ItemRecom+
                        '&qty=1';
        params = params.replace(/ /g, "%20"); // Avoid unescaped characters
        console.log('XSJS Params= '+ params);
        
        restCall(    
                "/b1Call.xsjs",  // Endpoint
                params,          //Parameters
    
            function (response) {
                console.log("response is "+ response);
                

               if(response.StatusCode != '201'){
                    speechOutput = "I am sorry, but there was an error creating your order.";
                    
                }else{
                    speechOutput =  "Your order number "+response.DocNum+" was placed successfully! "+
                                    "The total amount of your purchase is "+ response.DocTotal+
                                    " "+ response.DocCurrency;                    
                }
                
                shouldEndSession = true;
    
                // call back with result
                callback(sessionAttributes,
                    buildSpeechletResponse(
                            intent.name, speechOutput, 
                            repromptText, shouldEndSession
                    )
                );
            }
        );  
        return;
    }else if (intent.name != "AMAZON.NoIntent") {
        sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);
    }

    restCall(    
            "/b1Call.xsjs",  // Endpoint
            "?action=SalesRecommend", // Filter
        
        function (response) {
            //console.log("response is "+ response.resultSet)
            var PreviousIntent = extractValue('PreviousIntent', intent, session);
            var random = getRandomInt(0, response.resultSet.length-1);

            sessionAttributes = handleSessionAttributes(sessionAttributes, 'ItemRecom', response.resultSet[random].ItemCode);
            sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', PreviousIntent);

            
            if (intent.name == "AMAZON.NoIntent"){
                
                speechOutput = getItemRecomendMessage(response.resultSet[random].ItemName);
                repromptText = "You can say no to this recommendation. So I can think about something else."
            }
            else{
                speechOutput =  "I think you will like " + response.resultSet[random].ItemName + 
                            ". Can I order you a pack?"
                repromptText = "You can say no to this recommendation. So I can think about something else."

            }

            
            callback(sessionAttributes,
                buildSpeechletResponse(
                        intent.name, speechOutput, 
                        repromptText, shouldEndSession
                )
            );
        }
    );    
}


function getSalesInfo(intent, session, callback) {
    
    //Default
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    //Define Variables from Intent or from Session Attributes
    
    console.log("INTENT RECEIVED");
    console.log(JSON.stringify(intent));
    console.log("SESSION RECEIVED")
    console.log(JSON.stringify(session));
    
    
    var ItemGroup = extractValue('ItemGroup', intent, session)
    var SalesQuarter = extractValue('SalesQuarter', intent, session)
    var SalesYear = extractValue('SalesYear', intent, session)
  /**  
    ItemGroup = 'laser printers';
    SalesQuarter = 'first';
    SalesYear = '2009';
    **/
    console.log ("ItemGroup Extraido "+ ItemGroup);
    console.log ("SalesQuarter Extraido "+ SalesQuarter);
    console.log ("SalesYear Extraido "+ SalesYear);
        
    
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'ItemGroup', ItemGroup);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesQuarter', SalesQuarter);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesYear', SalesYear);

    console.log("Vao ser exportados " + JSON.stringify(sessionAttributes));
    

    if (ItemGroup == null) {
        speechOutput = "Which Item Group do you want to know?";
        repromptText = "For example, Servers or Laser Printers?";
    } else if(SalesQuarter == null){
        speechOutput = "Got it! What quarter?";
        repromptText = "Tell me the quarter and the year.";
    } else if(SalesYear == null){
        speechOutput = "What year do you need?";
        repromptText = "You can do it, tell me a year.";
    } else {
        
        var b1Quarter = formatQuarter(SalesQuarter);
            ItemGroup = formatItemGrp(ItemGroup);
        var oDataFilter =   'ITEMGROUP'+op('eq')+quotes(ItemGroup)+op('and')+
                            'DUE_QUARTER'+ op('eq')+quotes(b1Quarter)+op('and')+
                            'DUE_YEAR'+ op('eq')+quotes(SalesYear);

        oDataFilter = oDataFilter.replace(/ /g, "%20"); // Avoid unescaped characters
                
        console.log('OdataFilter = '+ oDataFilter);
    
        restCall(    
                "/sales.xsodata/ItemGroup",  // Endpoint
                "?$format=json&$filter="+oDataFilter, //Filter
    
            function (response) {
                console.log("response is "+ response);
                response = response.d.results;
                
                if(response.length ==0 || response == undefined){
                    speechOutput = "I am sorry, but there are no "+ItemGroup+ 
                    " sales in the " + SalesQuarter + " quarter of " + SalesYear;
                    
                }else{
                    speechOutput =  "The sales of " + response[0].ITEMGROUP +
                                    " For the " + stringQuarter(b1Quarter) + " quarter of " + 
                                    SalesYear + " are " + response[0].SumLineTotal + " " + 
                                    response[0].ChkName+".";                    
                }
                
                shouldEndSession = true;
    
                // call back with result
                callback(sessionAttributes,
                    buildSpeechletResponse(
                            intent.name, speechOutput, 
                            repromptText, shouldEndSession
                    )
                );
            }
        );  
        return;
    }
    
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);

    
    // Call back while there still questions to ask
    callback(sessionAttributes,
        buildSpeechletResponse(
                intent.name, speechOutput, 
                repromptText, shouldEndSession
        )
    );
}


function postPurchase(intent, session, callback) {
    
    //Default
    var repromptText = null;
    var sessionAttributes = {};
    var shouldEndSession = false;
    var speechOutput = "";

    //Define Variables from Intent or from Session Attributes
    console.log("INTENT RECEIVED");
    console.log(JSON.stringify(intent));
    console.log("SESSION RECEIVED")
    console.log(JSON.stringify(session));
    
    
    var ItemName = extractValue('ItemName', intent, session)
    var Quantity = extractValue('Quantity', intent, session)
    var ItemRecom = extractValue('ItemRecom', intent, session)

    var ItemTopping = null;
    //var ItemRecom = null;


    var ItemRecomName = null;
    var params = null;


    console.log ("ItemName Extraido "+ ItemName);
    console.log ("Quantity Extraido "+ Quantity);

    
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'ItemName', ItemName);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'Quantity', Quantity);



    if (intent.name == "AMAZON.YesIntent"){
        ItemRecom = extractValue('ItemRecom', intent, session)
    }else if (intent.name == "AMAZON.NoIntent"){
        ItemRecom = "";
    }else{
        sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);
    }


    if (ItemName == null) {
        speechOutput = "Should I get you printer ink, paper or maybe an USB drive.";
        repromptText = "You can say. I need printer ink. Or Buy me an USB drive";
    } else if(Quantity == null){
        speechOutput = "Ok, how many packs do you need?";
        repromptText = "Tell me the quantity you need.";
    } else if(ItemRecom == null && intent.name != "AMAZON.NoIntent" ){
        
        params = "?action=SalesRelated&item="+ItemName; 
        params = params.replace(/ /g, "%20");   // Avoid unescaped characters

        restCall(    
            "/b1Call.xsjs",  // Endpoint
            params,          // Filter
            function (response) {
                console.log("RECOMENDADO - "+ response);
                
                if(response.resultSet.length == 0 ){
                    // If no recommendation is found. Then make a question for more items
                    ItemRecom =  "Do you need anything else?";
                    speechOutput = "Do you need anything else?";
                }else{
                    var random = getRandomInt(0, response.resultSet.length-1);;
                    ItemRecom = response.resultSet[random].ItemCode
                    ItemRecomName = response.resultSet[random].ItemName
                    
                    console.log("RETORNO - "+ ItemRecom);
                    
                    sessionAttributes = handleSessionAttributes(sessionAttributes, 'ItemRecom', ItemRecom);
                    
                    speechOutput = getItemRelatedMessage(ItemRecomName, ItemName);
                    repromptText = "I think you will love " + ItemRecomName+". But I need your approval to buy it";

                }
                callback(sessionAttributes,
                    buildSpeechletResponse(
                            intent.name, speechOutput, 
                            repromptText, shouldEndSession
                    )
                );
            }
        );     
        return;
    }
    else {
        
        params =    '?action=SalesOrder' +
                    '&item='+ItemName+
                    '&qty='+Quantity;
        
        if(ItemRecom){
            params +='&item2='+ItemRecom;
        }                        
                
        params = params.replace(/ /g, "%20"); // Avoid unescaped characters
        console.log('XSJS Params= '+ params);
        
        restCall(    
                "/b1Call.xsjs",  // Endpoint
                params,          //Parameters
    
            function (response) {
                console.log("response is "+ response);
                

               if(response.StatusCode != '201'){
                    speechOutput = "I am sorry, but there was an error creating your order.";
                    
                }else{
                    speechOutput =  "Your order number "+response.DocNum+" was placed successfully! "+
                                    "The total amount of your purchase is "+ response.DocTotal+
                                    " "+ response.DocCurrency;                    
                }
                
                shouldEndSession = true;
    
                // call back with result
                callback(sessionAttributes,
                    buildSpeechletResponse(
                            intent.name, speechOutput, 
                            repromptText, shouldEndSession
                    )
                );
            }
        );  
        return;
    }
    
    console.log("Vao ser exportados " + JSON.stringify(sessionAttributes));
    
    // Call back while there still questions to ask
    callback(sessionAttributes,
        buildSpeechletResponse(
                intent.name, speechOutput, 
                repromptText, shouldEndSession
        )
    );
}


function restCall(endPoint, filter, response) {

    var http = require('http');
    var options = {
        host: g_hdbServer,
        port: g_hdbPort,
        path: g_hdbService+endPoint+filter,
        agent: false,
        timeout: 50000
    };

    console.log('start request to ' + g_hdbServer+":"+g_hdbPort+g_hdbService+endPoint+filter)
    
    http.get(options, function (res) {
        var body = '';
        
        console.log("Response: " + res.statusCode);
        
        res.on('data', function (d) {
            console.log('BODY CHUNK: ' + d);
            body +=d;
        });
        
        res.on('end', function() {      
            console.log('BODY END '+ body);     
           var parsed = JSON.parse(body);       
            response(parsed);       
                    
        });
    }).on('error', function (e) {
        console.log("Error message: " + e.message);
        response(false)
    })

}

// --------------- Handle of Session variables -----------------------


function extractValue(attr, intent, session){
    
    console.log("Extracting " +attr);
    
    if (session.attributes){
        if (attr in session.attributes) {
            console.log ("Session attribute "+ attr +" is " +  session.attributes[attr]); 
            return session.attributes[attr];
        }
    }
    
    console.log("No session attribute for "+attr);

    if (intent.slots){
        if (attr in intent.slots && 'value' in intent.slots[attr]){
          return intent.slots[attr].value;
        }
    };
    return null;
}

function handleSessionAttributes(sessionAttributes, attr, value){

    //if Value exists as attribute than returns it
    
    if(value){
       sessionAttributes[attr] = value;
    }
    return sessionAttributes;
}

// --------------- Auxiliar Functions Formatting -----------------------

function quotes(val){
    return "%27"+val+"%27";
}

function op(op){
    return "%20"+op+"%20";
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatQuarter(input){
    
    if (input == 'first' || input == '1st' || input == 'Q1' ){
        return '01';
    }
    
    if (input == 'second' || input == '2nd'|| input == 'Q2' ){
        return '02';
    }
    
    if (input == 'third' || input == '3rd' || input == 'Q3'){
        return '03';
    }
    
    if (input == 'fourth' || input == '4th'|| input == 'Q4' ){
        return '04';
    }
    
}

function stringQuarter(input){
    
    if (input == '01'){
        return 'first';
    }
    
    if (input == '02'){
        return 'second';
    }
    
    if (input == '03'){
        return 'third';
    }
    
    if (input == '04'){
        return 'fourth';
    }
    
}

function formatItemGrp(itemGrp){
    //Assures the item group name is formatted correctly
    
    itemGrp = itemGrp.toLowerCase();
    
    if (itemGrp == 'pc'){
        return 'PC';
    }
    return toTitleCase(itemGrp)
}

function toTitleCase(str)
{
    //Capitlize the first letter of each word on a given string
    return str.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

// -------------------- Speech Functions Formatting -----------------------
function getWelcomeMessage(){
    var message = [];
    
    message[0] = "Welcome to B1 Assistant. How can I help?"
    message[1] = "Hi, I am your B1 assistant. How can I Help you today?"
    message[2] = "This is B1 assistant speaking. What is my command?"
    message[3] = "Hello, here is B1 assistant. Let me know what do you wish."

    return message[getRandomInt(0,message.length-1)];
}

function getItemRecomendMessage(item){
    var message = [];
    
    message[0] = "Perhaps you would like some %s. Did I get it right?"
    message[1] = "So, what about %s?"
    message[2] = "Maybe, you prefer %s. Am I right this time?"
    message[3] = "May I offer you %s? What do you think?"


    return message[getRandomInt(0,message.length-1)].replace(/%s/g, item);
}

function getItemRelatedMessage(item, item2){
    var message = [];
    
    message[0] = "Can I get you also %s? It goes great with %s2.";
    message[1] = "Would you like to add %s to your order? It's a great match with %s2."
    message[2] = "May I add %s to this purchase? Fits good with %s2."

    return message[getRandomInt(0,message.length-1)].replace(/%s2/g, item2).replace(/%s/g, item);
}

// --------------- Helpers that build all of the responses -----------------------


function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    return {
        outputSpeech: {
            type: "PlainText",
            text: output
        },
        card: {
            type: "Standard",
            title: title,
            text:  output,
            image: {
                smallImageUrl: "https://i.imgur.com/1sgV9Er.png"
                }
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}