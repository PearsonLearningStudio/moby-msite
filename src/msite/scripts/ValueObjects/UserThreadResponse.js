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
	<p>The UserThreadResponse class defines a set of properties that are specific 
	to a threaded discussion response for a given user.</p>
*/
function UserThreadResponse()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The ID of the UserThreadResponse.
		@type String
	*/
	this.id = "";
	
	/**
		A flag indicating whether the the UserThreadResponse has been read or not
		@type	Boolean
	*/
	this.markedAsRead = false;
	
	/**
		The ID of the thread response.
		@type String
	*/
	this.threadResponseId = "";
	
	/**
		The title of the thread response.
		@type String
	*/
	this.title = "";
	
	/**
		The description of the thread response.
		@type String
	*/
	this.description = "";
	
	/**
		The author of the thread response. This is an 
		@type ThreadResponseAuthor
	*/
	this.author = null;
	
	/**
		The date that the thread response was posted in ISO 8601 format.
		@type String
	*/
	this.postedDateISO8601 = "";
	
	/**
		The date that the thread response was posted in milliseconds since Jan 1, 1970.
		@type Integer
	*/
	this.postedDate = 0;
	
	/**
		The date that the thread response was posted formatted using the following criteria:
		<ul>
		<li>If the date is today, the value will be "Today [Time Posted]"</li>
		<li>If the date is yesterday, the value will be "Yesterday [Time Posted]"</li>
		<li>If the date is 2 days ago or older, the value will be "[Date Posted] [Time Posted]"</li>
		</ul>
		@type String
	*/
	this.postedDateFormatted = "";
	
	/**
		The response counts object for this response
		@type	ResponseCounts
	*/
	this.responseCounts = null;
	
	/**
		The id of the topic that the response lives in.
		@type String
	*/
	this.topicId = "";
	
	/**
		The topic that the response lives in.
		@type String
	*/
	this.topic = null;
	
	/**
		The id of the response that the response lives under.
		@type String
	*/
	this.parentResponseId = "";

	/**
		The title of the response that the response lives under.
		@type String
	*/
	this.parentResponseTitle = "";
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific UserThreadResponse instance.
	@name		UserThreadResponse#toString
	@function
	@return		{String}	The class name
	
*/
UserThreadResponse.prototype.toString = function()
{
	return	"[UserThreadResponse]";
}