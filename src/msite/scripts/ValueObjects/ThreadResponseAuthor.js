/**
	@class
	@author		MacA
	
	@description
	<p>The ThreadResponseAuthor class defines a set of properties that are specific 
	to a user who authored a thread response.</p>
*/
function ThreadResponseAuthor()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The ID of the user who authored a thread response.
		@type String
	*/
	this.id = "";
	
	/**
		The first name of the user who authored a thread response.
		@type	String
	*/
	this.firstName = "";
	
	/**
		The last name of the user who authored a thread response.
		@type String
	*/
	this.lastName = "";
	
	/**
		The email address of the user who authored a thread response.
		@type String
	*/
	this.email = "";
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific ThreadResponseAuthor instance.
	@name		ThreadResponseAuthor#toString
	@function
	@return		{String}	The class name
	
*/
ThreadResponseAuthor.prototype.toString = function()
{
	return	"[ThreadResponseAuthor]";
}