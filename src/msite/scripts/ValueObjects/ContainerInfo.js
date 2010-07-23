/**
	@class
	@author		TimS
	
	@description
	<p>The ContainerInfo class holds information about the various parents of a topic</p>
*/
function ContainerInfo()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The id of the content item that contains the topic.
		@type String
	*/
	this.contentItemId = "";

	/**
		The title of the content item that contains the topic.
		@type String
	*/
	this.contentItemTitle = "";
	
	/**
		The order number of the content item that contains the topic
		@type Number
	*/
	this.contentItemOrderNumber = 0;

	/**
		The title of the unit that contains the topic.
		@type String
	*/
	this.unitTitle = "";
	
	/**
		The number of the unit that contains the topic
		@type Number
	*/
	this.unitNumber = 0;
	
	/**
		The unit header of the course that contains the topic
		@type String
	*/
	this.unitHeader = 0;
	
	/**
		The id of the course that contains the topic
		@type String
	*/
	this.courseId = "";
	
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific ContainerInfo instance.
	@name		ContainerInfo#toString
	@function
	@return		{String}	The class name
	
*/
ContainerInfo.prototype.toString = function()
{
	return	"[ContainerInfo]";
}