/**
	@class
	@author		MacA
	
	@description
	<p>The DomainStatusEvent class is used as the base class for the creation of CustomEvent objects, which are passed as parameters to event listeners when an event occurs. </p>
*/
function DomainStatusEvent(p_type)
{
	
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	**************************
	
	/**
		The type of this event.
		@type String
	*/
	this.type = (p_type != undefined) ? p_type : CustomEvent.CUSTOM;
}

DomainStatusEvent.DOMAIN_READY = "domainReady";
DomainStatusEvent.DOMAIN_ERROR = "domainError";


/************************************
	Inheritance Declaration
	This must be declared before any other prototyped methods/properties
************************************/
DomainStatusEvent.prototype = new CustomEvent();
DomainStatusEvent.prototype.constructor = DomainStatusEvent;

/************************************
	Public Prototype Methods
************************************/
/**
	Returns the type of the instance.
	@name		DomainStatusEvent#toString
	@function
	@return		{String}	The class name.
	
*/
DomainStatusEvent.prototype.toString = function()
{
	return	"[DomainStatusEvent]";
}