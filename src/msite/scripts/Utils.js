/************************************
	String Utilities
************************************/
/**
	Strips out all HTML tags from a string.
	@return The original string minus all HTML tags.
*/
String.prototype.stripHtmlTags = function()
{
	return this.replace(/<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|'.*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g, "");
	//this.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, '');
};


/**
	Takes an ISO8601 formatted string and returns a Date object that represents the date and time in that string.
	@return		{Date}	The date object derived from the ISO 8601 date string
*/
String.prototype.toDate = function()
{
	var d = this.match(/([0-9]{4})(-([0-9]{2})(-([0-9]{2})(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?/);
	var offset = 0;
	var date = new Date(d[1], 0, 1);

	if (d[3]) { date.setMonth(d[3] - 1); }
	if (d[5]) { date.setDate(d[5]); }
	if (d[7]) { date.setHours(d[7]); }
	if (d[8]) { date.setMinutes(d[8]); }
	if (d[10]) { date.setSeconds(d[10]); }
	if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
	if (d[14]) {
		offset = (Number(d[16]) * 60) + Number(d[17]);
		offset *= ((d[15] == '-') ? 1 : -1);
	}

	offset -= date.getTimezoneOffset();
	time = (Number(date) + (offset * 60 * 1000));
	date.setTime(Number(time));
	return date;
}


/**
    Returns bool of whether this string starts with the specified comparison string. Case Sensitive.
*/
String.prototype.startsWith = function(str)
{
    return (this.indexOf(str) === 0);
}


/**
    Combines common checks for null/empty strings, similar to c#.
*/
String.prototype.isNullOrEmpty = function()
{
    return (this == null || this == "");
}


/**
    Uses the built-in browser functionality to decode text that was encoded so it can be used
    to pre-populate form fields or for other purposes.
*/
String.prototype.htmlDecode = function()
{
   var div = document.createElement('htmlDecodeDivTemp');
   div.innerHTML = this;
   return div.innerHTML.replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
};



/************************************
	Date Utilities
************************************/
/**
	Gets the number of days in the future that this date is relative to now (on the client).
	<p>This assumes that the date in the user's local time since it is being compared to "now" 
	in the user's local time.</p>
	@return	{Integer}	The number of days in the future from today. The result will be a 
						negative Integer if the day is in the past.
*/
Date.prototype.getDaysFromNow = function()
{
	var now = new Date();
	now = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
	var then = new Date(this.getFullYear(), this.getMonth(), this.getDate(), 0, 0, 0, 0);

	var diff = then.getTime() - now.getTime();
	return diff / (1000 * 60 * 60 * 24);
};

/**
	Gets a string representation of the number days away that this date is relative to now (on the client).
	<p>This assumes that the date in the user's local time since it is being compared to "now" 
	in the user's local time.</p>
	@return	{String}	A string representing the number of days away from today with the following criteria:
						<ul><li>If the date was 2 days ago or more: 'X Days Ago'</li>
						<li>If the date was 1 day ago: 'Yesterday'</li>
						<li>If the date is today: 'Today'</li>
						<li>If the date is in 1 day: 'Tomorrow'</li>
						<li>If the date is in 2 days or more: 'in X Days'</li></ul>
*/
Date.prototype.getFormattedDaysFromNow = function()
{
	var time = this;
	var daysFromNow = time.getDaysFromNow();
	
	if (daysFromNow < -1)
	{
		return -daysFromNow + " Days Ago";
	}
	else if (daysFromNow == -1)
	{
		return "Yesterday";
	}
	else if (daysFromNow == 0)
	{
		return "Today";
	}
	else if (daysFromNow == 1)
	{
		return "Tomorrow";
	}
	else if (daysFromNow > 1)
	{
		return "in " + daysFromNow + " Days";
	}
};


/**

Funtion to format dates using the same 'format' strings as the 
 java.text.SimpleDateFormat class, with minor exceptions.
 The format string consists of the following abbreviations:


 Field        | Full Form          | Short Form
 -------------+--------------------+-----------------------
 Year         | yyyy (4 digits)    | yy (2 digits), y (2 or 4 digits)
 Month        | MMM (name or abbr.)| MM (2 digits), M (1 or 2 digits)
              | NNN (abbr.)        |
 Day of Month | dd (2 digits)      | d (1 or 2 digits)
 Day of Week  | EE (name)          | E (abbr)
 Hour (1-12)  | hh (2 digits)      | h (1 or 2 digits)
 Hour (0-23)  | HH (2 digits)      | H (1 or 2 digits)
 Hour (0-11)  | KK (2 digits)      | K (1 or 2 digits)
 Hour (1-24)  | kk (2 digits)      | k (1 or 2 digits)
 Minute       | mm (2 digits)      | m (1 or 2 digits)
 Second       | ss (2 digits)      | s (1 or 2 digits)
 AM/PM        | a                  |

 NOTE THE DIFFERENCE BETWEEN MM and mm! Month=MM, not mm!
 Examples:
  "MMM d, y" matches: January 01, 2000
                      Dec 1, 1900
                      Nov 20, 00
  "M/d/yy"   matches: 01/20/00
                      9/2/00
  "MMM dd, yyyy hh:mm:ssa" matches: "January 01, 2000 12:30:45AM"
 ------------------------------------------------------------------
	Author: Matt Kruse <matt@mattkruse.com>
	WWW: http://www.mattkruse.com/
 
	@return		{String}	The formatted representation of the date
*/
Date.prototype.formatDate = function(format)
{
	
	var MONTH_NAMES=new Array('January','February','March','April','May','June','July','August','September','October','November','December','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
	var DAY_NAMES=new Array('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sun','Mon','Tue','Wed','Thu','Fri','Sat');
	function LZ(x) {return(x<0||x>9?"":"0")+x}
	var date = this;
	format=format+"";
	var result="";
	var i_format=0;
	var c="";
	var token="";
	var y=date.getYear()+"";
	var M=date.getMonth()+1;
	var d=date.getDate();
	var E=date.getDay();
	var H=date.getHours();
	var m=date.getMinutes();
	var s=date.getSeconds();
	var yyyy,yy,MMM,MM,dd,hh,h,mm,ss,ampm,HH,H,KK,K,kk,k;
	// Convert real date parts into formatted versions
	var value=new Object();
	if (y.length < 4) {y=""+(y-0+1900);}
	value["y"]=""+y;
	value["yyyy"]=y;
	value["yy"]=y.substring(2,4);
	value["M"]=M;
	value["MM"]=LZ(M);
	value["MMM"]=MONTH_NAMES[M-1];
	value["NNN"]=MONTH_NAMES[M+11];
	value["d"]=d;
	value["dd"]=LZ(d);
	value["E"]=DAY_NAMES[E+7];
	value["EE"]=DAY_NAMES[E];
	value["H"]=H;
	value["HH"]=LZ(H);
	if (H==0){value["h"]=12;}
	else if (H>12){value["h"]=H-12;}
	else {value["h"]=H;}
	value["hh"]=LZ(value["h"]);
	if (H>11){value["K"]=H-12;} else {value["K"]=H;}
	value["k"]=H+1;
	value["KK"]=LZ(value["K"]);
	value["kk"]=LZ(value["k"]);
	if (H > 11) { value["a"]="PM"; }
	else { value["a"]="AM"; }
	value["m"]=m;
	value["mm"]=LZ(m);
	value["s"]=s;
	value["ss"]=LZ(s);
	while (i_format < format.length) {
		c=format.charAt(i_format);
		token="";
		while ((format.charAt(i_format)==c) && (i_format < format.length)) {
			token += format.charAt(i_format++);
			}
		if (value[token] != null) { result=result + value[token]; }
		else { result=result + token; }
		}
	return result;
};


/**
	Gets a specially formatted string from a date object using the following criteria:
	<ul>
	<li>If the date is today, the value will be "Today [Time Posted]"</li>
	<li>If the date is yesterday, the value will be "Yesterday [Time Posted]"</li>
	<li>If the date is 2 days ago or older, the value will be "[Date Posted] [Time Posted]"</li>
	</ul>
	<p>This assumes that the date in the user's local time since it is being compared to "now" 
	in the user's local time.</p>
	@return		{String}	The formatted representation of the date
*/
Date.prototype.getFormattedDateTime = function()
{
	var time = this;
	var formattedDateTime = time.getFormattedDate() + " " + time.getFormattedTime();

	return formattedDateTime;
};


/**
	Gets a specially formatted string of the time portion of a date object, ex. '1:48 PM'
	@return		{String}	The formatted representation of the time portion of the date
*/
Date.prototype.getFormattedTime = function()
{
	var time = this;
	
	var timeHour = time.getHours() % 12 || 12;
	var timeAmPm = (time.getHours() < 12) ? "AM" : "PM";
	var timeMinutes = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes();
	var formattedTime = timeHour + ":" + timeMinutes+ " " + timeAmPm;

	return formattedTime;
};

/**
	Gets a specially formatted string from a date object using the following criteria:
	<ul>
	<li>If the date is today, the value will be "Today"</li>
	<li>If the date is yesterday, the value will be "Yesterday"</li>
	<li>If the date is 2 days ago or older, the value will be "[Date Posted]"</li>
	</ul>
	<p>This assumes that the date in the user's local time since it is being compared to "now" 
	in the user's local time.</p>
	@return		{String}	The formatted representation of the date
*/
Date.prototype.getFormattedDate = function()
{
	var date = this;
	var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		
	var formattedDate;
	
	var dateDifference = date.getDaysFromNow();
	// if the date provided is in the future or longer than 1 day in the past, just show the date
	if (dateDifference > 0 || dateDifference < -1)
	{
		formattedDate = months[date.getMonth()] + " " + date.getDate();
	}
	else if (dateDifference == 0)
	{
		formattedDate = "Today";
	}
	else if (dateDifference == -1)
	{
		formattedDate = "Yesterday";
	}
	return formattedDate;
};



/**
	Converts a date that is in GMT time to the user's local time.
	Note: This modifies the actual object.
*/
Date.prototype.convertGMTToLocal = function()
{
	this.setMinutes(this.getMinutes() - this.getTimezoneOffset());
};

/**
	Converts a date that is in the user's local time to GMT time.
	Note: This modifies the actual object.
*/
Date.prototype.convertLocalToGMT = function()
{
	this.setMinutes(this.getMinutes() + this.getTimezoneOffset());
};



/************************************
	Other Utilities
************************************/
/**
	Searches the query string parameters on the current page's URL and returns the 
	value of the one with the name that was passed in.
	@param	{String}	p_paramName		The name of the query string value to get
	@return	{String}	The value of the query string parameter with the given name
*/
function getQueryStringValue(p_paramName)
{
	var valuesFromName = {};
	var queryString = window.location.search;
	if (queryString.length > 1)
	{
		queryString = queryString.substring(1, queryString.length);
		for(var i=0; i < queryString.split("&").length; i++)
		{
			var nameValuePair = queryString.split("&")[i];
			valuesFromName[nameValuePair.split("=")[0]] = nameValuePair.split("=")[1];
		}
		if (valuesFromName[p_paramName] != undefined)
		{
			return valuesFromName[p_paramName];
		}
		else
		{
			return "";
		}
	}
	else
	{
		return "";
	}
}

/**
	Creates a cookie with the given name, value, and days from today in which it should expire.
	@param	{String}	p_name		The name of the cookie
	@param	{String}	p_value		The value of the cookie
	@param	{Integer}	p_minutes	The number of minutes from now to set the expiration to
*/
function createCookie(p_name, p_value, p_minutes)
{
	if (p_minutes > 0)
	{
		var date = new Date();
		date.setMinutes(date.getMinutes() + p_minutes);
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = p_name + "=" + p_value + expires + "; path=/";
}

/**
	Reads the value of a cookie with the given name, if it exists.
	@param	{String}	p_name		The name of the cookie
	@return	{String}	The value of the cookie
*/
function readCookie(p_name)
{
	var nameEQ = p_name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++)
	{
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

/**
	Deletes a cookie with the given name.
	@param	{String}	p_name		The name of the cookie
*/
function eraseCookie(p_name)
{
	createCookie(p_name,"",-1);
}

/**
	Redirects the user to the login page
	@param	{String}	p_cs		The current client string
	@return		{none}
*/
var redirectToLoginPage = function(p_cs)
{
	window.location.href = window.location.protocol + "//" + document.domain + "/login.html?cs=" + p_cs;
};

/**
	Applies branding for the current client to the page
	@param	{jQuery}	p_headElement		A jQuery reference to the head element of the page
	@param	{String}	p_clientString		The client string of the current user
	@return	{String}	The value of the cookie
*/
var applyBrandingToPage = function(p_headElement, p_clientString)
{
	p_headElement.append("<link rel='stylesheet' type='text/css' media='screen' href='styles/" + p_clientString + "/style.css' />");
};

/**
    Validates the authorization header response and handles a bad response or executes
    p_callback function
    @param  {Array}     p_authorizationHeader   Authorization Header array
    @param  {String}    p_errorCode             Error Code from retrieval of auth header
    @param  {String}    p_clientString          Client String for ep identification and branding
    @param  {Function}  p_callbackIfValid       Code to execute if the auth header is valid
    @param  {Function}  p_callbackIfError       Code to execute if the auth header is invalid
*/

var validateAuthHeaderAndGo = function(p_authorizationHeader, p_errorCode, p_clientString, p_callbackIfValid, p_callbackIfError)
{
    // if there was no auth header and the error code was a 400, then the user needs to log in
    if (p_authorizationHeader == null)
    {
        // Check for status code 400, which means we have an expired authorization grant
        // and need to re-login.
        if (p_errorCode == "400")
        {
            redirectToLoginPage(p_clientString);
            return;
        }
        // No need to catch a 401 here, as that could only happen for the subsequent service calls
        
        // Other unknown error, send error back to caller
        if  (p_callbackIfError == null || p_callbackIfError == undefined)
        {
            redirectToLoginPage(p_clientString);
            return;
        }
        p_callbackIfError();
        return;
    }
    // do we need to do additional work?
	if (p_callbackIfValid != null && p_callbackIfValid != undefined)
	{
	    p_callbackIfValid();
	}
};
