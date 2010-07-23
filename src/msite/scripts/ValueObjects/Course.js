/**
	@class
	@author		MacA
	
	@description
	<p>The Course class defines a set of properties that are specific to an eCollege course.</p>
*/
function Course()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The ID of the course.
		@type String
	*/
	this.id = "";
	
	/**
		The title of the course.
		@type String
	*/
	this.title = "";
	
	/**
		The display course code of the course.
		@type String
	*/
	this.displayCourseCode = "";
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific Course instance.
	@name		Course#toString
	@function
	@return		{String}	The class name
	
*/
Course.prototype.toString = function()
{
	return	"[Course]";
}