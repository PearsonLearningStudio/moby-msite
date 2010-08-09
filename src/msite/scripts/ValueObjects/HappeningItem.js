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
	@author		TimS
	
	@description
	<p>The HappeningItem class defines a set of properties that are shared between all of the items
	that are displayed on the Happenings page.</p>
*/
function HappeningItem()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/

	/**
		The id of the happening item
		@type String
	*/
	this.id = "";

	/**
		The type "thing" that happened.  Can be "Announcement", "Grade", "CourseItem", "ThreadResponse", "ThreadTopic", and "Dropbox"
		@type String
	*/
	this.type = "";
	
	/**
		The date that this item happened, or will happen, on.
		@type Integer
	*/
	this.date = 0;

	/**
		A formatted representation of the date.
		@type String
	*/
	this.dateFormatted = "";
	
	
	/**
		The absolute number of milliseconds between this item's date and now.  This is used primarily for sorting.
		@type Number
	*/
	this.timeFromNow = 0;
	
	/**
		A summary of the happening item.
		@type String
	*/
	this.subject = "";

	/**
		A more detailed description of the happening item.
		@type String
	*/
	this.text = "";
	
	/**
		The id of the course that this item belongs to
		@type	String
	*/
	this.courseId = "";

	/**
		The title of the course that this item belongs to
		@type String
	*/
	this.courseTitle = "";
	
	/**
		The underlying domain object (e.g. announcement, item grade, etc.) that this happening item represents
		@type String
	*/
	this.domainObject = null;
	
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific HappeningItem instance.
	@name		HappeningItem#toString
	@function
	@return		{String}	The class name
	
*/
HappeningItem.prototype.toString = function()
{
	return	"[HappeningItem]";
}


/************************************
	Static Properties
************************************/

/**
	Defines the HappeningItem type for announcements.
	@static
	@type	String
	@default	"Announcement"
*/
HappeningItem.ANNOUNCEMENT_TYPE = "Announcement";

/**
	Defines the HappeningItem type for grades.
	@static
	@type	String
	@default	"Grade"
*/
HappeningItem.GRADE_TYPE = "Grade";

/**
	Defines the HappeningItem type for course items.
	@static
	@type	String
	@default	"CourseItem"
*/
HappeningItem.COURSEITEM_TYPE = "CourseItem";

/**
	Defines the HappeningItem type for thread responses.
	@static
	@type	String
	@default	"ThreadResponse"
*/
HappeningItem.THREADRESPONSE_TYPE = "ThreadResponse";

/**
	Defines the HappeningItem type for thread topics.
	@static
	@type	String
	@default	"ThreadTopic"
*/
HappeningItem.THREADTOPIC_TYPE = "ThreadTopic";

/**
	Defines the HappeningItem type for dropbox.
	@static
	@type	String
	@default	"Dropbox"
*/
HappeningItem.DROPBOX_TYPE = "Dropbox";
