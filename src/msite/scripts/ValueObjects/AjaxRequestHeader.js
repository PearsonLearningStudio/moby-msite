/**
	@class
	@author		MacA
	
	@description
	<p>The AjaxRequestHeader class defines a set of properties that are specific custom headers on AJAX requests</p>
*/
function AjaxRequestHeader()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The name of the custom header.
		@type String
	*/
	this.name = "";
	
	/**
		The value of the custom header.
		@type String
	*/
	this.value = "";

}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific AjaxRequestHeader instance.
	@name		AjaxRequestHeader#toString
	@function
	@return		{String}	The class name
	
*/
AjaxRequestHeader.prototype.toString = function()
{
	return	"[AjaxRequestHeader]";
}