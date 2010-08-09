
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
	<p>The UserTopic class defines a set of properties that are specific 
	to a threaded discussion topic for a specific user.</p>
*/
function UserTopic()
{
    var _userTopic = this;

	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The ID of the UserTopic.
		@type String
	*/
	this.id = "";
	
	/**
		The ID of the Topic.
		@type String
	*/
	this.topicId = "";
	
	/**
		The title of the topic
		@type String
	*/
	this.title = "";
	
	/**
		The description of the topic
		@type String
	*/
	this.description = "";
	
	/**
		The order number of the response
		@type Integer
	*/
	this.orderNumber = 0;
	
	/**
		Information on the various parents of the topic
		@type ContainerInfo
	*/
	this.containerInfo = null;
	
	/**
		The ResponseCounts object that contains response information specific to this topic
		@type ResponseCounts
	*/
	this.responseCounts = null
	
	/**
		Whether or not this topic is considered active
		@return		Boolean			True if this topic is active, false otherwise
	*/
	this.isActive = function()
	{
	    if(_userTopic.responseCounts != null
	        && (_userTopic.responseCounts.last24HourResponseCount > 0
	        || _userTopic.responseCounts.unreadResponseCount > 0))
	        
	    {
	        return true;
	    }
	    else
	    {
	        return false;
	    }
	}
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific UserTopic instance.
	@name		UserTopic#toString
	@function
	@return		{String}	The class name
	
*/
UserTopic.prototype.toString = function()
{
	return	"[UserTopic]";
}