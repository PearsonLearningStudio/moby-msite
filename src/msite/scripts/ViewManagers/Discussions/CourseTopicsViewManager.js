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
	<p>The ResponseDetailViewManager class is a singleton that manages the display of the Course Topics view.</p>
*/
var CourseTopicsViewManager = (function()
{
	/**
		The singleton instance of the CourseTopicsViewManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the CourseTopicsViewManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
				
		
		/************************************
			Private Methods
		************************************/
	
	
		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
		
		/************************************
			Public Methods
		************************************/
		
		/**
			Handles any initialization needed by the view manager, such as wiring up event handlers
			@return		none
		*/
		this.initialize = function()
		{
		};
		
		/**
			Displays the course topics on the view for a specific course ID
			@param	{String}	p_courseId	A course ID to show topics for
		*/
		this.show = function(p_courseId)
		{
			//Show the course list
			$("#courseTopics").show();

			//Hide all courses but the selected course
			$("#courseTopics .module_bgroup").hide();
			$("#disc-course" + p_courseId).show();

			//Show all topics under the selected course
			$("#disc-course" + p_courseId + " .fullCourseOnlyTopic").show();
			
			//Hide the 'more' link under the selected course
			$("#disc-course" + p_courseId  + " li.more").hide();
			
			//Hide the 'no active topics' message under the selected course if it exists
			$("#disc-course" + p_courseId  + " li.none:has(span.noActiveTopics)").hide();
			
			//Show the unit headers
			$("li.unitHeading").show();
			
			//Show any closed threads
			$("li.closedtopic").show();
		};
		
		/**
			Hides the existing course topics on the view
		*/
		this.hide = function()
		{
			//Hide the course list
			$("#courseTopics").hide();
		};
		
	}
	

	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific CourseTopicsViewManager instance.
		@name		CourseTopicsViewManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[CourseTopicsViewManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the CourseTopicsViewManager singleton.
		*/
        this.getInstance = function()
		{
            if (_instance == null)
			{
                _instance = new PrivateConstructor();
                _instance.constructor = null;
            }
            return _instance;
        };
    }
	
})();
