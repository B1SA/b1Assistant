/**
 * This code implements an integration of SAP Business One on HANA with Amazon Alexa
 * 
 * Athors: 
 * Ralph Oliveira - B1 Solution Architect - Twitter: @Ralphive
 * Yatsea Li - Solution Architect - Twitter: @YatseaLiAtSAP
 * All rights resversed by SAP SE
 * last mondifed on Mar 27 2017
 * License: This is not an offiical solution from SAP. The code is published with SCN AS-IS license.
 * You can download and modify this code by yourself. No SAP official support available.
 */

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.

var g_hdbServer = '<YOUR IP HERE>';
var g_hdbPort  = 8000; 
var g_hdbService = '/b1Assistant/services';
var g_currFinPeriod = null;

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
    case "Test":
        Test(intent, session, callback);
		break;
		
    case "BusinessInfo":
        getBusinessInfo(intent, session, callback);
		break;
		
	case "SocialMediaInfo":
        getSocialMediaInfo(intent, session, callback);
		break;
		
	case "ReadTweets":
        readTweets(intent, session, callback);
		break;
	
	case "SalesPipeline":
        getSalesPipelineInfo(intent, session, callback);
		break;	
	
	case "GetTopItems":
        getTopItems(intent, session, callback);
		break;
		
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
    if(null === g_currFinPeriod)
    {
        initB1PeriodByDate();
    }
    
    var sessionAttributes = {};
    var cardTitle = "Welcome";
    var speechOutput = getWelcomeMessageAPJ();
        
    // If the user either does not reply to the welcome message or says something that is not
    // understood, they will be prompted again with this text.
    var repromptText = 'What is my command, master?';
    var shouldEndSession = false;

    callback(sessionAttributes,
        buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function handleSessionEndRequest(callback) {
    var cardTitle = "Session Ended";
    //var speechOutput = "Thank you for using B1 Assistant. Have a nice day!";
    var speechOutput = "Okay.";
    
    // Setting this to true ends the session and exits the skill.
    var shouldEndSession = true;

    callback({}, buildSpeechletResponse(cardTitle, speechOutput, null, shouldEndSession));
}

/**
 * SAP HANA Interactions
 */
 function sayHello(intent, session, callback) {
    
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    
    speechOutput = "Oh my god! What was that party last night? "+
                "I still feel the headache, even though I do not have a head."

    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function Test(intent, session, callback) {
    
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";
    
    var today = new Date();
    //var period = initB1PeriodByDate(today);
    //SalesQuarter = getCalendarQuarterStr(today);
    //SalesYear = today.getFullYear();
    //speechOutput = "Test result. Financial period code " + g_currFinPeriod.FinancialPeriodCode +
    //" year " + g_currFinPeriod.FiscalYear;
    //speechOutput = "#DemoXYZ sucks. The #DemoABC from competitor ABC is flawless. Tweeted by YatseaLiAtSAP on March 26 2017.";
    speechOutput = "#iMiniServer. SallyGlass.";
    
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function getBusinessInfo(intent, session, callback) {
    
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    //Define Variables from Intent or from Session Attributes
    console.log("INTENT RECEIVED");
    console.log(JSON.stringify(intent));
    console.log("SESSION RECEIVED");
    console.log(JSON.stringify(session));
    
    restCall(    
            "/getBusinessInfo.xsjs",  // Endpoint
            "", //Filter
        function (response) {
            if(typeof(response.Error) !== 'undefined'){
                    speechOutput = "I am sorry, but I am not able to retrieve the business information this time. Please try again later";
                }else{

                    var YoYSalesGrowthRate = response.CurrentPeriodResult.YoYSalesGrowthRate;
                    var currNetSalesAmountLC = response.CurrentPeriodResult.NetSalesAmountLC + " "+ response.Currency;
                    var currGrossProfitLC = response.CurrentPeriodResult.GrossProfitLC + " " + response.Currency;
                    var currGrossMargin = formatPerc(response.CurrentPeriodResult.GrossMargin);
                    var YoYSalesSpeech; 
                    if(YoYSalesGrowthRate === "unknown")
                    {
                        //unknown YoYSalesGrowthRate indicate Zero amount for last the same period last year.
                        YoYSalesSpeech = "The sales grow from zero to "+ currNetSalesAmountLC;
                    }
                    else
                    {
                        var growOrDeclineYoY = YoYSalesGrowthRate >= 0.0? "grow ": "decline ";
                        YoYSalesGrowthRate = formatPerc(Math.abs(YoYSalesGrowthRate));
                        YoYSalesSpeech = "The sales " + growOrDeclineYoY + YoYSalesGrowthRate;
                    }
                    YoYSalesSpeech += " on year over year basis. ";

                    var MoMSalesGrowthRate = response.CurrentPeriodResult.MoMSalesGrowthRate;
                    if(MoMSalesGrowthRate === "unknown")
                    {
                        //unknown YoYSalesGrowthRate indicate Zero amount for last the same period last year.
                        MoMSalesSpeech = "Grow from zero to "+ currNetSalesAmountLC;
                    }
                    else
                    {
                        var growOrDeclineMoM = MoMSalesGrowthRate>= 0.0? "Grow ": "Decline ";
                        MoMSalesGrowthRate = formatPerc(Math.abs(MoMSalesGrowthRate));
                        MoMSalesSpeech = growOrDeclineMoM + MoMSalesGrowthRate;
                    }
                    MoMSalesSpeech += " on month over month basis.";
                    
                    speechOutput =  "Your business is doing " + response.OverallStatus +
                                    ". The sales amount of current period is " + currNetSalesAmountLC +
                                    ". The gross profit as " + currGrossProfitLC +
                                    ". The gross margin as " + currGrossMargin + ". " +
                                    YoYSalesSpeech  + MoMSalesSpeech;
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
}

function getSocialMediaInfo(intent, session, callback) {
    
    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    //Define Variables from Intent or from Session Attributes
    console.log("INTENT RECEIVED");
    console.log(JSON.stringify(intent));
    console.log("SESSION RECEIVED");
    console.log(JSON.stringify(session));
    
    if (intent.name === "AMAZON.YesIntent"){
        restCall(    
                "/SocialMediaInfo.xsodata/B1TweetSentiments",  // Endpoint
                "?$format=json&$top=1&$select=UserName,Text,CreateAt&$filter=TA_TYPE%20eq%20%27StrongNegativeSentiment%27%20or%20TA_TYPE%20eq%20%27WeakNegativeSentiment%27%20&$orderby=CreateAt%20desc,TA_TYPE%20asc", //Filter
            function (response) {
                console.log("response is "+ response);
                response = response.d.results;
                
                if(response.length ===0){
                    speechOutput = "I am sorry, but there are no tweet as required";
                    
                }else{
                    //speechOutput = "#DemoXYZ sucks. The #DemoABC from competitor ABC is flawless. Tweeted by YatseaLiAtSAP on March 26 2017.";
                    speechOutput =  response[0].Text.replace("#", "") + " . Tweeted By " + response[0].UserName;                    
                }
        
                shouldEndSession = true;
                callback(sessionAttributes,
                    buildSpeechletResponse(
                            intent.name, speechOutput, 
                            repromptText, shouldEndSession)
                        );
            }
        );
    }else if (intent.name === "AMAZON.NoIntent") {
        speechOutput = "Okay."
        shouldEndSession = true;
        callback(sessionAttributes,
                    buildSpeechletResponse(
                            intent.name, speechOutput, 
                            repromptText, shouldEndSession
                    )
                );
    }
    else{
    restCall(    
            "/getSocialMediaInfo.xsjs",  // Endpoint
            "", //Filter
        function (response) {
            if(typeof(response.Error) !== 'undefined'){
                    speechOutput = "I am sorry, but I am not able to retrieve the social media information this time. Please try again later";
                }else{
                    var readTweetSpeech = "";
                    if(response.NegativeTweetCount > 0)
                        readTweetSpeech = " Do you want me to read some negative tweets for you?";
                        
                    var hasSentimentTweetSpeech = "";
                    if(response.TweetCountWithSentiment > 0)
                    {
                        var tweetAboutProbSpeech = "";
                        if(response.TweetCountWithProblem > 0)
                            tweetAboutProbSpeech =" Including "+ response.TweetCountWithProblem + " tweets "  + 
                                    formatPerc(response.ProblemPerc) + " talking about the product problems."
                        
                        hasSentimentTweetSpeech =  response.TweetCountWithSentiment +
                                    " tweets with sentiments. Among them, "+ response.PositiveTweetCount +
                                    " tweets " + formatPerc(response.PostivePerc) +
                                    " are positive feedback or comment. While " + response.NegativeTweetCount + 
                                    " tweets " + formatPerc(response.NegativePerc) +
                                    " are negative. " +   tweetAboutProbSpeech + readTweetSpeech;
                        
                    }
                    speechOutput =  " On social media, your best selling product I Mini Server is doing " + response.Status +
                                    " this month. In total, " + response.TweetTotalCount+
                                    " tweets about the hash tag iMiniServer. " + hasSentimentTweetSpeech; 
                    if(response.NegativeTweetCount > 0)
                    {
                        shouldEndSession = false;
                        sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);    
                    }
                }
                
                
                //shouldEndSession = false;
                //sessionAttributes = handleSessionAttributes(sessionAttributes, 'PreviousIntent', intent.name);
                // call back with result
                callback(sessionAttributes,
                    buildSpeechletResponse(
                            intent.name, speechOutput, 
                            repromptText, shouldEndSession
                    )
                );
            }
        );  
    }
}

function readTweets(intent, session, callback) {

    var cardTitle = intent.name;
    var repromptText = "";
    var sessionAttributes = {};
    var shouldEndSession = true;
    var speechOutput = "";

    //Define Variables from Intent or from Session Attributes
    console.log("INTENT RECEIVED");
    console.log(JSON.stringify(intent));
    console.log("SESSION RECEIVED");
    console.log(JSON.stringify(session));
    
    var Sentiments = extractValue('Sentiments', intent, session);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'Sentiments', Sentiments);

    var sentimentType = 'StrongPositiveSentiment';
    if(Sentiments === null){
        speechOutput = "Okay! Positive or Negative ones?";
        repromptText = "You can say Strong Positive";
    }  
    else {
        
        sentimentType = formatSentiment(Sentiments);
        restCall(    
                "/SocialMediaInfo.xsodata/B1TweetSentiments",  // Endpoint
                "?$format=json&$select=UserName,Text,CreateAt&$filter=TA_TYPE%20eq%20%27"+sentimentType+"%27&$orderby=CreateAt%20desc", //Filter
            function (response) {
                console.log("response is "+ response);
                response = response.d.results;
                
                if(response.length ===0){
                    speechOutput = "I am sorry, but there are no tweet as required";
                    
                }
                else{
                    //speechOutput = "#DemoXYZ sucks. The #DemoABC from competitor ABC is flawless. Tweeted by YatseaLiAtSAP on March 26 2017.";
                    speechOutput =  response[0].Text.replace("#", "") + " . Tweeted By " + response[0].UserName;                    
                }
        
                shouldEndSession = true;
                callback(sessionAttributes,
                    buildSpeechletResponse(
                            intent.name, speechOutput, 
                            repromptText, shouldEndSession)
                        );
            }
        )    
    }
    
}

function getSalesPipelineInfo(intent, session, callback) {
    
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
    
    var SalesQuarter = extractValue('SalesQuarter', intent, session)
    var SalesYear = extractValue('SalesYear', intent, session)

    console.log ("SalesQuarter Extraido "+ SalesQuarter);
    console.log ("SalesYear Extraido "+ SalesYear);
        
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesQuarter', SalesQuarter);
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'SalesYear', SalesYear);

    console.log("Vao ser exportados " + JSON.stringify(sessionAttributes));
    if(SalesQuarter === 'this' || SalesQuarter === 'current')
    {
            var today = new Date();
            //var period = initB1PeriodByDate(today);
            SalesQuarter = getCalendarQuarterStr(today);
            SalesYear = today.getFullYear();  
            //SalesYear = g_currFinPeriod.FiscalYear;
    }
    else if(SalesQuarter === 'last')
    {
            var d = new Date();
            var lastQuarter = getLastQuarter(d);
            SalesQuarter = lastQuarter.Quarter;
            SalesYear = lastQuarter.Year;
    }
        
    if(SalesQuarter === null){
        speechOutput = "Got it! What quarter?";
        repromptText = "Tell me the quarter and the year.";
    } else if(SalesYear === null){
        speechOutput = "What year do you need?";
        repromptText = "You can do it, tell me a year.";
    } else {
        
        var b1Quarter = formatQuarter2(SalesQuarter);
        var oDataFilter = 'OpportunityStartYear'+ op('eq')+quotes(SalesYear) +op('and')+
                          'OpportunityStartQuarter'+ op('eq')+quotes(b1Quarter);

        oDataFilter = oDataFilter.replace(/ /g, "%20"); // Avoid unescaped characters
                
        console.log('OdataFilter = '+ oDataFilter);
    
        restCall(    
                "/BusinessInfo.xsodata/OpportunityQuery",  // Endpoint
                "?$format=json&$select=PotentialAmountLC,WeightedAmountLC,NumberOfOpportunity,AverageClosingPercentage,OpportunityStatus&$filter="+oDataFilter, //Filter
    
            function (response) {
                console.log("response is "+ response);
                //There is a technical error return from odata.
                if(typeof(response.error) !== 'undefined')
                {
                    speechOutput = "I am sorry, but there is an error. I am not able to retrive the sales pipeline information this time. Please try again later.";
                }
                else
                {
                    response = response.d.results;
                    
                    if(response.length ==0){
                        speechOutput = "I am sorry, but there are no sales oppotunities in the " + stringQuarter(SalesQuarter) + " quarter of " + SalesYear;
                        
                    }else{
                        var openOppr={};
                        var lostOppr={};
                        var wonOppr={};
                        var totalOpprNo = 0;
                        var totalClosedNo = 0;
                        var totalPotentialAmountLC = 0.0;
                        var totalWeightedAmountLC = 0.0;
                        var totalClosingPerc = 0.0;
                        for(var i=0; i< response.length; i++)
                        {
                            totalOpprNo += response[i].NumberOfOpportunity;
                            totalPotentialAmountLC += parseFloat(response[i].PotentialAmountLC,0);
                            totalWeightedAmountLC += parseFloat(response[i].WeightedAmountLC,0);
                            totalClosingPerc += response[i].AverageClosingPercentage * response[i].NumberOfOpportunity;
                            if(response[i].OpportunityStatus === "Open")
                            {
                                openOppr = response[i];
                            }
                            else if(response[i].OpportunityStatus === "Won")
                            {
                                wonOppr = response[i];
                                totalClosedNo += wonOppr.NumberOfOpportunity;
                            }
                            else
                            {
                                lostOppr = response[i];
                                totalClosedNo += lostOppr.NumberOfOpportunity;
                            }
                        }
                        var AverageClosingPercentage = totalOpprNo === 0? "0%" : round(totalClosingPerc / totalOpprNo,1) + "%";
                        var wonSpeech = "";
                        
                        if(typeof(wonOppr.NumberOfOpportunity) !== 'undefined')
                        {
                            var wonRate = calcPerc(wonOppr.NumberOfOpportunity, totalClosedNo);
                            wonSpeech = " We have won " + wonOppr.NumberOfOpportunity +
                                        " opportunities. Winning rate as " + wonRate + ". ";
                        }
                        
                        var lostSpeech = "";
                        if(typeof(lostOppr.NumberOfOpportunity) !== 'undefined')
                        {
                            var lostRate = calcPerc(lostOppr.NumberOfOpportunity, totalClosedNo);
                            lostSpeech = " Lost " + lostOppr.NumberOfOpportunity +
                                        " opportunities. Losing rate as " + lostRate + ". ";
                        }
                        
                        var openSpeech = "";
                        if(typeof(openOppr.NumberOfOpportunity) !== 'undefined')
                        {
                            
                            openSpeech = " We still have " + openOppr.NumberOfOpportunity +
                            " open opportunities with potential amount as " + openOppr.PotentialAmountLC + 
                            "$ and weighted amount as "+ openOppr.WeightedAmountLC + "$."; 
                        }
                        
                        speechOutput =  "There are "+totalOpprNo+" sales opportunities in the pipeline for the " + 
                                        stringQuarter(b1Quarter) + " quarter of " + SalesYear + ". Total potential amount as " +
                                        totalPotentialAmountLC + " $. Total weighted amount as " + totalWeightedAmountLC + " $. "+
                                        " The average closing percentage as " + AverageClosingPercentage +". " +
                                        wonSpeech + lostSpeech + openSpeech;
                    }
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

function getTopItems(intent, session, callback) {
    
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
    
    var TopNo = extractValue('TopNo', intent, session);
    console.log ("TopNo Extracted "+ TopNo);
        
    sessionAttributes = handleSessionAttributes(sessionAttributes, 'TopNo', TopNo);

    if(TopNo === null){
        speechOutput = "Got it! How many top items?";
        repromptText = "Tell me top 3 or top 5.";
    }  else {
        restCall(    
                "/BusinessInfo.xsodata/SalesAnalysisQuery",  // Endpoint
                "?$format=json&$select=ItemCode,ItemDescription&$top="+TopNo+"&$orderby=NetSalesAmountLC%20desc", //Filter
    
            function (response) {
                console.log("response is "+ response);
                //There is a technical error return from odata.
                if(typeof(response.error) !== 'undefined')
                {
                    speechOutput = "I am sorry, but there is an error. I am not able to retrieve the best selling products this time. Please try again later.";
                }
                else
                {
                    response = response.d.results;
                    
                    if(response.length === 0){
                        speechOutput = "I am sorry, but there are no items.";
                        
                    }else{
                        speechOutput = "The top "+TopNo +" best selling product are: " ;
                        
                        for(var i=0; i< response.length; i++)
                        {
                            speechOutput += " Item " + response[i].ItemCode.replace("-","").replace("_","") + " , ";
                            speechOutput +=  response[i].ItemDescription.replace("-","").replace("_","").replace(".","") + " . ";
                        }
                    }
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

            if(response.ITEMGROUP){
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
                
                if(response.length ==0){
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

function formatQuarter2(input){
    
    if (input == 'first' || input == '1st' || input == '01' ){
        return 'Q1';
    }
    
    if (input == 'second' || input == '2nd'|| input == '02' ){
        return 'Q2';
    }
    
    if (input == 'third' || input == '3rd' || input == '03'){
        return 'Q3';
    }
    
    if (input == 'fourth' || input == '4th'|| input == '04' ){
        return 'Q4';
    }
    
}

function stringQuarter(input){
    
    if (input == '01' || input == 'Q1' ){
        return 'first';
    }
    
    if (input == '02' || input == 'Q2'){
        return 'second';
    }
    
    if (input == '03' || input == 'Q3'){
        return 'third';
    }
    
    if (input == '04' || input == 'Q4'){
        return 'fourth';
    }
    
}

/***
 * Input month: 0-11
 * Output: '01', '02', '03', '04'...
 ***/
function formatMonth(month)
{
    month = parseInt(month, 0)+1;
    return month < 10? "0"+month: month.toString();
}

function getLastQuarter(d)
{
 	d = d || new Date();
    var m = d.getMonth();
    var y = d.getFullYear();
    if(m < 3)
    {
        m = m + 9;
        y = y - 1;
    }
    else
    {
        m = m - 3;
    }
    d.setMonth(m);
    d.setFullYear(y);
    var result = {};
    result.Quarter = getCalendarQuarterStr(d);
    result.Year = y;
    return result;
}

/***
 * To be improved: should get the financial period code from B1.
 * not all country work on the calendar fiscal financial year.
 * 
 * Input month: 0-11
 * Output: '01', '02', '03', '04'...
 ***/
function formatB1PeriodCode(year, month)
{
    month = formatMonth(month);
    return year + "-" + month;
}

function formatB1PeriodCode2(d)
{
    d = d || new Date();
    return formatB1PeriodCode(d.getFullYear(), d.getMonth());
}

/***
 * Get the current financial period code base on full year and month.
 * 
 * Input month: 2017-03-30
 * Output: '2017-03', '2017-02'...
 ***/
function getCurrentB1PeriodCode()
{
    var today = new Date();
    return formatB1PeriodCode2(today);
}

/***
 * Get the financial period information for the a given date..
 * 
 * Input date: 2017-03-30
 * Output: integer, 20170330
 ***/
function formatB1DateInt(d)
{
	d = d || new Date();
	var dateStr = d.getFullYear().toString()+formatMonth(d.getUTCMonth())+d.getUTCDate().toString();
    return parseInt(dateStr, 0);
}

function ThisYear()
{
    return (new Date()).getFullYear();;
}

/***
 * Get the financial period information for the a given date..
 * 
 * Input month: 2017-03-30
 * Output: '2017-03', '2017-02'...
 ***/
function initB1PeriodByDate(d)
{
    d = d || new Date(); //if no input date, use today
    var dateInt = formatB1DateInt(d);
    var period = {};
    period.FinancialPeriodCode = getCurrentB1PeriodCode();
    period.FiscalYear = ThisYear();
    g_currFinPeriod = {};
    g_currFinPeriod.FinancialPeriodCode = getCurrentB1PeriodCode();
    g_currFinPeriod.FiscalYear = ThisYear();     
    
    try
    {
        restCall(    
                "/BusinessInfo.xsodata/FinancialPeriod",  // Endpoint
                "?$format=json&$select=FinancialPeriodCode,FiscalYear&$filter=PeriodStart%20le%20"+dateInt+"%20and%"+dateInt+"%20le%20PeriodEnd", //Filter
            function (response) {
                console.log("response is "+ response);
                response = response.d.results;
                
                if(response.length > 0)
                {
                    period = response[0];
                    g_currFinPeriod = period;
                }
            }
        );
    }
    catch(e)
    {
        console.log(e);
    }
}

/***
 * Get the current financial period code base on full year and month.
 * 
 * Input month: 2017-03-30
 * Output: '2017-03', '2017-02'...
 ***/
function getCalendarQuarter(d) {
  d = d || new Date();
  var m = Math.floor(d.getMonth()/3) +1 ;
  return m ;
}

function getCalendarQuarterStr(d) {
  d = d || new Date();
  var q = "0" + (Math.floor(d.getMonth()/3) +1).toString() ;
  return q ;
}

//WeakPositiveSentiment','StrongPositiveSentiment','NeutralSentiment', '
//WeakNegativeSentiment','StrongNegativeSentiment','MajorProblem','MinorProblem'
function formatSentiment(input){
    
    input = input.toUpperCase();
    switch(input) {
    case 'WEAK POSITIVE':
        return 'WeakPositiveSentiment';

    case 'STRONG POSITIVE':
        return 'StrongPositiveSentiment';

    case 'POSITIVE':
        return 'StrongPositiveSentiment';

    case 'NEUTRAL':
        return 'NeutralSentiment';
        
    case 'NEGATIVE':
        return 'StrongNegativeSentiment';
        
    case 'WEAK NEGATIVE':
        return 'WeakNegativeSentiment';
        
    case 'STRONG NEGATIVE':
        return 'StrongNegativeSentiment';
        
    case 'MAJOR PROBLEM':
        return 'MajorProblem';

    case 'MINOR PROBLEM':
        return 'MinorProblem';

    default:
        return 'StrongPositiveSentiment';
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

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function formatPerc(value) {
    return round(value * 100, 1) +"%";
}

function calcPerc(value1, value2) {
    if(typeof(value2) !== 'undefined' 
        && value2 !== 0 
        && typeof(value1) !== 'undefined' )
    {
        return round(value1* 100 / value2, 1)+ "%";
    }
    
    return "0%";
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

function getWelcomeMessageAPJ(){
    var message = [];
    
    message[0] = "Namastay! This is B1 Assistant. How can I help?"
    message[1] = "Knee how! I am your B1 assistant. How can I Help you today?"
    message[2] = "Hola! This is B1 assistant speaking. What is my command?"
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
