//$.import("b1Assistant.lib","B1Params"); 
$.import("b1Assistant.lib","B1SLLogic"); 
$.import("b1Assistant.lib","B1XAFLogic"); 
$.import("b1Assistant.lib","B1Aux"); 

// Service Layer/B1Xapp Parameters
var UserName = "manager";
var UserPass = "1234";
var UserComp = "SBODEMOUS";
var	UserLang = "en-US";

// Global Vars
var SESSIONID = "";
var NODEID = "";
var output = {};

function setOutputMessage(mess){
    output.message = mess;
    $.response.contentType = "application/json"; 
    $.response.setBody(JSON.stringify(output));
    $.response.status = $.net.http.OK;
}


function serviceLayerLogin(){
    // SL credentials
    var loginInfo = {};
    loginInfo.UserName = UserName;
    loginInfo.Password = UserPass;
    loginInfo.CompanyDB = UserComp;
    
    // SL LOGIN          
    var response = $.b1Assistant.lib.B1SLLogic.SLLogin(JSON.stringify(loginInfo), null, null);
    
    // B1SESSION and ROUTEID cookies returned by Login
    for (var j in response.cookies){
        if (response.cookies[j].name === "B1SESSION"){
            SESSIONID = response.cookies[j].value;
           output.SessionID = SESSIONID;
        }
        else if (response.cookies[j].name === "ROUTEID") {
            NODEID = response.cookies[j].value;
            output.NodeID = NODEID;
        }
    }
}

function B1XAFLogin(){
    // B1 Extreme App Framework credentials
    var loginInfo = {};
    loginInfo.company 	= UserComp;
    loginInfo.username 	= UserName;
    loginInfo.password 	= UserPass;
    loginInfo.language 	= UserLang;
    
    // SL LOGIN          
    var response = $.b1Assistant.lib.B1XAFLogic.Login(JSON.stringify(loginInfo));
    
    for (var i in response.headers){
        if (response.headers[i].name === "~status_code"){
                output.StatusCode = response.headers[i].value;
                break;
            }
    }    
    
    NODEID = {};
    
    for (var j in response.cookies){
        if (response.cookies[j].name === "sapxslb"){
            SESSIONID = response.cookies[j].value;
            output.SessionID = SESSIONID;
        } else if (response.cookies[j].name) {
            NODEID.name = response.cookies[j].name;
            NODEID.value = response.cookies[j].value;
            output.NodeID = NODEID;
        }
    }
    
    output.B1XAF = JSON.parse(response.body.asString());
}

function getSalesRecom(cust,item){
    
    if (cust === null){
        setOutputMessage('Invalid Customer');
    }    
    B1XAFLogin();
    
    var body = {};
    var response;
    
    body.CardCode = cust;
    
    if (item){
        body.ItemCode = item;
        response = $.b1Assistant.lib.B1XAFLogic.SaleRelated(body,SESSIONID,NODEID);
    }else{
        response = $.b1Assistant.lib.B1XAFLogic.SaleRecommend(body,SESSIONID,NODEID);
    }
    
    //When Real service is available
    //output.response = JSON.parse(response.body.asString());
    
    var outputMeta = output;
    output = JSON.parse(response.body.asString());

    output.metadata = outputMeta;
    setOutputMessage("Recommendation done!");
}

function createSO(item, qty, item2){
    
    //Debug data
    //item = ink;
    //qty = 2;
    
    if (item === null || qty === null ){
        setOutputMessage('Invalid Item or Item Quantity');
    }
    
    serviceLayerLogin();
    
    var body = {};
    var lines = [];
    var line = {};
    
    // Header
    body.CardCode   = $.b1Assistant.lib.B1Aux.getCustomer();
    body.DocDueDate = $.b1Assistant.lib.B1Aux.getDateTime(false);
    body.Comments = 'From Alexa on - ' + $.b1Assistant.lib.B1Aux.getDateTime(true);
    
    //Line
    line.ItemCode = item;
    line.Quantity = qty;
    lines.push(line);
    
    //Additional Line if exists
    if (item2 !== null){
        line = {};
        line.ItemCode = item2;
        line.Quantity = 1;
        lines.push(line);
    }
    
    //Add lines to body
    body.DocumentLines = lines;
    
    //Call Service Layer
    var response = $.b1Assistant.lib.B1SLLogic.PostOrder(JSON.stringify(body), SESSIONID,NODEID);
    
    // Handle Results
    for (var i in response.headers){
        if (response.headers[i].name == "~status_code"){
            output.StatusCode = response.headers[i].value;
            break;
        }
    }
    
    //Parse response body
    body = JSON.parse(response.body.asString());
    output.DocNum = body.DocNum;
    output.DocEntry = body.DocEntry;
    output.DocTotal = body.DocTotal;
    output.DocCurrency = body.DocCurrency;

    setOutputMessage('Process finished on HANA');
}

var i_item = null, i_qty = null, i_item2 = null, i_cust = null;

var action = $.request.parameters.get('action');

//Avoid undefined inputs
i_item = $.b1Assistant.lib.B1Aux.validateInput($.request.parameters.get('item'));
i_qty = $.b1Assistant.lib.B1Aux.validateInput($.request.parameters.get('qty'));
i_item2 = $.b1Assistant.lib.B1Aux.validateInput($.request.parameters.get('item2'));
i_cust = $.b1Assistant.lib.B1Aux.getCustomer();
//i_cust = $.b1Assistant.lib.B1Aux.validateInput($.request.parameters.get('customer'));


//Parse natural language items into ItemCodes (if needed)
i_item = $.b1Assistant.lib.B1Aux.extractItem(i_item);
i_item2 = $.b1Assistant.lib.B1Aux.extractItem(i_item2);


switch(action){
	case "SalesOrder":
	    //Create Sales Order
	    createSO(i_item, i_qty, i_item2);
		break;
	case "SalesRecommend":
        //Get Sales Recommendation for a Customer
	    getSalesRecom(i_cust, null);
	    break;
	case "SalesRelated":
        //Get Item related  for Customer + item
        getSalesRecom(i_cust, i_item);
	    break;
default:
	setOutputMessage('Invalid action: '+action);
}





    
    