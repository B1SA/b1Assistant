$.import("b1Assistant.lib", "Constants");
var Constants = $.b1Assistant.lib.Constants;

var conn = null;

function getBusinessInfo() {
	var bizResult = {};
	bizResult.OverallStatus = "Good";
	//bizResult.CurrentPeriodSalesAmount = 0;
	bizResult.Currency = "$";
    bizResult.CurrentPeriodResult = {"NetSalesAmountLC": 0, "GrossProfitLC": 0, "GrossMargin": 0};
    bizResult.LastPeriodResult = {"NetSalesAmountLC": 0, "GrossProfitLC": 0, "GrossMargin": 0};
    bizResult.SamePeriodLastYearResult = {"NetSalesAmountLC": 0, "GrossProfitLC": 0, "GrossMargin": 0};
	
	try {
		conn = $.hdb.getConnection();
		var getSalesInfo = conn.loadProcedure("SBODEMOUS", "b1Assistant.procedures::getSalesInfo");
		//Execute the query, return as JSON format
		var temp = getSalesInfo('', '', '');
		//Get the first result set for the local currency;
		var resultSet = temp["$resultSets"][0];
		bizResult.Currency = resultSet[0].LocalCurrency;
		
		resultSet = temp["$resultSets"][1];
		for (var i = 0; i < resultSet.length; i++) {
			if (resultSet[i].MyPeriod === 'CurrentPeriod') {
				bizResult.CurrentPeriodResult.NetSalesAmountLC = resultSet[i].NetSalesAmountLC;
				bizResult.CurrentPeriodResult.GrossProfitLC = resultSet[i].GrossProfitLC;
				bizResult.CurrentPeriodResult.GrossMargin = 
				Constants.calcPerc(bizResult.CurrentPeriodResult.GrossProfitLC, bizResult.CurrentPeriodResult.NetSalesAmountLC);
			} else if (resultSet[i].MyPeriod === 'LastPeriod') {
				bizResult.LastPeriodResult.NetSalesAmountLC = resultSet[i].NetSalesAmountLC;
				bizResult.LastPeriodResult.GrossProfitLC = resultSet[i].GrossProfitLC;
				bizResult.LastPeriodResult.GrossMargin = 
				Constants.calcPerc(bizResult.LastPeriodResult.GrossProfitLC, bizResult.LastPeriodResult.NetSalesAmountLC);
			} else if (resultSet[i].MyPeriod === 'SamePeriodLastYear') {
				bizResult.SamePeriodLastYearResult.NetSalesAmountLC = resultSet[i].NetSalesAmountLC;
				bizResult.SamePeriodLastYearResult.GrossProfitLC = resultSet[i].GrossProfitLC;
				bizResult.SamePeriodLastYearResult.GrossMargin = 
				Constants.calcPerc(bizResult.SamePeriodLastYearResult.GrossProfitLC, bizResult.SamePeriodLastYearResult.NetSalesAmountLC);
			}
		}
		
		//Calculate the YoY growth rate, period over period rate
        bizResult.CurrentPeriodResult.YoYSalesGrowthRate = 
            Constants.calcGrowthRate(bizResult.CurrentPeriodResult.NetSalesAmountLC,bizResult.SamePeriodLastYearResult.NetSalesAmountLC);
        bizResult.CurrentPeriodResult.MoMSalesGrowthRate = 
        Constants.calcGrowthRate(bizResult.CurrentPeriodResult.NetSalesAmountLC,bizResult.LastPeriodResult.NetSalesAmountLC);
        
        bizResult.OverallStatus = 
        Constants.identifyBusinessStatus(bizResult.CurrentPeriodResult.NetSalesAmountLC, bizResult.SamePeriodLastYearResult.NetSalesAmountLC);
        
        /**********************social media result**********************
        var getSocialMediaInfo = conn.loadProcedure("SBODEMOUS", "b1Assistant.procedures::getSocialMediaInfo");
        var temp2 = getSocialMediaInfo();
        var socialResult = {};
        var temp3 = temp2["$resultSets"][0];
        socialResult.TweetTotalCount = parseInt(temp2["$resultSets"][0][0].TweetTotalCount,0);
        socialResult.TweetCountWithSentiment =parseInt(temp2["$resultSets"][1][0].TweetCountWithSentiment,0);
        socialResult.PositiveTweetCount = parseInt(temp2["$resultSets"][2][0].PositiveTweetCount,0);
        socialResult.NegativeTweetCount = parseInt(temp2["$resultSets"][3][0].NegativeTweetCount,0);
        socialResult.TweetCountWithProblem = parseInt(temp2["$resultSets"][4][0].TweetCountWithProblem,0);
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
        bizResult.SocialResult = socialResult;
        ********************end of social media result*******************/
		$.response.status = $.net.http.OK;
	} catch (e) {
		bizResult.Error = e.message;
		$.response.status = 500;
	} finally {
		if (null !== conn) {
			conn.close();
		}
	}

	$.response.setBody(JSON.stringify(bizResult));
}

getBusinessInfo();