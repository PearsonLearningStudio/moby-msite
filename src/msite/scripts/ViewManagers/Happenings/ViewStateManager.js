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
	<p>The ViewStateManager class is a singleton that handles changing the view to different states.</p>
*/
var ViewStateManager = (function()
{
	/**
		The singleton instance of the ViewStateManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the ViewStateManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		
		/**
			Keeps track of previous view state
			@type		String
			@default	""
			@private
		*/
		var _previousViewState = "";
		
		/**
			Keeps track of current view state
			@type		String
			@default	"date"
			@private
		*/
		var _currentViewState = ViewStateManager.VIEW_STATE_BY_DATE;
		
		/**
			Keeps track of the scroll position when the view state changes
			@type		Integer
			@default	0
			@private
		*/
		var _scrollPosition = 0;
	
		/**
			A private reference to this object
			@private
		*/
		var _viewStateManager = this;
		
		/************************************
			Private Methods
		************************************/
		
		
		
		
		/************************************
			Public Methods
		************************************/
		
		/**
			Returns the current view state
			@return {String}	The name of the view state
		*/
		this.getCurrentViewState = function()
		{
			return _currentViewState;
		};
		
		/**
			Returns the previous view state
			@return {String}	The name of the view state
		*/
		this.getPreviousViewState = function()
		{
			return _previousViewState;
		};
		
		/**
			Updates the view to display the specified view state.
			@param	{String}	p_viewState		The view state to display
		*/
		this.changeToViewState = function(p_viewState)
		{
			VariableValidator.require(this, p_viewState, "string");
			_previousViewState = _currentViewState;
			_currentViewState = p_viewState;
			switch (p_viewState)
			{
				case ViewStateManager.VIEW_STATE_BY_TYPE:
					// remove the "selected" class from the previously selected tab
					$("#tabs a.selected").removeClass("selected");
					// add the "selected" class to the newly selected tab
					$("#byTypeTab").addClass("selected");
					// hide all the containers
					$("#byDateContainer").add("#byCourseContainer").add("div[id$='DetailContainer']").add("#backButtonContainer").add("#subheaderNoTabs").hide();
					$("#byTypeContainer").add("#subheader").show();
					// set the scroll position to remembered position, need to wait 1 ms for mobile safari
					setTimeout(function(){window.scrollTo(0, _scrollPosition); _scrollPosition=0;}, 1);
					break;
				
				case ViewStateManager.VIEW_STATE_BY_DATE:
					// remove the "selected" class from the previously selected tab
					$("#tabs a.selected").removeClass("selected");
					// add the "selected" class to the newly selected tab
					$("#byDateTab").addClass("selected");
					// hide all the containers
					$("#byTypeContainer").add("#byCourseContainer").add("div[id$='DetailContainer']").add("#backButtonContainer").add("#subheaderNoTabs").hide();
					$("#byDateContainer").add("#subheader").show();
					// set the scroll position to remembered position, need to wait 1 ms for mobile safari
					setTimeout(function(){window.scrollTo(0, _scrollPosition); _scrollPosition=0;}, 1);
					break;
				
				case ViewStateManager.VIEW_STATE_BY_COURSE:
					// remove the "selected" class from the previously selected tab
					$("#tabs a.selected").removeClass("selected");
					// add the "selected" class to the newly selected tab
					$("#byCourseTab").addClass("selected");
					// hide all the containers
					$("#byTypeContainer").add("#byDateContainer").add("div[id$='DetailContainer']").add("#backButtonContainer").add("#subheaderNoTabs").hide();
					$("#byCourseContainer").add("#subheader").show();
					// set the scroll position to remembered position, need to wait 1 ms for mobile safari
					setTimeout(function(){window.scrollTo(0, _scrollPosition); _scrollPosition=0;}, 1);
					break;
				
				case ViewStateManager.VIEW_STATE_ANNOUNCEMENT_DETAIL:
					_scrollPosition = $(window).scrollTop();
					// create a collection of items that are currently hidden that will be shown for detail view
					$("#subheaderNoTabs").add("#announcementDetailContainer").add("#backButtonContainer").show();
					// create a collection of items that are currently visible that will be hidden for detail view
					$("#subheader").add("#byTypeContainer").add("#byDateContainer").add("#byCourseContainer").hide();
					break;
				
				case ViewStateManager.VIEW_STATE_DROPBOX_DETAIL:
					_scrollPosition = $(window).scrollTop();
					// create a collection of items that are currently hidden that will be shown for detail view
					$("#subheaderNoTabs").add("#dropboxSubmissionDetailContainer").add("#backButtonContainer").show();
					// create a collection of items that are currently visible that will be hidden for detail view
					$("#subheader").add("#byTypeContainer").add("#byDateContainer").add("#byCourseContainer").hide();
					break;
				
				case ViewStateManager.VIEW_STATE_GRADE_DETAIL:
					_scrollPosition = $(window).scrollTop();
					// create a collection of items that are currently hidden that will be shown for detail view
					$("#subheaderNoTabs").add("#gradeDetailContainer").add("#backButtonContainer").show();
					// create a collection of items that are currently visible that will be hidden for detail view
					$("#subheader").add("#byTypeContainer").add("#byDateContainer").add("#byCourseContainer").hide();
					break;
				
				case ViewStateManager.VIEW_STATE_RECENT_RESPONSE_DETAIL:
					_scrollPosition = $(window).scrollTop();
					// create a collection of items that are currently hidden that will be shown for detail view
					$("#subheaderNoTabs").add("#recentResponsesDetailContainer").add("#backButtonContainer").show();
					// create a collection of items that are currently visible that will be hidden for detail view
					$("#subheader").add("#byTypeContainer").add("#byDateContainer").add("#byCourseContainer").hide();
					break;
				
				case ViewStateManager.VIEW_STATE_RESPONSE_TO_MY_RESPONSE_DETAIL:
					_scrollPosition = $(window).scrollTop();
					// create a collection of items that are currently hidden that will be shown for detail view
					$("#subheaderNoTabs").add("#responsesToMeDetailContainer").add("#backButtonContainer").show();
					// create a collection of items that are currently visible that will be hidden for detail view
					$("#subheader").add("#byTypeContainer").add("#byDateContainer").add("#byCourseContainer").hide();
					break;
				
				case ViewStateManager.VIEW_STATE_SCHEDULER_DETAIL:
					_scrollPosition = $(window).scrollTop();
					// create a collection of items that are currently hidden that will be shown for detail view
					$("#subheaderNoTabs").add("#happeningSoonDetailContainer").add("#backButtonContainer").show();
					// create a collection of items that are currently visible that will be hidden for detail view
					$("#subheader").add("#byTypeContainer").add("#byDateContainer").add("#byCourseContainer").hide();
					break;
				
				default:
					throw new Error("Unrecognized view state: " + p_viewState);
			}
		};
		
	}	
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific ViewStateManager instance.
		@name		ViewStateManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[ViewStateManager]";
	}
	
	
	return new function()
	{
		/**
			Retrieves the instance of the ViewStateManager singleton.
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

/************************************
	Static Properties
************************************/

/**
	Defines the View State of "type".
	@static
	@type	String
	@default	"type"
*/
ViewStateManager.VIEW_STATE_BY_TYPE = "type";

/**
	Defines the View State of "date".
	@static
	@type	String
	@default	"date"
*/
ViewStateManager.VIEW_STATE_BY_DATE = "date";

/**
	Defines the View State of "course".
	@static
	@type	String
	@default	"course"
*/
ViewStateManager.VIEW_STATE_BY_COURSE = "course";

/**
	Defines the View State of "announcementDetail".
	@static
	@type	String
	@default	"announcementDetail"
*/
ViewStateManager.VIEW_STATE_ANNOUNCEMENT_DETAIL = "announcementDetail";

/**
	Defines the View State of "schedulerDetail".
	@static
	@type	String
	@default	"schedulerDetail"
*/
ViewStateManager.VIEW_STATE_SCHEDULER_DETAIL = "schedulerDetail";

/**
	Defines the View State of "dropboxDetail".
	@static
	@type	String
	@default	"dropboxDetail"
*/
ViewStateManager.VIEW_STATE_DROPBOX_DETAIL = "dropboxDetail";

/**
	Defines the View State of "gradeDetail".
	@static
	@type	String
	@default	"gradeDetail"
*/
ViewStateManager.VIEW_STATE_GRADE_DETAIL = "gradeDetail";

/**
	Defines the View State of "recentResponseDetail".
	@static
	@type	String
	@default	"recentResponseDetail"
*/
ViewStateManager.VIEW_STATE_RECENT_RESPONSE_DETAIL = "recentResponseDetail";

/**
	Defines the View State of "responseToMyResponseDetail".
	@static
	@type	String
	@default	"responseToMyResponseDetail"
*/
ViewStateManager.VIEW_STATE_RESPONSE_TO_MY_RESPONSE_DETAIL = "responseToMyResponseDetail";