/**
	@class
	@author		TimS
	
	@description
	<p>The ResponseCounts class defines a set of properties that are specific 
	to either a response or a topic.</p>
*/
function ResponseCounts()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The total number of responses
		@type Number
	*/
	this.totalResponseCount = 0;
	
	/**
		The number of unread responses
		@type Number
	*/
	this.unreadResponseCount = 0;
	
	/**
		The number of responses made in the last 24 hours
		@type Number
	*/
	this.last24HourResponseCount = 0;
	
	/**
		The number of responses made by the user
		@type Number
	*/
	this.personalResponseCount = 0;
	
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific ResponseCounts instance.
	@name		ResponseCounts#toString
	@function
	@return		{String}	The class name
	
*/
ResponseCounts.prototype.toString = function()
{
	return	"[ResponseCounts]";
}