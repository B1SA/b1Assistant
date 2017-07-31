$.import("b1Assistant.lib", "Constants");
var Constants = $.b1Assistant.lib.Constants;

var conn = null;

function getSocialMediaInfo() {
	var socialResult = {};
	//bizResult.CurrentPeriodSalesAmount = 0;
	
	try {
		conn = $.hdb.getConnection();
		var getSocialMediaInfo = conn.loadProcedure("SBODEMOUS", "b1Assistant.procedures::getSocialMediaInfo");
        var temp = getSocialMediaInfo();
        
        socialResult.TweetTotalCount = parseInt(temp["$resultSets"][0][0].TweetTotalCount,0);
        socialResult.TweetCountWithSentiment =parseInt(temp["$resultSets"][1][0].TweetCountWithSentiment,0);
        socialResult.PositiveTweetCount = parseInt(temp["$resultSets"][2][0].PositiveTweetCount,0);
        socialResult.NegativeTweetCount = parseInt(temp["$resultSets"][3][0].NegativeTweetCount,0);
        socialResult.TweetCountWithProblem = parseInt(temp["$resultSets"][4][0].TweetCountWithProblem,0);
        if(socialResult.TweetCountWithSentiment !==0 )
        {
            socialResult.PostivePerc = Constants.calcPerc(socialResult.PositiveTweetCount, socialResult.TweetCountWithSentiment) ;
            if(socialResult.PostivePerc < Constants.SOCIAL_MEDIA_POSITIVE_STATUS_THRESHHOLD_PERC)
                socialResult.Status = Constants.STATUS_NOT_SO_GOOD;
            else
                socialResult.Status = Constants.STATUS_GOOD;
                
            socialResult.NegativePerc = Constants.round((1.0 - socialResult.PostivePerc), Constants.PRECISION);
            socialResult.ProblemPerc = Constants.calcPerc(socialResult.TweetCountWithProblem, socialResult.TweetCountWithSentiment);
        }
        else
        {
            socialResult.Status = Constants.STATUS_UNKNOWN;
        }
        
        if(socialResult.TweetTotalCount <= Constants.MONTHLY_TWEET_COUNT_TARGET )
            socialResult.Status = Constants.STATUS_NOT_SO_GOOD;
        
		$.response.status = $.net.http.OK;
	} catch (e) {
		socialResult.Error = e.message;
		$.response.status = 500;
	} finally {
		if (conn !== null) {
			conn.close();
		}
	}

	$.response.setBody(JSON.stringify(socialResult));
}

getSocialMediaInfo();