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
	<p>The AnnouncementsServiceManager class is a singleton that manages requests to the announcements web service. 
	A successful response will generate a collection of Announcement objects, sorted by start date (descending), 
	and pass that collection to the "onLoadComplete" method.</p>
	
	@requires	VariableValidator.js
				AjaxManager.js
*/
var AnnouncementsServiceManager = (function()
{
	/**
		The singleton instance of the AnnouncementsServiceManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the AnnouncementsServiceManager instance.
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
			The collection of Announcement objects. Announcements are created and stored in this 
			collection after a successful ajax response.
			@default	[]
			@private
		*/
		var _announcements = [];
		
		
		
		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
		/**
			The onLoadComplete handler contains a reference to a function that will be invoked when the 
			announcement request has been received. The method will receive an array of Announcement objects
			as a parameter.
			
			@type		Function
			@default	null
		*/
		this.onLoadComplete = null;
		
		/**
			A collection of Course objects that the user is enrolled in. This is used to associate a course ID and title to a UserAnnouncement object.
			
			@type		Array
			@default	[]
		*/
		this.courses = [];
		
		/**
			The base URL for the announcements service. Ex: "http://announcements-api.ecollege.com"
			
			@type		String
			@default	""
		*/
		this.serviceLocation = "";
		
		/************************************
			Private Methods
		************************************/
		/**
			A sorting method used to sort announcement objects by startDate.
			@param		{Announcement}	p_announcementA		The first Announcement to compare.
			@param		{Announcement}	p_announcementB		The second Announcement to compare.
			@return		{Integer}		The difference between the start dates.
			@private
		*/
		var _compareStartDates = function(p_announcementA, p_announcementB)
		{
			// sort descending
			return p_announcementB.startDate - p_announcementA.startDate;
		};
		
		/**
			Handles a successful ajax request and creates Announcement objects from the JSON data returned.
			After the Announcements are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _announcementSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Announcements.ServiceComplete", "announcements");
			_announcements = [];
			for (var i = 0; i < p_data.userannouncements.length; i++)
			{
				for (var j = 0; j < p_data.userannouncements[i].announcement.announcementScopes.length; j++)
				{
					var courseId = p_data.userannouncements[i].announcement.announcementScopes[j].scopeTargetId;
					for (var k = 0; k < _instance.courses.length; k++)
					{
						if (courseId == _instance.courses[k].id)
						{
							_announcements.push(_createAnnouncement(p_data.userannouncements[i], _instance.courses[k].id, _instance.courses[k].title));
						}
					}
				}
			}
			
			_announcements.sort(_compareStartDates);
			_instance.onLoadComplete(_announcements);
		};
		
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _announcementErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.Announcements.ServiceComplete", "announcements");
			_announcements = null;
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_instance.onLoadComplete(_announcements);
			}
		};
		
		
		/**
			Creates a UserAnnouncement object from the announcement data returned by the web service.
			@param		{Object}			p_announcementData		The announcement data in the form of a JSON object
			@param		{String}			p_courseId				The course ID associated with this announcement
			@param		{String}			p_courseTitle			The course title associated with this announcement
			@return		{UserAnnouncement}	The newly created UserAnnouncement object
		*/
		var _createAnnouncement = function(p_announcementData, p_courseId, p_courseTitle)
		{
			var announcement = new UserAnnouncement();
			announcement.id = p_announcementData.id;
			announcement.markedAsRead = p_announcementData.markedAsRead;
			announcement.subject = p_announcementData.announcement.subject.stripHtmlTags(true);
			announcement.text = p_announcementData.announcement.text.stripHtmlTags(true);
			announcement.submitter = p_announcementData.announcement.submitter;
			announcement.startDateISO8601 = p_announcementData.announcement.startDisplayDate;
			announcement.endDateISO8601 = p_announcementData.announcement.endDisplayDate;
			announcement.startDate = p_announcementData.announcement.startDisplayDate.toDate().getTime();
			announcement.endDate = p_announcementData.announcement.endDisplayDate.toDate().getTime();
			announcement.startDateFormatted = p_announcementData.announcement.startDisplayDate.toDate().getFormattedDateTime();
			announcement.courseId = p_courseId;
			announcement.courseTitle = p_courseTitle;
			
			return announcement;
		};
		
		
		
		/************************************
			Public Methods
		************************************/
		/**
			Makes a request to get user-specific announcements.
			
			@param	{String}	p_userId			The user ID to get the course list for.
			@param	{Array}		p_requestHeaders	An array of AjaxRequestHeader objects to attach to the request.
		*/
		/*
		this.getAnnouncementsByUserId = function(p_userId, p_requestHeaders)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
				
			_wmm.mark("announcements");
			_ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/userannouncements", p_requestHeaders, _announcementSuccessHandler, _announcementErrorHandler);
		};
		*/
		
		/**
			Makes a request to get user-specific announcements for the user that is currently authenticated.
				
			@param	{Array}		p_requestHeaders	An array of AjaxRequestHeader objects to attach to the request.
		*/
		
		this.getAnnouncementsForMe = function(p_requestHeaders)
		{
			VariableValidator.optional(this, p_requestHeaders, "Array");
			
			_wmm.mark("announcements");
			_ajaxManager.get(this.serviceLocation + "/me/userannouncements", p_requestHeaders, _announcementSuccessHandler, _announcementErrorHandler);
		};
	}
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific AnnouncementsServiceManager instance.
		@name		AnnouncementsServiceManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[AnnouncementsServiceManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the AnnouncementsServiceManager singleton.
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