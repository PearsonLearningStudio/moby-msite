/**
	@class
	@author		MacA
	
	@description
	<p>The MobyDataEvent class is used as the base class for the creation of MobyDataEvent objects, which are passed as parameters to event listeners when an event occurs. </p>
*/
function MobyDataEvent(p_type)
{
	VariableValidator.optional(this, p_type, "string");
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	
	/**
		The type of this event.
		@type String
	*/
	this.type = (p_type != undefined) ? p_type : CustomEvent.CUSTOM;
}

MobyDataEvent.HAPPENINGS_LOADED = "happeningsLoaded";
MobyDataEvent.DISCUSSIONS_LOADED = "discussionsLoaded";
MobyDataEvent.APPLICATION_ERROR = "applicationError";

MobyDataEvent.AUTHORIZE_SUCCESS = "authorizeSucces";
MobyDataEvent.AUTHORIZE_ERROR = "authorizeError";
MobyDataEvent.COURSE_LIST_READY = "courseListReady";
MobyDataEvent.ANNOUNCEMENTS_READY = "announcementsReady";
MobyDataEvent.GRADES_READY = "gradesReady";
MobyDataEvent.DROPBOX_READY = "dropboxReady";
MobyDataEvent.SCHEDULER_ITEMS_DUE_READY = "schedulerItemsDueReady";
MobyDataEvent.SCHEDULER_ITEMS_START_READY = "schedulerItemsStartReady";
MobyDataEvent.SCHEDULER_ITEMS_END_READY = "schedulerItemsEndReady";
MobyDataEvent.SCHEDULER_ITEMS_RESTRICTED_READY = "schedulerItemsRestrictedReady";
MobyDataEvent.THREADS_RESPONSES_TO_TOPIC_READY = "threadsResponsesToTopicReady";
MobyDataEvent.THREADS_RESPONSES_TO_RESPONSE_READY = "threadsResponsesToResponseReady";
MobyDataEvent.THREADS_USER_TOPICS_READY = "threadsUserTopicsReady";
MobyDataEvent.THREADS_RESPONSES_TO_ME_READY = "threadsResponsesToMeReady";
MobyDataEvent.THREADS_RESPONSE_COUNTS_FOR_TOPIC_READY = "threadsResponseCountsForTopicReady";
MobyDataEvent.THREADS_RESPONSE_COUNTS_FOR_RESPONSE_READY = "threadsResponseCountsForResponseReady";
MobyDataEvent.THREADS_TOPIC_BY_ID_READY = "threadsTopicByIdReady";
MobyDataEvent.THREADS_RESPONSE_BY_ID_READY = "threadsResponseByIdReady";

MobyDataEvent.THREADS_RESPONSE_POST_READ_STATUS_SUCCESS = "threadsResponsePostReadStatusSuccess";
MobyDataEvent.THREADS_RESPONSE_POST_TO_TOPIC_SUCCESS = "threadsResponsePostToTopicSuccess";
//MobyDataEvent.THREADS_RESPONSE_POST_TO_TOPIC_ERROR = "threadsResponsePostToTopicError";
MobyDataEvent.THREADS_RESPONSE_POST_TO_RESPONSE_SUCCESS = "threadsResponsePostToResponseSuccess";
//MobyDataEvent.THREADS_RESPONSE_POST_TO_RESPONSE_ERROR = "threadsResponsePostToResponseError";


MobyDataEvent.COMPLETE = "complete";

/************************************
	Inheritance Declaration
	This must be declared before any other prototyped methods/properties
************************************/
MobyDataEvent.prototype = new CustomEvent();
MobyDataEvent.prototype.constructor = MobyDataEvent;

/************************************
	Public Prototype Methods
************************************/
/**
	Returns the type of the instance.
	@name		MobyDataEvent#toString
	@function
	@return		{String}	The class name.
	
*/
MobyDataEvent.prototype.toString = function()
{
	return	"[MobyDataEvent]";
}