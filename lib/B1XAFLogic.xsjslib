var B1XAddress = "/sap/sbo/";

function callB1XAF(path, method, body, sessionID, routeID) {
    try {
        $.trace.debug("callB1XAF (path: " + path + ", method: " + method + ", body: " + body + ", sessionID: " + sessionID + ", routeID: " + routeID + ")");

        //B1SL.xshttpdest
        var destination = $.net.http.readDestination("b1Assistant.lib.http", "B1XAF");
        var client = new $.net.http.Client();
    
        var req = new $.web.WebRequest(method, path);
        req.contentType = "application/json";

        if (body) {
            req.setBody(body);
        }
        
        if (sessionID) {
            req.cookies.set("sapxslb", sessionID);
        }
        
        if (routeID) {
            req.cookies.set(routeID.name,routeID.value);
        }
                
        client.request(req, destination);

        var response = client.getResponse();

        //The rest of the file (attached) is just a default forward of the response  
        var myCookies = [],
            myHeader = [],
            myBody = null;

        //Cookies   
        for (var c in response.cookies) {
            myCookies.push(response.cookies[c]);
        }
        //Headers  
        for (var h in response.headers) {
            myHeader.push(response.headers[h]);
        }
        //Body  
        if (response.body){
            try {
                myBody = JSON.parse(response.body.asString());
            } catch (e) {
            myBody = response.body.asString();
            }
        }
        
        $.trace.debug("call B1 Xapp Framework  response status: " + $.response.status);
        return response;
    } catch (e) {
        response = null;
        $.trace.warning("call B1 Xapp Framework  Exception: " + e.message);
        $.response.contentType = "application/json";
        $.response.setBody(JSON.stringify({
            "error": e.message
        }));
    }
}

function dummyRecom(CardCode){
    var output = {};
	var resultSet = [];
	var conn = $.hdb.getConnection({"sqlcc": "b1Assistant.lib::annonuser"});
	
	var query = 'SELECT * FROM "_SYS_BIC"."b1Assistant.models.CA/B1_SALES_ITEMRECOM"'; 
	var rs = conn.executeQuery(query); 
	conn.close();

    for (var i = 0; i < rs.length; i++){
        var item = {
            ItemCode: rs[i].ITEMCODE,
            ItemName: rs[i].ITEMNAME,
            PicturName: null,
            CardCode: CardCode,
            Price: (10*i),
            Currency : '$',
            Probability: 1
        };
        //Comment this line to test in case of 0 recommendations
        resultSet.push(item);
    }
    
    output.error = false;
    output.errorMessage = "";
    output.errorType = "E";
    output.resultSet = resultSet;
    
    var response = {};
    response.body = output;
    
    return response;
}


function Login(body)
{
    var path = B1XAddress + "platform/login";
    return callB1XAF(path, $.net.http.POST, body, null,null);
}

function SaleRecommend(body, sessionID, routeID)
{
    var path =  B1XAddress + 
                "pervasive/IMCC/srv/pa/service/sale_recommend"+
                "?cardcode="+body.CardCode;
                
   // return dummyRecom(body.CardCode); //Remove when service is available
    
    return callB1XAF(path, $.net.http.GET, null, sessionID, routeID);
}
 
function SaleRelated(body, sessionID, routeID)
{
    var path =  B1XAddress + 
                "pervasive/IMCC/srv/pa/service/sale_related"+
                "?cardcode="+body.CardCode+
                "&itemcode="+body.ItemCode;

 //   return dummyRecom(body.CardCode); //Remove when service is available

    return callB1XAF(path, $.net.http.GET, null, sessionID, routeID);
}

function Environment(sessionID,routeID)
{
    var path = B1XAddress + "platform/env";
    return callB1XAF(path, $.net.http.GET, null, sessionID, routeID);
} 



