/**
	@class
	@author		MacA
	
	@description
	<p>The CustomEvent class is used as the base class for the creation of CustomEvent objects, which are passed as parameters to event listeners when an event occurs. </p>
*/
function CustomEvent(p_type)
{
	VariableValidator.optional(this, p_type, "string");
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	
	/**
		<p>The object that dispatched the event.</p>
		<p><strong>Note:</strong> This gets set by the EventDispatcher object. Don't set this manually and 
		don't override this in any classes that extend this one. This should be a read-only public property, but 
		unfortunately this cannot be enforced in JS.</p>
		@type String
	*/
	this.target = null;
	
	/**
		The type of this event.
		@type String
	*/
	this.type = (p_type != undefined) ? p_type : CustomEvent.CUSTOM;
	
	/**
		An object used to pass data along with the event. This gets set when a second parameter is specified
		when calling "dispatchEvent" on the EventDispatcher object.
		@type String
	*/
	this.eventData = null;
}

CustomEvent.CUSTOM = "custom";

/************************************
	Public Prototype Methods
************************************/
/**
	Returns the type of the instance.
	@name		CustomEvent#toString
	@function
	@return		{String}	The class name.
	
*/
CustomEvent.prototype.toString = function()
{
	return	"[CustomEvent]";
}