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
	@author		MattS
	
	@description
	<p>The CourseItem class defines a set of properties that are specific to an eCollege course item.</p>
*/
function CourseItem()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The ID of the item.
		@type String
	*/
	this.id = "";
	
	/**
		The title of the item.
		@type String
	*/
	this.title = "";
	
	
	
	this.scheduledEventType = "";
	
	
	/**
		The duedate of the item.
		@type String
	*/
	this.scheduledDateISO8601 = "";	
	
	/**
		The duedate of the item.
		@type String
	*/
	this.dueDateISO8601 = "";
	
	/**
		The startDate of the item.
		@type String
	*/
	this.startDateISO8601 = "";
	
	/**
		The endDate of the item.
		@type String
	*/
	this.endDateISO8601 = "";
	

	this.scheduledDate = 0;
	/**
		The due date of the item in milliseconds since Jan 1, 1970
		@type	Integer
	*/
	this.dueDate = 0;
	
	/**
		The start date of the item in milliseconds since Jan 1, 1970
		@type	Integer
	*/
	this.startDate = 0;
	
	/**
		The end date of the item in milliseconds since Jan 1, 1970
		@type	Integer
	*/
	this.endDate = 0;
	
	
	this.scheduledDateFormatted = "";
	
	
	/**
		The start date of the item formatted with the following criteria:
		<ul>
		<li>If the date is today, the value will be "Today [Time Posted]"</li>
		<li>If the date is yesterday, the value will be "Yesterday [Time Posted]"</li>
		<li>If the date is 2 days ago or older, the value will be "[Date Posted] [Time Posted]"</li>
		</ul>
		@type	String
	*/
	this.startDateFormatted = "";
	
	/**
		The end date of the item formatted with the following criteria:
		<ul>
		<li>If the date is today, the value will be "Today [Time Posted]"</li>
		<li>If the date is yesterday, the value will be "Yesterday [Time Posted]"</li>
		<li>If the date is 2 days ago or older, the value will be "[Date Posted] [Time Posted]"</li>
		</ul>
		@type	String
	*/
	this.endDateFormatted = "";
	
	
	/**
		The due date of the item formatted with the following criteria:
		<ul>
		<li>If the date is today, the value will be "Today [Time Posted]"</li>
		<li>If the date is yesterday, the value will be "Yesterday [Time Posted]"</li>
		<li>If the date is 2 days ago or older, the value will be "[Date Posted] [Time Posted]"</li>
		</ul>
		@type	String
	*/
	this.dueDateFormatted = "";
	
	/**
		Whether or not the content is available before the scheduled start date.
		@type	Boolean
	*/
	this.canAccessBeforeStartDate = true;
	
	/**
		Whether or not the content is available after the scheduled end date.
		@type	Boolean
	*/
	this.canAccessAfterEndDate = true;
	
	
	/**
		The type of content this course item represents.
		@type	String
	*/
	this.contentType = "";
	
	/**
		The order number of this item
		@type	Integer
	*/
	this.orderNumber = 0;

	/**
		The id of the parent to this item
		@type	String
	*/
	this.parentId = "";

	/**
		The title of the parent to this item
		@type	String
	*/
	this.parentTitle = "";

	/**
		The order number of the parent to this item
		@type	Integer
	*/
	this.parentOrderNumber = 0;

	/**
		The course ID that this item is in.
		@type	String
	*/
	this.courseId = "";
	
	/**
		The name of the course that this item is in.
		@type	String
	*/
	this.courseTitle = "";

	/**
	The unitheader of the course that this item is in.
	@type	String
	*/
	this.unitHeader = "";
	
	
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific Course instance.
	@name		Course#toString
	@function
	@return		{String}	The class name
	
*/
CourseItem.prototype.toString = function()
{
	return	"[CourseItem]";
}