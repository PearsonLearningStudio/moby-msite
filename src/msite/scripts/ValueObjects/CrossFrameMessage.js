/**
	@class
	@author		MacA
	
	@description
	<p>The CrossFrameMessage class defines a set of properties that are specific to messages used 
	for communicating information across iFrames from different domains.</p>
*/
function CrossFrameMessage()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The type of message being communicated. Valid values are: "loaded", "registerDomain", "ready", or "ajax".
		@type String
	*/
	this.messageType = "";
	
	/**
		The domain that the message originates from, including the transfer protocol. Ex. "http://mydomain.ecollege.com"
		@type String
	*/
	this.domainOrigin = "";
	
	/**
		The type of AJAX request to make. Ex. "GET" or "POST"
		@type String
	*/
	this.ajaxRequestType = "";
	
	/**
		The number of milliseconds to wait for a response before it's condsidered a timeout.
		@type Integer
	*/
	this.ajaxRequestTimeout = 0;
	
	/**
		The URL to make the AJAX request to.
		@type String
	*/
	this.ajaxRequestUrl = "";
	
	/**
		Any post data to send along with the AJAX request.
		@type String
	*/
	this.ajaxRequestPostData = "";
	
	/**
		The transaction ID of the AJAX request.
		@type String
	*/
	this.ajaxRequestTransactionId = "";
	
	/**
		The number of times to attempt the AJAX request.
		@type Integer
	*/
	this.ajaxRequestNumberOfTries = 1;
	
	/**
		An array of AjaxRequestHeader objects used to assign custom headers to the request.
		@type Array
	*/
	this.ajaxRequestHeaders = [];
	
	/**
		The type of response received by the AJAX request. Valid values are: "success" or "error".
		@type String
	*/
	this.ajaxReponseType = "";
	
	/**
		The data returned by the AJAX request. jQuery will automatically convert this data to an object if the data is a JSON string.
		@type Object
	*/
	this.ajaxReponseData = {};
	
	/**
		The data returned by the AJAX request in String format.
		@type String
	*/
	this.ajaxReponseText = "";
	
	/**
		The status of the AJAX request.
		@type String
	*/
	this.ajaxReponseStatus = "";
	
	/**
		The HTTP status code of the AJAX request.
		@type String
	*/
	this.ajaxReponseCode = "";
}

/************************************
	Static Properties
************************************/
/**
	The message type of "loaded".
	@static
*/
CrossFrameMessage.MESSAGE_TYPE_LOADED = "loaded";
/**
	The message type of "ready".
	@static
*/
CrossFrameMessage.MESSAGE_TYPE_READY = "ready";
/**
	The message type of "registerDomain".
	@static
*/
CrossFrameMessage.MESSAGE_TYPE_REGISTER_DOMAIN = "registerDomain";
/**
	The message type of "ajax".
	@static
*/
CrossFrameMessage.MESSAGE_TYPE_AJAX = "ajax";
/**
	The AJAX response type of "success".
	@static
*/
CrossFrameMessage.AJAX_RESPONSE_TYPE_SUCCESS = "success";
/**
	The AJAX response type of "error".
	@static
*/
CrossFrameMessage.AJAX_RESPONSE_TYPE_ERROR = "error";


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific CrossFrameMessage instance.
	@name		CrossFrameMessage#toString
	@function
	@return		{String}	The class name
	
*/
CrossFrameMessage.prototype.toString = function()
{
	return	"[CrossFrameMessage]";
}