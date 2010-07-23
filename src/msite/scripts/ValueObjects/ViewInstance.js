/**
	@class
	@author		TimS
	
	@description
	<p>The ViewInstance class combines both the name of a view as well as the data necessary to render that view.
	This is primarily intended to support the back-button functionality in threads.</p>
*/
function ViewInstance()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The name of the view
		@type String
	*/
	this.viewName = "";
	
	/**
		The data necessary to render the view
		@type Object
	*/
	this.viewData = null;
	
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific ViewInstance instance.
	@name		ViewInstance#toString
	@function
	@return		{String}	The class name
	
*/
ViewInstance.prototype.toString = function()
{
	return	"[ViewInstance]";
}