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
	<p>The UserAnnouncement class defines a set of properties that are specific to an Announcement for a given user.</p>
*/
function UserAnnouncement()
{

	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The ID of the UserAnnouncement
		@type	String
	*/
	this.id = "";
	
	/**
		A flag indicating whether the the UserAnnouncement has been read or not
		@type	Boolean
	*/
	this.markedAsRead = false;
	
	/**
		The subject of the Announcement
		@type	String
	*/
	this.subject = "";
	
	/**
		The body text of the Announcement
		@type	String
	*/
	this.text = "";
	
	/**
		The submitter of the Announcement
		@type	String
	*/
	this.submitter = "";
	
	/**
		The start date of the Announcement in ISO 8601 format
		@type	String
	*/
	this.startDateISO8601 = "";
	
	/**
		The end date of the Announcement in ISO 8601 format
		@type	String
	*/
	this.endDateISO8601 = "";
	
	/**
		The start date of the Announcement in milliseconds since Jan 1, 1970
		@type	Integer
	*/
	this.startDate = 0;
	
	/**
		The end date of the Announcement in milliseconds since Jan 1, 1970
		@type	Integer
	*/
	this.endDate = 0;
	
	/**
		The start date of the Announcement formatted with the following criteria:
		<ul>
		<li>If the date is today, the value will be "Today [Time Posted]"</li>
		<li>If the date is yesterday, the value will be "Yesterday [Time Posted]"</li>
		<li>If the date is 2 days ago or older, the value will be "[Date Posted] [Time Posted]"</li>
		</ul>
		@type	String
	*/
	this.startDateFormatted = "";
	
	/**
		The course ID that this announcement is posted to.
		@type	String
	*/
	this.courseId = "";
	
	/**
		The name of the course that this announcement is posted to.
		@type	String
	*/
	this.courseTitle = "";
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific UserAnnouncement instance.
	@name		UserAnnouncement#toString
	@function
	@return		{String}	The class name
	
*/
UserAnnouncement.prototype.toString = function()
{
	return	"[UserAnnouncement]";
}