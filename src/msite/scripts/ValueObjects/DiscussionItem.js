/**
	@class
	@author		TimS
	
	@description
	<p>The DiscussionItem class defines a set of properties that are specific 
	to a threaded discussion item.  This class is meant to be an abstraction
	that can represent active topics, inactive topics, or closed threads.</p>
*/
function DiscussionItem()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The ID of the course this discussion item lives in.
		@type String
	*/
	this.courseId = "";
	
	/**
		The title of the course this discussion item lives in.
		@type String
	*/
	this.courseTitle = "";

	/**
		The unit number of the unit this discussion lives in
		@type Integer
	*/
	this.unitNumber = 0;
	
	/**
		The label of the unit this discussion lives in
		@type String
	*/
	this.unitHeader = "";

	/**
		The title unit this discussion lives in
		@type String
	*/
	this.unitTitle = "";
	
	/**
		The order number of the course item this discussion is associated with
		@type Integer
	*/
	this.itemOrderNumber = 0;
	
	/**
		What type of discussion item this is.  Possible values are "ActiveTopic", "InactiveTopic", and "ClosedThread"
		@type ContainerInfo
	*/
	this.itemType = "";
	
	/**
		The actual item that this discussion item represents.  This will be either an instance of UserTopic or CourseItem
		@type object
	*/
	this.item = null
	
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific DiscussionItem instance.
	@name		DiscussionItem#toString
	@function
	@return		{String}	The class name
	
*/
DiscussionItem.prototype.toString = function()
{
	return	"[DiscussionItem]";
}