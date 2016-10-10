var B1SLAddress = "/b1s/v1/";

function callServiceLayer(path, method, body, sessionID, routeID) {
    try {
        $.trace.debug("callServiceLayer (path: " + path + ", method: " + method + ", body: " + body + ", sessionID: " + sessionID + ", routeID: " + routeID + ")");

        //B1SL.xshttpdest
        var destination = $.net.http.readDestination("b1Assistant.lib.http", "B1SL");
        var client = new $.net.http.Client();

        var header = "";
        if (method === $.net.http.PATCH) {
            method = $.net.http.POST;
            header = "X-HTTP-Method-Override: PATCH";
        }

        var req = new $.web.WebRequest(method, path);

        if (header !== "") {
            req.headers.set("X-HTTP-Method-Override", "PATCH");
        }

        if (body) {
            req.setBody(body);
        }

        if (sessionID) {
            req.cookies.set("B1SESSION", sessionID);
        }
        if (routeID) {
            req.cookies.set("ROUTEID", routeID);
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
        if (response.body)
            try {
                myBody = JSON.parse(response.body.asString());
            } catch (e) {
            myBody = response.body.asString();
        }


        $.trace.debug("callServiceLayer response status: " + $.response.status);
        return response;
    } catch (e) {
        $.trace.warning("callServiceLayer Exception: " + e.message);
        $.response.contentType = "application/json";
        $.response.setBody(JSON.stringify({
            "error": e.message
        }));
    }
}

function SLLogin(body, sessionID, routeID)
{
    var path = B1SLAddress + "Login";
    return callServiceLayer(path, $.net.http.POST, body, sessionID, routeID);
}

function PostOrder(body, sessionID, routeID)
{
    var path = B1SLAddress + "Orders";
    return callServiceLayer(path, $.net.http.POST, body, sessionID, routeID);
}




