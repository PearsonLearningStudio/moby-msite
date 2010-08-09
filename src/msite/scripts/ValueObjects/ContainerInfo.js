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