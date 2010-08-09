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
	<p>The CourseListServiceManager class is a singleton that manages requests to the course list web service. 
	A successful response will generate a collection of Course objects,	and pass that collection to the 
	"onLoadComplete" method.</p>
	
	@requires	VariableValidator.js
				AjaxManager.js
*/
var CourseListServiceManager = (function()
{
	/**
		The singleton instance of the CourseListServiceManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the CourseListServiceManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		/**
			A reference to the AjaxManager singleton.
			@private
		*/
		var _ajaxManager = AjaxManager.getInstance();
		
		/**
			A reference to the SessionManager singleton.
			@private
		*/
		var _sessionManager = SessionManager.getInstance();
		
		/**
			The collection of Course objects. Courses are created and stored in this 
			collection after a successful ajax response.
			@default	[]
			@private
		*/
		var _courses = [];
		
		
		
		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
		/**
			The onLoadComplete handler contains a reference to a function that will be invoked when the 
			course list request has been received. The method will receive an array of Course objects
			as a parameter.
			
			@type		Function
			@default	null
		*/
		this.onLoadComplete = null;
		
		/**
			The base URL for the course list service. Ex: "http://courselist-api.ecollege.com"
			
			@type		String
			@default	""
		*/
		this.serviceLocation = "";
		
		/************************************
			Private Methods
		************************************/
		
		/**
			Handles a successful ajax request and creates Course objects from the JSON data returned.
			After the Courses are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _courseListSuccessHandler = function(p_data, p_transactionId)
		{
			_courses = [];
			_wmm.measure("Moby.CourseList.ServiceComplete", "courseList");
			for (var i = 0; i < p_data.currentCourses.length; i++)
			{
				var course = new Course();
				course.id = p_data.currentCourses[i].id;
				course.title = p_data.currentCourses[i].title;
				course.displayCourseCode = p_data.currentCourses[i].displayCourseCode;
				_courses.push(course);

			}
			
			_instance.onLoadComplete(_courses);
		};
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _courseListErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.CourseList.ServiceComplete", "courseList");
			_courses = null;
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_instance.onLoadComplete(_courses);
			}
		};
		
		
		
		
		/************************************
			Public Methods
		************************************/
		/**
			Makes a request to get the user-specific list of courses.
			
			@param	{String}	p_userId			The user ID to get the course list for.
			@param	{Array}		p_requestHeaders	An array of AjaxRequestHeader objects to attach to the request.
		*/
		/*
		this.getCoursesByUserId = function(p_userId, p_requestHeaders)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			_wmm.mark("courseList");
			_ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/currentcourses?daysafterend=14", p_requestHeaders, _courseListSuccessHandler, _courseListErrorHandler);
		};
		*/
		
		/**
			Makes a request to get the list of courses for user that is currently authenticated.
			
			@param	{Array}		p_requestHeaders	An array of AjaxRequestHeader objects to attach to the request.
		*/
		this.getCoursesForMe = function(p_requestHeaders)
		{
			VariableValidator.optional(this, p_requestHeaders, "Array");
			_wmm.mark("courseList");
			_ajaxManager.get(this.serviceLocation + "/me/currentcourses?daysafterend=14", p_requestHeaders, _courseListSuccessHandler, _courseListErrorHandler);
		};
	}
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific CourseListServiceManager instance.
		@name		CourseListServiceManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[CourseListServiceManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the CourseListServiceManager singleton.
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