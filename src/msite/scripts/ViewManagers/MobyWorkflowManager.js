/**
	@class
	@author		MacA
	
	@description
	<p>The MobyWorkflowManager class is a singleton that manages storing a client string.</p>
*/
var MobyWorkflowManager = (function() {
    /**
		The singleton instance of the MobyWorkflowManager class.
		@private
    */
    var _instance = null;

    /**
		The constructor function for the MobyWorkflowManager instance.
		@private
    */
    function PrivateConstructor() {
        /************************************
        Private Properties
        ************************************/

        /**
			The number of list items to display initially in each category/list group
			@type		Integer
			@default	5
			@private
        */
        var _numberOfItemsToInitiallyDisplayPerGrouping = 5;

        /**
			The maximum number of list items to show when the user clicks the "more.." link in each category/list group
			@type		Integer
			@default	10
			@private
        */
        var _maxNumberOfItemsToShowMore = 10;

        /**
			A jQuery collection of items that were hidden on the page before a view state changed
			@type	jQuery
			@private
        */
        var _hiddenElements;

        /**
			A jQuery collection of items that were visible on the page before a view state changed
			@type	jQuery
			@private
        */
        var _visibleElements;

        /**
			The current y-axis scroll position. Used for remembering the position of the page 
			when the user drills down into a detail view of an item.
			@type	Integer
			@private
        */
        var _scrollPosition = 0;
		
        /**
			Reference to the singleton that enables cross domain communication
			@type	CrossDomainInitializer
			@private
        */
        var _mobyDataManager = MobyDataManager.getInstance();

        /**
			Reference to the singleton that manages the session for the user
			@type	SessionManager
			@private
        */
        var _sessionManager = SessionManager.getInstance();

        /**
			Reference to the singleton that manages the client string for the user
			@type	ClientStringManager
			@private
        */
        var _clientStringManager = ClientStringManager.getInstance();

        /**
			Reference to the singleton that manages all of the items on the happenings page
			@type	HappeningItemManager
			@private
        */
        var _happeningItemManager = HappeningItemManager.getInstance();

        /**
			Reference to the singleton that manages all of the error messages
			@type	ErrorViewManager
			@private
        */
        var _errorViewManager = ErrorViewManager.getInstance();
        
        /**
			A reference to the ActiveTopicsViewManager.
			@type		ActiveTopicsViewManager
			@default	An instance of the ActiveTopicsViewManager
        */
        var _activeTopicsViewManager = ActiveTopicsViewManager.getInstance();

        /**
			A reference to the CourseTopicsViewManager.
			@type		CourseTopicsViewManager
			@default	An instance of the CourseTopicsViewManager
        */
        var _courseTopicsViewManager = CourseTopicsViewManager.getInstance();

        /**
			A reference to the TopicDetailViewManager.
			@type		TopicDetailViewManager
			@default	An instance of the TopicDetailViewManager
        */
        var _topicDetailViewManager = TopicDetailViewManager.getInstance();

        /**
			A reference to the ResponseDetailViewManager.
			@type		ResponseDetailViewManager
			@default	An instance of the ResponseDetailViewManager
        */
        var _responseDetailViewManager = ResponseDetailViewManager.getInstance();

        /**
			A reference to the DiscussionItemManager.
			@type		DiscussionItemManager
			@default	An instance of the DiscussionItemManager
        */
        var _discussionItemManager = DiscussionItemManager.getInstance();
        
        /**
			The the manager for the current view to the user.
			@type		Object
			@default	{}
        */
        var _managerForCurrentView = null;
        
        /**
			The history of the views that the user has visited.  This is used to support the back-button functionality.
			@type		Array
			@default	[]
        */
        var _viewHistory = [];


        /**
			The response that the user is deep linking to.
			@type		UserThreadResponse
			@default	null
        */
        var _responseToDeepLinkTo = null;

        /**
			All of the parent responses of the response that the user is deep linking to.
			@type		Array
			@default	[]
        */
        var _responseDeepLinkHierarchy = [];

        /**
			Reference to the singleton that manages the view state
			@type	ViewStateManager
			@private
        */
        var _viewStateManager = ViewStateManager.getInstance();
        
        /**
			Flag used to keep track of if the "Happenings" page was initialized.
			@type	Boolean
			@private
		*/
        var _happeningsPageInitialized = false;
        
        /**
			Flag used to keep track of if the "Discussions" page was initialized.
			@type	Boolean
			@private
		*/
        var _discussionsPageInitialized = false;
        
        var _currentViewState = ViewStateManager.VIEW_STATE_BY_DATE;
        

        /************************************
			Private Methods
        ************************************/
		
		/**
			Stops the loading of Moby data, and displays an application error message with the given text.
			@param	{String}	p_errorText		The error message to display
		*/
		var _showApplicationErrorMessage = function(p_errorText)
		{
            _errorViewManager.showApplicationErrorMessage(p_errorText);
			_instance.eventDispatcher.dispatchEvent(new MobyDataEvent(MobyDataEvent.APPLICATION_ERROR));
		};
		
        /**
			Handler for when the user click one of the three tabs (by date, by type, by course)
			to filter their view.
			@param		{Event}		p_event		The click event that occurred
			@private
        */
        var _filterTabClickHandler = function(p_event)
		{
            var viewState = $(p_event.currentTarget).attr("id").replace("Tab", "").replace("by", "").toLowerCase();
            _currentViewState = viewState;
            _viewStateManager.changeToViewState(viewState);
            _updateListsOnView(viewState);
        };
        
        /**
			Updates the lists on the specified view.
			@param	{String}	p_view		The current view state
			@private
		*/
        var _updateListsOnView = function(p_view)
        {
            var listTypes = _getListTypesFromViewState(p_view);
            
            for(var i = 0; i < listTypes.length; i++)
            {   
                //If the list type is "Course", then there is a list for each course
                if(listTypes[i] == ListViewManager.BY_COURSE)
                {
                    for(var j = 0; j < _mobyDataManager.courses.length; j++)
                    {
		                _updateList(listTypes[i], _mobyDataManager.courses[j].id);
                    }
                }
                else
                {
		            _updateList(listTypes[i]);
                }
            }
        };
		
		/**
			Updates the itesm within a given list.
			@param	{String}	p_listType		The type of the list
			@param	{String}	[p_courseId]	The course ID of the list if the list is of type "byCourse"
			@private
		*/
        var _updateList = function(p_listType, p_courseId)
        {
            var itemFilter = _getFilterFromListType(p_listType, p_courseId);
            var items = _happeningItemManager.getItems(itemFilter);
                                                                    
            var listManager = ListViewManager.getInstance(p_listType, p_courseId) 
            listManager.displayItems(items);
        };



        /**
			Handler for when the user click the "more..." link within a given list.
			@param		{Event}		p_event		The click event that occurred
			@private
        */
        var _showMoreClickHandler = function(p_event)
		{
		    var listType = $(this).data("ListType");
		    var courseId = $(this).data("CourseId");
                                                                   
            var listManager = ListViewManager.getInstance(listType, courseId); 
            listManager.increaseItemDisplayLimit();
            _updateList(listType, courseId);
        };

		
		/**
			Returns a filter function based on the list type
			@param	{String}	p_listType		The type of the list
			@param	{String}	[p_courseId]	The course ID of the list if the list is of type "byCourse"
			@private
		*/
        var _getFilterFromListType = function(p_listType, p_courseId)
        {
            var filterFunction = null;
            
            switch(p_listType)
            {
                case ListViewManager.BY_DATE_HAPPENING_SOON:
                    filterFunction = _happeningItemManager.thingsHappeningSoonFilter;
                    break;
                case ListViewManager.BY_DATE_THINGS_THAT_HAPPENED:
                    filterFunction = _happeningItemManager.thingsThatHappenedFilter;
                    break;
                case ListViewManager.BY_TYPE_ANNOUNCEMENTS:
                    filterFunction = _happeningItemManager.announcementFilter;
                    break;
                case ListViewManager.BY_TYPE_HAPPENING_SOON:
                    filterFunction = _happeningItemManager.courseItemFilter;
                    break;
                case ListViewManager.BY_TYPE_GRADES:
                    filterFunction = _happeningItemManager.gradeFilter;
                    break;
                case ListViewManager.BY_TYPE_DROPBOX:
                    filterFunction = _happeningItemManager.dropboxFilter;
                    break;
                case ListViewManager.BY_TYPE_DISCUSSIONS:
                    filterFunction = _happeningItemManager.discussionFilter;
                    break;
                case ListViewManager.BY_COURSE:
                    filterFunction = function(p_item){return (p_item.courseId == p_courseId);};
                    break;
            }
            return filterFunction;
        };
        
        
		/**
			Returns the collection of lists for a given view state
			@param	{String}	p_viewState		The current view state to get the lists for
			@private
		*/
        var _getListTypesFromViewState = function(p_viewState)
        {
            var listTypes = [];
            
            switch(p_viewState)
            {
                case ViewStateManager.VIEW_STATE_BY_DATE:
                    listTypes.push(ListViewManager.BY_DATE_HAPPENING_SOON);
                    listTypes.push(ListViewManager.BY_DATE_THINGS_THAT_HAPPENED);    
                    break;
                case ViewStateManager.VIEW_STATE_BY_TYPE:
                    listTypes.push(ListViewManager.BY_TYPE_ANNOUNCEMENTS);
                    listTypes.push(ListViewManager.BY_TYPE_HAPPENING_SOON);    
                    listTypes.push(ListViewManager.BY_TYPE_GRADES);
                    listTypes.push(ListViewManager.BY_TYPE_DROPBOX);    
                    listTypes.push(ListViewManager.BY_TYPE_DISCUSSIONS);
                    break;
                case ViewStateManager.VIEW_STATE_BY_COURSE:
                    listTypes.push(ListViewManager.BY_COURSE);
                    break;
            }
            return listTypes;
        };


        /**
			Handler for when a user changes the value of any of the drop down menus.
			The option selected by the user will filter all the items so that only items of 
			the selected type are shown and the rest are hidden.
			@param		{Event}		p_event			The change change event that occurred
        */
        var _filterChangeHandler = function(p_event)
        {
            var idToFilter = p_event.target.value;
            var filterId = $(p_event.target).attr("id");
            filterId = filterId.replace("Filter", "Container"); //replace trailing "Filter" with "Container"
            $("#" + filterId + " div.module_bgroup").show();
            if (idToFilter != "0") {
                $("#" + filterId + " div.module_bgroup:not(#" + idToFilter + ")").hide();
            }
        };
        
        /**
			The event handler that gets called when the user selects a course from the course dropdown
			@param		{event}	e	The event object
			@return		none
        */
        var _discussionsCourseSelectedHandler = function(p_event)
        {
            var courseIdToFilter = p_event.target.value; //="2021986"
            var idToFilter = "disc-course" + courseIdToFilter; //="disc-course2021986"
            $("#courseTopics div.module_bgroup").show();
            if (courseIdToFilter != "0")
            {
                $("#courseTopics .module_bgroup:not(#" + idToFilter + ")").hide();
            }
        };


        /**
			Takes a collection of course objects and creates DOM elements for each one.
			@param		{Array}		p_courses	The collection of course objects for this user
			@private
        */
        var _displayCourseList = function(p_event)
        {
			if (p_event.eventData != null)
			{
				if (p_event.eventData.length == 0)
				{
					$("#infoContainer").show();
                    $("#loginLink").live("click", _logOutClickHandler);
                }
                else
                {
					var courseTemplateElement = $("#courseContainerTemplate").children();
					var itemHeaderTemplateElement = $("#itemHeaderTemplate").children();
					var clonedCourseContainer, clonedItemHeader, itemId;
					for (var i = 0; i < p_event.eventData.length; i++) {
						clonedCourseContainer = courseTemplateElement.clone();
						itemId = "course" + p_event.eventData[i].id;
						clonedCourseContainer.attr("id", itemId);
						clonedCourseContainer.find("#courseName").html(p_event.eventData[i].title);
						clonedCourseContainer.find("#courseName").attr("id", "courseName" + p_event.eventData[i].id);
						clonedCourseContainer.find("ul").attr("title", p_event.eventData[i].title);
						clonedCourseContainer.find("#courseNameHeader .nameText").html(p_event.eventData[i].title);
						clonedCourseContainer.find("#courseNameHeader").attr("id", "courseNameHeader" + p_event.eventData[i].id);
						clonedCourseContainer.find("li.warn").each(function() {
							$(this).attr("id", $(this).attr("id") + p_event.eventData[i].id);
						});
						clonedCourseContainer.appendTo("#byCourseContainer");

						$("#byCourseFilter").append("<option value='" + itemId + "'>" + p_event.eventData[i].title + "</option>");
					}
					
					$("#contentContainer").show();
					$("#mainNav").show();
					$("#subheader").show();
					$("#logoutBtn").show();
					$("#subheaderNoTabs").hide();
				}
				$("#loadingMessageContainer").hide();
			}
			else
			{
				_instance.showGenericApplicationErrorMessage();
			}
        };
        
        
        /**
			Handler for when Announcements data is ready to be displayed.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
        var _displayAnnouncements = function(p_event)
        {
            if (p_event.eventData != null)
            {
				_wmm.mark("happenings.announcements");
				
                // create the announcement DOM elements
                _happeningItemManager.addItems(p_event.eventData, _happeningItemManager.convertAnnouncement);
                _updateListsOnView(_currentViewState);

                _wmm.measure("Moby.Announcements.UI.Rendering", "happenings.announcements");
            }
            else
            {
                _errorViewManager.showAnnouncementsErrorMessage();
            }
		};
		
		/**
			Handler for when Grades data is ready to be displayed.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayGrades = function (p_event)
		{
            if (p_event.eventData != null)
            {
				_wmm.mark("happenings.grades");

                // create the grade DOM elements
                _happeningItemManager.addItems(p_event.eventData, _happeningItemManager.convertItemGrade);
                _updateListsOnView(_currentViewState);

                _wmm.measure("Moby.Grades.UI.Rendering", "happenings.grades");
            }
            else
            {
                _errorViewManager.showGradesErrorMessage();
            }
		};
		
		/**
			Handler for when Scheduler (Due Items) data is ready to be displayed.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displaySchedulerDueItems = function (p_event)
		{
            if (p_event.eventData != null)
            {
				_wmm.mark("happenings.scheduler.dueItems");
                
                // create the shceduler DOM elements
                _happeningItemManager.addItems(p_event.eventData, _happeningItemManager.convertCourseItem);
                _updateListsOnView(_currentViewState);
                
                _wmm.measure("Moby.Scheduler.DueDates.UI.Rendering", "happenings.scheduler.dueItems");
            }
            else
            {
                _errorViewManager.showHappeningSoonErrorMessage();
            }
		};
		
		
		/**
			Handler for when Scheduler (Starting Items) data is ready to be displayed.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displaySchedulerStartItems = function (p_event)
		{
            if (p_event.eventData != null)
            {
				_wmm.mark("happenings.scheduler.startItems");
               
                // create the shceduler DOM elements
                _happeningItemManager.addItems(p_event.eventData, _happeningItemManager.convertCourseItem);
                _updateListsOnView(_currentViewState);

                _wmm.measure("Moby.Scheduler.StartDates.UI.Rendering", "happenings.scheduler.startItems");
            }
            else
            {
                _errorViewManager.showHappeningSoonErrorMessage();
            }
		};
		
		/**
			Handler for when Scheduler (Ending Items) data is ready to be displayed.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displaySchedulerEndItems = function (p_event)
		{
            if (p_event.eventData != null)
            {
				_wmm.mark("happenings.scheduler.endItems");
                
                // create the shceduler DOM elements
                _happeningItemManager.addItems(p_event.eventData, _happeningItemManager.convertCourseItem);
                _updateListsOnView(_currentViewState);

                _wmm.measure("Moby.Scheduler.EndDates.UI.Rendering", "happenings.scheduler.endItems");
            }
            else
            {
                _errorViewManager.showHappeningSoonErrorMessage();
            }
		};
		
		/**
			Handler for when Dropbox Submission data is ready to be displayed.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayDropboxSubmissions = function (p_event)
		{
			if (p_event.eventData != null)
			{
				_wmm.mark("happenings.dropbox");
                
                // create the submission DOM elements
                _happeningItemManager.addItems(p_event.eventData, _happeningItemManager.convertDropboxSubmission);
                _updateListsOnView(_currentViewState);
                
                _wmm.measure("Moby.Dropbox.UI.Rendering", "happenings.dropbox");
            }
            else
            {
                _errorViewManager.showSubmissionsErrorMessage();
            }
		};
		
		/**
			Handler for when Threads Topics data is ready to be displayed.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayUserTopics = function (p_event)
		{
            if (p_event.eventData != null)
            {
				_wmm.mark("happenings.threads.userTopics");
                
                //First we need to filter out any topics that don't have responses in the last 24 hours
                var activeTopics = [];
                for(var i = 0; i < p_event.eventData.length; i++)
                {
                    var topic = p_event.eventData[i];
                    if(topic.responseCounts.last24HourResponseCount > 0)
                    {
                        activeTopics.push(topic);
                    }
                }
                
                // create the topic DOM elements
                _happeningItemManager.addItems(activeTopics, _happeningItemManager.convertTopic);
                _updateListsOnView(_currentViewState);
                
                _wmm.measure("Moby.UserTopics.UI.Rendering", "happenings.threads.userTopics");
            }
            else {
                _errorViewManager.showRecentResponsesErrorMessage();
            }
		};
		
		
		/**
			Handler for when Threads Responses To Me data is ready to be displayed.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayResponsesToMe = function (p_event)
		{
			if (p_event.eventData != null)
			{
				_wmm.mark("happenings.threads.responsesToMe");
					
                _happeningItemManager.addItems(p_event.eventData, _happeningItemManager.convertResponse);
                _updateListsOnView(_currentViewState);
				
				_wmm.measure("Moby.ResponsesToMe.UI.Rendering", "happenings.threads.responsesToMe");
			}
			else
			{
				_errorViewManager.showResponsesToMeErrorMessage();
			}
		};
		
		
		/**
			Handler for when all "Happenings" page data has been loaded.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _happeningsDataLoadCompleteHandler = function (p_event)
		{
			_mobyDataManager.eventDispatcher.removeEventListener(MobyDataEvent.GRADES_READY, _displayGrades);
			
			_wmm.mark("happenings.containers");
            $("#contentContainer span.ajaxLoadingHeader").hide();
            
	        
            _wmm.measure("Moby.Happenings.ShowHideContainers", "happenings.containers");
            _wmm.measure("Moby.Happenings.TotalLoad", "happenings");
			
            _sessionManager.getAuthorizationHeader(function(p_authorizationHeader)
            {
                //console.log(p_authorizationHeader);
                _wmm.sendMetrics([p_authorizationHeader]);
            });
            
            _instance.eventDispatcher.dispatchEvent(new MobyDataEvent(MobyDataEvent.HAPPENINGS_LOADED));
            
		};
		
		/**
			Handler for when all "Discussions" page data has been loaded.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _discussionsDataLoadCompleteHandler = function(p_event)
		{
			_wmm.measure("Moby.Discussions.TotalLoad", "discussions");
			
			_sessionManager.getAuthorizationHeader(function(p_authorizationHeader)
            {
                //console.log(p_authorizationHeader);
                _wmm.sendMetrics([p_authorizationHeader]);
            });
            
			_instance.eventDispatcher.dispatchEvent(new MobyDataEvent(MobyDataEvent.DISCUSSIONS_LOADED));
		};
		
		
		/**
			Handler for when Course List data is ready to be displayed for the "Discussions" page.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayCourseListForDiscussionTopics = function(p_event)
		{
			if (p_event.eventData != null) {
                // if the user is not enrolled in any courses, redirect them to the "no courses" screen
                if (p_event.eventData.length == 0)
                {
					$("#discussionsInfoContainer").show();
                    $("#discussionsLoginLink").live("click", _logOutClickHandler);
                }
                else
                {
					_activeTopicsViewManager.createCoursesOnView(p_event.eventData, _allTopicsClickHandler);
					_displayView(_activeTopicsViewManager, "ActiveTopics", null);
					$("#discussionsContentContainer").show();
					$("#logoutBtnDiscussions").show();
				}
                $("#discussionsLoadingMessageContainer").hide();

            }
            else {
                _instance.showGenericApplicationErrorMessage();
            }
		};
		
		/**
			Handler for when Threads Topics data is ready to be displayed for the "Discussions" page.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayUserTopicsForDiscussionTopics = function(p_event)
		{
			if (p_event.eventData == null) {
                _showThreadsErrorMessage();

                //Add an empty array of topics to the discussion item manager so that 
                //it knows that the call for topics has completed.
                _discussionItemManager.addTopics([]);
            }
            else {
                _discussionItemManager.addTopics(p_event.eventData);
                if (_discussionItemManager.areAllItemsLoaded() == true) {
                    var items = _discussionItemManager.getDiscussionItems();

                    //Add all of the discussion items to the view
                    _activeTopicsViewManager.createDiscussionItemsOnView(items, p_event.target.courses, _topicClickHandler);
                    
                }
            }
		};
		
		/**
			Handler for when Restricted Content Item data is ready to be displayed for the "Discussions" page.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayRestrictedItemsForDiscussionTopics = function(p_event)
		{
			if (p_event.eventData == null) {
                _showCourseItemErrorMessage();

                //Add an empty array of course items to the discussion item manager so that 
                //it knows that the call for course items has completed.
                _discussionItemManager.addClosedThreads([]);
            }
            else {
                _discussionItemManager.addClosedThreads(p_event.eventData);
                if (_discussionItemManager.areAllItemsLoaded() == true) {
                    var items = _discussionItemManager.getDiscussionItems();

                    //Add all of the discussion items to the view
                    _activeTopicsViewManager.createDiscussionItemsOnView(items, p_event.target.courses, _topicClickHandler);
                    
                }
            }
		};
		
		
		/**
			Handler for when Responses to a Topic are ready to be displayed for the "Discussions" page.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayResponsesToTopic = function (p_event)
		{
			if (p_event.eventData != null)
			{
				_topicDetailViewManager.createResponsesOnView(p_event.eventData, _responseClickHandler);
			}
			else
			{
				_topicDetailViewManager.showResponsesLoadError();
			}
		};
		
		/**
			Handler for when Responses to a Response are ready to be displayed for the "Discussions" page.
			@param	{MobyDataEvent}		p_event		The MobyDataEvent that was dispatched
			@private
		*/
		var _displayResponsesToResponse = function (p_event)
		{
			if (p_event.eventData != null)
			{
				_responseDetailViewManager.createChildResponsesOnView(p_event.eventData, _responseClickHandler);
			}
			else
			{
				_responseDetailViewManager.showResponsesLoadError();
			}
		};
		
		/**
			This is the handler for when the user clicks on a topic
			@param		{Event}		p_event	The click event
			@return		{none}
        */
        var _topicClickHandler = function(p_event)
        {
            var topic = p_event.data;

            _displayView(_topicDetailViewManager, "TopicDetail", topic);
			_loadResponsesToTopic(topic);
			
        };
        
        
        /**
			Attempts to get the responses for a given topic.
			@param	{UserTopic}		p_topic		The UserTopic to get responses for
			@private
		*/
        var _loadResponsesToTopic = function(p_topic)
        {
			_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSES_TO_TOPIC_READY, _displayResponsesToTopic, true);
			_mobyDataManager.getMobyResponsesToTopic(p_topic.id);
        };
        
        /**
			Attempts to get the responses for a given response.
			@param	{UserTopic}		p_topic		The UserTopic to get responses for
			@private
		*/
        var _loadResponsesToResponse = function(p_response)
        {
			_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSES_TO_RESPONSE_READY, _displayResponsesToResponse, true);
			_mobyDataManager.getMobyResponsesToResponse(p_response.threadResponseId);
        };
        
        /**
			This is the handler for when the user clicks on a response
			@param		{Event}		p_event	The click event
			@return		{none}
			@private
        */
        var _responseClickHandler = function(p_event) {
            
            var response = p_event.data;
            _responseDetailViewManager.currentResponse = response;
            _displayView(_responseDetailViewManager, "ResponseDetail", response);
            _loadResponsesToResponse(response);
            
            if (response.markedAsRead == false)
            {
				_markResponseAsRead(response);
				var happeningItem = _happeningItemManager.removeItemById(HappeningItem.THREADRESPONSE_TYPE + "-" + response.id);
				if (happeningItem != null)
				{
					var listManagerTTH = ListViewManager.getInstance(ListViewManager.BY_DATE_THINGS_THAT_HAPPENED);
					listManagerTTH.removeItem(happeningItem);
					var listManagerDisc = ListViewManager.getInstance(ListViewManager.BY_TYPE_DISCUSSIONS);
					listManagerDisc.removeItem(happeningItem);
					var listManagerCourse = ListViewManager.getInstance(ListViewManager.BY_COURSE, response.topic.containerInfo.courseId);
					listManagerCourse.removeItem(happeningItem);
				}
			}
            
        };
        
        
        /**
			Makes an ajax call to mark the provided response as read for the current user
			@param		{UserThreadResponse}		p_response	The response to mark as read
			@return		{none}
			@private
        */
        var _markResponseAsRead = function(p_response) {
            //Make an ajax call to mark this response as read
            var postData = JSON.stringify(
			{
			    "readStatus":
				{
				    "markedAsRead": true
				}
			});
			_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSE_POST_READ_STATUS_SUCCESS, _setReadStatusHandler, true);
			_mobyDataManager.postMobyResponseReadStatus(p_response.threadResponseId, postData);
			_topicDetailViewManager.setResponseCountsText("Updating...");
			_loadReponseCountsForTopic(p_response.topic);
        };

        var _setReadStatusHandler = function(p_event) {
        };
		
		/**
			The event handler that gets called when the user clicks the 'all' link under a course
			@param		{event}	e	The event object
			@return		none
			@private
        */
        var _allTopicsClickHandler = function(e) {
            var courseId = e.data;
            _displayView(_courseTopicsViewManager, "CourseTopics", courseId);
        };
        
        /**
			Displays the appropriate view
			@param		{object}	p_viewManager	The manager for the view to show
			@param		{string}	p_viewName		The name of the view to show
			@param		{object}	p_viewData		The data required to display the view			
			@return		none
			@private
        */
        var _displayView = function(p_viewManager, p_viewName, p_viewData) {
            if (_managerForCurrentView != null && _managerForCurrentView != undefined) {
                _managerForCurrentView.hide();
            }

            _managerForCurrentView = p_viewManager;
            p_viewManager.show(p_viewData);
            
            //Add this view to the view history
            var viewInstance = new ViewInstance();
            viewInstance.viewName = p_viewName;
            viewInstance.viewData = p_viewData;
            _viewHistory.push(viewInstance);
        };
		
		
		/**
			Assigns UI event handlers to various UI elements on the "Happenings" page.
			@private
		*/
		var _initializeHappeningsViewEventHandlers = function()
		{
			$("#tabs a").live("click", _filterTabClickHandler);
			$("#contentContainer li.more").live("click", _showMoreClickHandler);
			$("#byDateFilter").live("change", _filterChangeHandler);
			$("#byTypeFilter").live("change", _filterChangeHandler);
			$("#byCourseFilter").live("change", _filterChangeHandler);
			
			$("#thingsToKnow").bind("click", _resetHappeningsView);
			$("#logoutBtn").live("click", _logOutClickHandler);
			
			$("#responsesToMeDetailResponseLink").live("click", function()
			{
				//_displayView(_activeTopicsViewManager, "ActiveTopics", null);
				
				_instance.eventDispatcher.addEventListener(MobyDataEvent.DISCUSSIONS_LOADED, function(p_event)
				{
					$("#discussionsLoadingMessageContainer").show();
					$("#discussionsContentContainer").hide();
					
					var responseLinkData = $("#responsesToMeDetailResponseLink").data();
					var happeningItem = _happeningItemManager.removeItemById(responseLinkData.happeningsItemId);
					
					var listManagerTTH = ListViewManager.getInstance(ListViewManager.BY_DATE_THINGS_THAT_HAPPENED);
					listManagerTTH.removeItem(happeningItem);
					var listManagerDisc = ListViewManager.getInstance(ListViewManager.BY_TYPE_DISCUSSIONS);
					listManagerDisc.removeItem(happeningItem);
					var listManagerCourse = ListViewManager.getInstance(ListViewManager.BY_COURSE, responseLinkData.courseId);
					listManagerCourse.removeItem(happeningItem);
	                
					createCookie("currentPage", PAGE_NAME_DISCUSSIONS, 259200);
    				$("#thingsToKnow").addClass("navNS").removeClass("navS");
    				$("#discussions").addClass("navS").removeClass("navNS");
    				$("#happeningsPage").hide();
    				$("#discussionsPage").show();
	    			
    				_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSE_BY_ID_READY, _climbResponseHierarchy, true);
					_mobyDataManager.getMobyResponseById(responseLinkData.responseId);
				}, true);
				
				_instance.initializePage(PAGE_NAME_DISCUSSIONS);
			});
			$("#recentResponsesDetailTopicLink").live("click", function()
			{
				//_displayView(_activeTopicsViewManager, "ActiveTopics", null);
				
				_instance.eventDispatcher.addEventListener(MobyDataEvent.DISCUSSIONS_LOADED, function(p_event)
				{
					$("#discussionsLoadingMessageContainer").show();
					$("#discussionsContentContainer").hide();
	                
					createCookie("currentPage", PAGE_NAME_DISCUSSIONS, 259200);
    				$("#thingsToKnow").addClass("navNS").removeClass("navS");
    				$("#discussions").addClass("navS").removeClass("navNS");
    				$("#happeningsPage").hide();
    				$("#discussionsPage").show();
	    			
    				_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_TOPIC_BY_ID_READY, _deepLinkToTopicDetailView, true);
					_mobyDataManager.getMobyTopicById($("#recentResponsesDetailTopicLink").data("topicId"));
				}, true);
					
				_instance.initializePage(PAGE_NAME_DISCUSSIONS);
				
                
			});
		};
		
		/**
			Assigns UI event handlers to various UI elements on the "Discussions" page.
			@private
		*/
		var _initializeDiscussionsViewEventHandlers = function()
		{
			$("#discussions").bind("click", _resetDiscussionsView);
			//Add an event handler for the course dropdown 
            $("#discussionsByCourseFilter").live("change", _discussionsCourseSelectedHandler);
            //Add an event handler for the back button
            $("#discussionsBackButton").live("click", _discussionsBackButtonClickedHandler);
            
            $("#logoutBtnDiscussions").live("click", _logOutClickHandler);
		};
		
		/**
			Logs a user out of the application and redirects them to the login page.
			@private
		*/
		var _logOutClickHandler = function(p_event)
		{
			_sessionManager.logOut();
			redirectToLoginPage(_instance.clientString);
		};
		
		/**
			Sends the user to the topic detail view for their initial screen.
			@param		{UserTopic}		p_topic	The topic to display on the detail screen.
			@return		{none}
			@private
        */
        var _deepLinkToTopicDetailView = function(p_event)
        {
            if (p_event.eventData != null)
            {
				_viewHistory = [];
                //Add the "Active Topics" view to the view history so that the user is sent there 
                //when they click the back button
                var viewInstance = new ViewInstance();
                viewInstance.viewName = "ActiveTopics";
                viewInstance.viewData = null;
                _viewHistory.push(viewInstance);

                _managerForCurrentView = _activeTopicsViewManager;

                //Display the topic detail view
                _displayView(_topicDetailViewManager, "TopicDetail", p_event.eventData);
                $("#discussionsLoadingMessageContainer").hide();
                $("#discussionsContentContainer").show();
                _loadResponsesToTopic(p_event.eventData);
            }
            else
            {
                _instance.showGenericApplicationErrorMessage();
            }
        };


        /**
			Recursively retrieves the parent response for a response until we've reached the top of the 
			response tree.  We need to do this so that we can recreated the view history correctly
			when deep linking to a response.
			@param		{UserThreadResponse}		p_response	The response to retrieve parent information for.
			@return		{none}
			@private
        */
        var _climbResponseHierarchy = function(p_event)
        {
            if (p_event.eventData != null)
            {
                //If this is the first response then it is the response we are deep-linking to and
                //we need to store it
                if (_responseToDeepLinkTo == null) {
                    _responseToDeepLinkTo = p_event.eventData;
                }

                //Save this response so that we can a viewHistory entry for it later
                _responseDeepLinkHierarchy.push(p_event.eventData);
				
				if (p_event.eventData.parentResponseId == "" || p_event.eventData.parentResponseId == null || p_event.eventData.parentResponseId == undefined)
				{
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_TOPIC_BY_ID_READY, _deepLinkToResponseDetailView, true);
					_mobyDataManager.getMobyTopicById(p_event.eventData.topicId);
				}
				else
				{
					// no need to add another event listener since there is already one in place
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSE_BY_ID_READY, _climbResponseHierarchy, true);
					_mobyDataManager.getMobyResponseById(p_event.eventData.parentResponseId);
				}
            }
            else {
                _instance.showGenericApplicationErrorMessage();
            }
        };

        /**
			Sends the user to the response detail view for their initial screen.
			@param		{UserThreadResponse}		p_response	The response to display on the detail screen.
			@return		{none}
			@private
        */
        var _deepLinkToResponseDetailView = function(p_event)
        {
            if (p_event.eventData != null)
            {
                _managerForCurrentView = _activeTopicsViewManager;
				_viewHistory = [];
                //Add the "Active Topics" view to the view history so that the user is sent there 
                //when they click the back button
                var viewInstance = new ViewInstance();
                viewInstance.viewName = "ActiveTopics";
                viewInstance.viewData = null;
                _viewHistory.push(viewInstance);

                //Add the topic to the view history
                viewInstance = new ViewInstance();
                viewInstance.viewName = "TopicDetail";
                viewInstance.viewData = p_event.eventData;
                _viewHistory.push(viewInstance);
				
                //Add each response except the one we're displaying to the view history
                for (var i = _responseDeepLinkHierarchy.length - 1; i > 0; i--) {
                    viewInstance = new ViewInstance();
                    viewInstance.viewName = "ResponseDetail";
                    viewInstance.viewData = _responseDeepLinkHierarchy[i];
                    _viewHistory.push(viewInstance);
                }

                //Display the response detail view
                _responseDetailViewManager.currentResponse = _responseToDeepLinkTo;
                _displayView(_responseDetailViewManager, "ResponseDetail", _responseToDeepLinkTo);
                $("#discussionsLoadingMessageContainer").hide();
                $("#discussionsContentContainer").show();
                
                _loadResponsesToResponse(_responseToDeepLinkTo);
                if (_responseToDeepLinkTo.markedAsRead == false)
				{
					_markResponseAsRead(_responseToDeepLinkTo);
				}
            }
            else
            {
                _showThreadsErrorMessage();
            }
        };
		
        
        /**
			Retrieves the first item in the discussions by course dropdown menu.
			@return	{String}	The course ID of the item
			@private
		*/
        var _courseFilterChoice = function() {
            var courseId = $("#discussionsByCourseFilter")[0].value;
            return courseId;
        };
        
        
        /**
			Updates the UI to show a Threads error message.
			@private
		*/
        var _showThreadsErrorMessage = function() {
            $("#discussionsContentContainer li.warn:has(span.topicwarn)").show();
            $("#discussionsContentContainer li.cathd span.ajaxLoadingHeader").hide();
        };

		/**
			Updates the UI to show a Course Item error message.
			@private
		*/
        var _showCourseItemErrorMessage = function() {
            $("#discussionsContentContainer li.warn:has(span.closedthreadwarn)").show();
            $("#discussionsContentContainer li.cathd span.ajaxLoadingHeader").hide();
        };
        
        /**
			The event handler that gets called when the user clicks the back button
			@param		{event}	p_event	The event object
			@return		none
			@private
        */
        var _discussionsBackButtonClickedHandler = function(p_event)
        {
            //First, clear out the current view from the history
            _viewHistory.pop();
            //Get the last view in the array, which is where we need to send the user
            viewInstance = _viewHistory.pop();
            switch (viewInstance.viewName) {
                case "ActiveTopics":
                    _displayView(_activeTopicsViewManager, "ActiveTopics", _courseFilterChoice());
                    break;

                case "CourseTopics":
                    var courseId = viewInstance.viewData;
                    _displayView(_courseTopicsViewManager, "CourseTopics", courseId);
                    break;

                case "TopicDetail":
                    var topic = viewInstance.viewData;
                    _displayView(_topicDetailViewManager, "TopicDetail", topic);
                    _loadResponsesToTopic(topic);
                    // updating response counts every time the back button is clicked. Definitely NOT ideal.
                    _topicDetailViewManager.setResponseCountsText("Updating...");
					_loadReponseCountsForTopic(topic);
                    break;

                case "ResponseDetail":
                    var response = viewInstance.viewData;
                    _displayView(_responseDetailViewManager, "ResponseDetail", response);
                    _loadResponsesToResponse(response);
                    // updating response counts every time the back button is clicked. Definitely NOT ideal.
                    _responseDetailViewManager.setResponseCountsText("Updating...");
                    _loadReponseCountsForResponse(response);
                    if (response.markedAsRead == false)
					{
						_markResponseAsRead(response);
					}
                    break;

            }
        };
        
        var _loadReponseCountsForTopic = function(p_topic)
        {
			_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSE_COUNTS_FOR_TOPIC_READY, _displayResponseCountsForTopic, true);
			_mobyDataManager.getMobyResponseCountsForTopic(p_topic.id);
		};
		
		var _loadReponseCountsForResponse = function(p_response)
        {
			_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSE_COUNTS_FOR_RESPONSE_READY, _displayResponsesCountsForResponse, true);
			_mobyDataManager.getMobyResponseCountsForResponse(p_response.threadResponseId);
		};
		
		var _displayResponseCountsForTopic = function(p_event)
		{
			if (p_event.eventData != null)
			{
				_topicDetailViewManager.updateResponseCountsOnView(p_event.eventData);
				_activeTopicsViewManager.updateResponseCountsOnView(_topicDetailViewManager.currentTopic.id, p_event.eventData);
			}
			else
			{
				_topicDetailViewManager.setResponseCountsText("Error: Unable to update the number of responses to this topic.");
			}
		};
		
		var _displayResponsesCountsForResponse = function(p_event)
		{
			if (p_event.eventData != null)
			{
				_responseDetailViewManager.updateResponseCountsOnView(p_event.eventData);	
            }
			else
			{
				_responseDetailViewManager.setResponseCountsText("Error: Unable to update the number of responses to this response.");
			}
		};
		
		/**
			Stores a new response to a topic
			@param		{string}	p_topicId				The topic that the response is being added to
			@param		{string}	p_responseTitle			The title of the response
			@param		{string}	p_responseDescription	The body of the response		
			@return		none
        */
        var _handleNewResponseToTopic = function(p_topicId, p_responseTitle, p_responseDescription) {
            _validateResponseData(p_responseTitle, p_responseDescription);

            var postData = JSON.stringify(
			{
			    "responses":
				{
				    "title": p_responseTitle,
				    "description": p_responseDescription
				}
			});
			
			_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSE_POST_TO_TOPIC_SUCCESS, _displayNewReponseToTopic, true);
			_mobyDataManager.postMobyResponseToTopic(p_topicId, postData);

        };

        /**
			Stores a new response to a response
			@param		{UserThreadResponse}	p_response				The response that the response is being added to
			@param		{string}	p_responseTitle			The title of the response
			@param		{string}	p_responseDescription	The body of the response		
			@return		none
        */
        var _handleNewResponseToResponse = function(p_response, p_responseTitle, p_responseDescription) {
            _validateResponseData(p_responseTitle, p_responseDescription);

            var postData = JSON.stringify(
			{
			    "responses":
				{
				    "title": p_responseTitle,
				    "description": p_responseDescription
				}
			});
			
			_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSE_POST_TO_RESPONSE_SUCCESS, _displayNewReponseToResponse, true);
			_mobyDataManager.postMobyResponseToResponse(p_response.threadResponseId, postData);

        };
        
        var _displayNewReponseToTopic = function(p_event)
        {
			$("form span.ajaxLoadingThread").hide();
            if (p_event.eventData != null) {
                $("#RespondConfirm").bind("click", function() {
                    $(this).hide();
                    $(this).unbind("click");
                });
                $("#RespondConfirm").show();
                $("#RespondForm").hide();
                $("#threadResponseArea").val("");
                $("#threadSubject").val("");
                _topicDetailViewManager.currentTopic.responseCounts.totalResponseCount++;
                _topicDetailViewManager.currentTopic.responseCounts.personalResponseCount++;
                _topicDetailViewManager.currentTopic.responseCounts.last24HourResponseCount++;
                _topicDetailViewManager.updateResponseCountsOnView();
                _topicDetailViewManager.addNewResponseToView(p_event.eventData, _responseClickHandler);
                setTimeout(function() {
                    $("#RespondConfirm").fadeOut(2000, function() {
                        $(this).unbind("click");
                    });
                }, 3000);
            }
            else {
                var errDiv = $("#RespondForm div.inlineError");
                errDiv.text("We were unable to post your response. Please try again and if the problem persists, contact the helpdesk.");
                errDiv.show();
            }
		};
		
		var _displayNewReponseToResponse = function(p_event)
        {
			$("form span.ajaxLoadingThread").hide();
            if (p_event.eventData != null) {
                $("#respondToResponseConfirm").bind("click", function() {
                    $(this).hide();
                    $(this).unbind("click");
                });
                $("#respondToResponseConfirm").show();
                $("#respondToResponseForm").hide();
                $("#respondToResponseArea").val("");
                $("#respondToResponseSubject").val("");
                _responseDetailViewManager.currentResponse.responseCounts.totalResponseCount++;
                _responseDetailViewManager.currentResponse.responseCounts.personalResponseCount++;
                _responseDetailViewManager.currentResponse.responseCounts.last24HourResponseCount++;
                _responseDetailViewManager.updateResponseCountsOnView();
                _responseDetailViewManager.addNewChildResponseToView(p_event.eventData, _responseClickHandler);
                setTimeout(function() {
                    $("#respondToResponseConfirm").fadeOut(2000, function() {
                        $(this).unbind("click");
                    });
                }, 3000);
            }
            else {
                var errDiv = $("#respondToResponseForm div.inlineError");
                errDiv.text("We were unable to post your response. Please try again and if the problem persists, contact the helpdesk.");
                errDiv.show();
            }
		};
        
        var _validateResponseData = function(p_responseTitle, p_responseDescription) {
            var noTitle = false;
            var noDesc = false;
            if (p_responseTitle == null || p_responseTitle == undefined || p_responseTitle == "" || typeof (p_responseTitle) != "string") {
                noTitle = true;
            }
            if (p_responseDescription == null || p_responseDescription == undefined || p_responseDescription == "" || typeof (p_responseDescription) != "string") {
                noDesc = true;
            }
            if (noTitle && noDesc) {
                throw new Error("Subject and Response Text are required.");
            }
            if (noTitle) {
                throw new Error("Subject is required.");
            }
            if (noDesc) {
                throw new Error("Response Text is required.");
            }
            if (p_responseTitle.stripHtmlTags() != p_responseTitle || p_responseDescription.stripHtmlTags() != p_responseDescription) {
                throw new Error("HTML cannot be added when posting responses from the mobile application.");
            }
        };
        
        
        var _resetDiscussionsView = function()
		{
            _displayView(_activeTopicsViewManager, "ActiveTopics", "0");
		};
		
		var _resetHappeningsView = function()
		{
			// need to reset the discussion view in case we access discussion through a deep link... hacky
			_displayView(_activeTopicsViewManager, "ActiveTopics", "0");
			
			_currentViewState = ViewStateManager.VIEW_STATE_BY_DATE;
            _viewStateManager.changeToViewState(_currentViewState);
            _updateListsOnView(_currentViewState);
		};
		
		
        
        /************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
        /**
			A reference to the current client string.
			@type	String
			@default	""
		*/
        this.clientString = "";
        
        /**
			The EventDispatcher used to listen for and dispatch events.
			@type	EventDispatcher
			@default	A new instance of EventDispatcher
		*/
        this.eventDispatcher = new EventDispatcher(this);
        
        
        /************************************
			Public Methods
        ************************************/
        
        
        /**
			Checks to see if there is an Authorization grant on the query string of the URL, and if so
			attempts to log the user in with that grant.
			@return		true if there was an authorization grant on the query string, false otherwise
		*/
        this.checkForEmailAuthGrant = function()
        {
			// check to see if the access grant is on the query string
			var emailAuthGrant = getQueryStringValue("access_grant");
			if (emailAuthGrant != undefined && emailAuthGrant != null && emailAuthGrant != "")
			{
				var clientString = getQueryStringValue("cs");
				_clientStringManager.setClientString(clientString);
				_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.AUTHORIZE_SUCCESS, function(p_event){
					window.location.href = window.location.protocol + "//" + document.domain + "/index.html";
				});
				_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.AUTHORIZE_ERROR, function(p_event){
					switch (p_event.eventData)
					{
						case "400":
							_showApplicationErrorMessage("Your access link has expired. Please request a new one by going <a href='" + window.location.protocol + "//" + document.domain + "/register.html?cs=" + clientString + "'>here</a>.")
							break;
						
						default:
							_instance.showGenericApplicationErrorMessage();
					}
				});
				_mobyDataManager.authenticateUserViaEmailGrant(emailAuthGrant);
				return true;
			}
			else
			{
				return false;
			}
        };
        
        /**
			Checks to see if the user has a cookie with an Authorization grant, and if not, redirects
			them to the login page.
		*/
        this.checkForAccessGrant = function()
        {
			VariableValidator.require(this, this.clientString, "string");
			if (!_sessionManager.hasExistingAccessGrant())
			{
				redirectToLoginPage(this.clientString);
			}
		};
        
        /**
			Starts to initialize the given page.
			@param	{String}	p_pageName	The name of the page to initialize
		*/
        this.initializePage = function(p_pageName)
        {
			VariableValidator.require(this, p_pageName, "string");
				
			if (p_pageName == PAGE_NAME_HAPPENINGS)
			{
				if (!_happeningsPageInitialized)
				{
					_wmm.mark("happenings");
					_happeningsPageInitialized = true;
					_initializeHappeningsViewEventHandlers();
					
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.COURSE_LIST_READY, _displayCourseList, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.ANNOUNCEMENTS_READY, _displayAnnouncements, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.GRADES_READY, _displayGrades);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.SCHEDULER_ITEMS_DUE_READY, _displaySchedulerDueItems, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.SCHEDULER_ITEMS_START_READY, _displaySchedulerStartItems, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.SCHEDULER_ITEMS_END_READY, _displaySchedulerEndItems, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.DROPBOX_READY, _displayDropboxSubmissions, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_USER_TOPICS_READY, _displayUserTopics, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_RESPONSES_TO_ME_READY, _displayResponsesToMe, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.COMPLETE, _happeningsDataLoadCompleteHandler, true);
					_mobyDataManager.getMobyHappeningsData();
				}
				else
				{
					this.eventDispatcher.dispatchEvent(new MobyDataEvent(MobyDataEvent.HAPPENINGS_LOADED));
				}
			}
			else if (p_pageName == PAGE_NAME_DISCUSSIONS)
			{
				if (!_discussionsPageInitialized)
				{
					_wmm.mark("discussions");
					_discussionsPageInitialized = true;
					_initializeDiscussionsViewEventHandlers();
					
					_topicDetailViewManager.initialize();
					_topicDetailViewManager.newThreadPostCallback = _handleNewResponseToTopic;

					_responseDetailViewManager.initialize();
					_responseDetailViewManager.newThreadPostCallback = _handleNewResponseToResponse;
					
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.COURSE_LIST_READY, _displayCourseListForDiscussionTopics, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.THREADS_USER_TOPICS_READY, _displayUserTopicsForDiscussionTopics, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.SCHEDULER_ITEMS_RESTRICTED_READY, _displayRestrictedItemsForDiscussionTopics, true);
					_mobyDataManager.eventDispatcher.addEventListener(MobyDataEvent.COMPLETE, _discussionsDataLoadCompleteHandler, true);
					_mobyDataManager.getMobyDiscussionsData();
				}
				else
				{
					this.eventDispatcher.dispatchEvent(new MobyDataEvent(MobyDataEvent.DISCUSSIONS_LOADED));
				}
			}
        };
        
        /**
			Shows a generic application error message.
		*/
        this.showGenericApplicationErrorMessage = function()
        {
			_showApplicationErrorMessage("Application content is not available at this time. Please try again later and if the problem persists, contact the helpdesk.");
		};
		

    }
    

    /************************************
		Public Prototype Methods
    ************************************/
    /**
		Returns information about the specific MobyWorkflowManager instance.
		@name		MobyWorkflowManager#toString
		@function
		@return		{String}	The class name
		
	*/
    PrivateConstructor.prototype.toString = function()
    {
        return "[MobyWorkflowManager]";
    }


    return new function() {
        /**
			Retrieves the instance of the MobyWorkflowManager singleton.
        */
        this.getInstance = function() {
            if (_instance == null) {
                _instance = new PrivateConstructor();
                _instance.constructor = null;
            }
            return _instance;
        };
    }

})();



