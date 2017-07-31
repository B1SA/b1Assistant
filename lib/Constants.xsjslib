//Constants
//Precision of Percentage. e.g. 87.343% -> 87.3%
const PRECISION = 3; 
//The threshhold in percentage of positive tweets in social media status to be considerated as good.
const SOCIAL_MEDIA_POSITIVE_STATUS_THRESHHOLD_PERC = 80.0; 
//The target sales growth rate. used to indentfy the overall business rate.
//If YoYSalesGrowthRate >= YoY_SALES_TARGET_GROWTH_RATE, then overall status of business is good
//else if YoYSalesGrowthRate >= YoY_SALES_VERY_GOOD_GROWTH_RATE, the overall status of business is very good
const YoY_SALES_TARGET_GROWTH_RATE=0.10;
const YoY_SALES_VERY_GOOD_GROWTH_RATE = 0.20;
const YoY_SALES_SO_SO_GROWTH_RATE = 0.0;
const STATUS_GOOD = "Good";
const STATUS_VERY_GOOD = "Very Good";
const STATUS_SO_SO = "SO SO";
const STATUS_NOT_SO_GOOD = "Not So Good";
const STATUS_UNKNOWN = "Unknown";
const MONTHLY_TWEET_COUNT_TARGET = 10;

function round(value, precision) {
    var multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
}

function calcGrowthRate(value1, value2) {
    if(typeof(value2) !== 'undefined' 
        && value2 !== 0 
        && typeof(value1) !== 'undefined' )
    {
        return round((value1-value2) / value2, PRECISION);
    }
    
    return "unknown";
}

function calcPerc(value1, value2) {
    if(typeof(value2) !== 'undefined' 
        && value2 !== 0 
        && typeof(value1) !== 'undefined' )
    {
        return round(value1* 1.0 / value2, PRECISION);
    }
    
    return 0.0;
}

function identifyBusinessStatus(currPeriodSalesAmount, lastSamePeriodSalesAmount)
{
    currPeriodSalesAmount = parseFloat(currPeriodSalesAmount,0.0);
    lastSamePeriodSalesAmount = parseFloat(lastSamePeriodSalesAmount, 1.0);
    
    var growthRate = calcGrowthRate(currPeriodSalesAmount, lastSamePeriodSalesAmount);
    //over-achieve the business growth taget with 150% 
    
    if( YoY_SALES_VERY_GOOD_GROWTH_RATE <= growthRate)
    {
        return STATUS_VERY_GOOD;
    }
    else if((YoY_SALES_TARGET_GROWTH_RATE <= growthRate) && (growthRate < YoY_SALES_VERY_GOOD_GROWTH_RATE) )
    {
        return STATUS_GOOD;
    }
    else if( (YoY_SALES_SO_SO_GROWTH_RATE <=growthRate) &&  (growthRate < YoY_SALES_TARGET_GROWTH_RATE))
    {
        return STATUS_SO_SO;
    }
    else
    {
        return STATUS_NOT_SO_GOOD;
    }
}
