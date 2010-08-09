/*
 * This software is licensed under the Apache 2 license, quoted below.
 * 
 * Copyright 2010 eCollege.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
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

/**
	Defines the value of the property of a happenings page loaded event object.
	@static
	@type	String
	@default	"happeningsLoaded"
*/
MobyDataEvent.HAPPENINGS_LOADED = "happeningsLoaded";

/**
	Defines the value of the property of a discussion page loaded event object.
	@static
	@type	String
	@default	"discussionsLoaded"
*/
MobyDataEvent.DISCUSSIONS_LOADED = "discussionsLoaded";

/**
	Defines the value of the property of an application error event object.
	@static
	@type	String
	@default	"applicationError"
*/
MobyDataEvent.APPLICATION_ERROR = "applicationError";

/**
	Defines the value of the property of an authorize success event object.
	@static
	@type	String
	@default	"authorizeSuccess"
*/
MobyDataEvent.AUTHORIZE_SUCCESS = "authorizeSuccess";

/**
	Defines the value of the property of an authorize error event object.
	@static
	@type	String
	@default	"authorizeError"
*/
MobyDataEvent.AUTHORIZE_ERROR = "authorizeError";

/**
	Defines the value of the property of a course list ready event object.
	@static
	@type	String
	@default	"courseListReady"
*/
MobyDataEvent.COURSE_LIST_READY = "courseListReady";

/**
	Defines the value of the property of a announcements ready event object.
	@static
	@type	String
	@default	"announcementsReady"
*/
MobyDataEvent.ANNOUNCEMENTS_READY = "announcementsReady";

/**
	Defines the value of the property of a grades ready event object.
	@static
	@type	String
	@default	"gradesReady"
*/
MobyDataEvent.GRADES_READY = "gradesReady";

/**
	Defines the value of the property of a dropbox ready event object.
	@static
	@type	String
	@default	"dropboxReady"
*/
MobyDataEvent.DROPBOX_READY = "dropboxReady";

/**
	Defines the value of the property of a scheduler items due ready event object.
	@static
	@type	String
	@default	"schedulerItemsDueReady"
*/
MobyDataEvent.SCHEDULER_ITEMS_DUE_READY = "schedulerItemsDueReady";

/**
Defines the value of the property of a all scheduled items ready event object.
@static
@type	String
@default	"schedulerItemsDueReady"
*/
MobyDataEvent.SCHEDULER_ITEMS_READY = "schedulerItemsReady";


/**
	Defines the value of the property of a scheduler items start ready event object.
	@static
	@type	String
	@default	"schedulerItemsStartReady"
*/
MobyDataEvent.SCHEDULER_ITEMS_START_READY = "schedulerItemsStartReady";

/**
	Defines the value of the property of a scheduler items end ready event object.
	@static
	@type	String
	@default	"schedulerItemsEndReady"
*/
MobyDataEvent.SCHEDULER_ITEMS_END_READY = "schedulerItemsEndReady";

/**
	Defines the value of the property of a scheduler items restricted ready event object.
	@static
	@type	String
	@default	"schedulerItemsRestrictedReady"
*/
MobyDataEvent.SCHEDULER_ITEMS_RESTRICTED_READY = "schedulerItemsRestrictedReady";

/**
	Defines the value of the property of a threads responses to topic ready event object.
	@static
	@type	String
	@default	"threadsResponsesToTopicReady"
*/
MobyDataEvent.THREADS_RESPONSES_TO_TOPIC_READY = "threadsResponsesToTopicReady";

/**
	Defines the value of the property of a threads responses to response ready event object.
	@static
	@type	String
	@default	"threadsResponsesToResponseReady"
*/
MobyDataEvent.THREADS_RESPONSES_TO_RESPONSE_READY = "threadsResponsesToResponseReady";

/**
	Defines the value of the property of a threads user topics ready event object.
	@static
	@type	String
	@default	"threadsUserTopicsReady"
*/
MobyDataEvent.THREADS_USER_TOPICS_READY = "threadsUserTopicsReady";

/**
	Defines the value of the property of a threads responses to me ready event object.
	@static
	@type	String
	@default	"threadsResponsesToMeReady"
*/
MobyDataEvent.THREADS_RESPONSES_TO_ME_READY = "threadsResponsesToMeReady";

/**
	Defines the value of the property of a threads response counts for topic ready event object.
	@static
	@type	String
	@default	"threadsResponseCountsForTopicReady"
*/
MobyDataEvent.THREADS_RESPONSE_COUNTS_FOR_TOPIC_READY = "threadsResponseCountsForTopicReady";

/**
	Defines the value of the property of a threads response counts for response ready event object.
	@static
	@type	String
	@default	"threadsResponseCountsForResponseReady"
*/
MobyDataEvent.THREADS_RESPONSE_COUNTS_FOR_RESPONSE_READY = "threadsResponseCountsForResponseReady";

/**
	Defines the value of the property of a threads topic by ID ready event object.
	@static
	@type	String
	@default	"threadsTopicByIdReady"
*/
MobyDataEvent.THREADS_TOPIC_BY_ID_READY = "threadsTopicByIdReady";

/**
	Defines the value of the property of a threads response by ID ready event object.
	@static
	@type	String
	@default	"threadsResponseByIdReady"
*/
MobyDataEvent.THREADS_RESPONSE_BY_ID_READY = "threadsResponseByIdReady";

/**
	Defines the value of the property of a threads response post read status success event object.
	@static
	@type	String
	@default	"threadsResponsePostReadStatusSuccess"
*/
MobyDataEvent.THREADS_RESPONSE_POST_READ_STATUS_SUCCESS = "threadsResponsePostReadStatusSuccess";

/**
	Defines the value of the property of a data threads response post to topic success object.
	@static
	@type	String
	@default	"threadsResponsePostToTopicSuccess"
*/
MobyDataEvent.THREADS_RESPONSE_POST_TO_TOPIC_SUCCESS = "threadsResponsePostToTopicSuccess";

/**
	Defines the value of the property of a threads response post to response success event object.
	@static
	@type	String
	@default	"threadsResponsePostToResponseSuccess"
*/
MobyDataEvent.THREADS_RESPONSE_POST_TO_RESPONSE_SUCCESS = "threadsResponsePostToResponseSuccess";

/**
	Defines the value of the property of a data complete event object.
	@static
	@type	String
	@default	"complete"
*/
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