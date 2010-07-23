/**
	@class
	@author		TimS
	
	@description
	<p>The DetailViewManager class is a singleton that handles dynamically generating 
	the detail view (HTML) for happening items. This class is currently very tightly coupled to the view. 
	Changes to class names or ID's on the view may cause this class to stop functioning properly.</p>
*/
var DetailViewManager = (function()
{
	/**
		The singleton instance of the AnnouncementsViewManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the DetailViewManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		
		/**
			A private reference to this object
			@private
		*/
		var _detailViewManager = this;
		
		var _backButtonInitialized = false;
		
		/**
			A reference to the ViewStateManager instance which controls the view state of the Happenings Page.
			@private
		*/
		var _viewStateManager = ViewStateManager.getInstance();

		/************************************
			Public Properties
		************************************/
		
        
		/************************************
			Private Methods
		************************************/
		
		/**
			Updates the Announcement Detail DOM elements with data from the given UserAnnouncement object.
			@param		{UserAnnouncement}	p_announcement	The UserAnnouncement to show the deatils of on the page.
		*/
		var _updateAnnouncementDetailView = function(p_announcement)
		{
			$("#announcementDetailTemplate").find("ul").attr("title", p_announcement.subject);
			$("#announcementDetailSubject").html(p_announcement.subject);
			$("#announcementDetailSubmitter").html(p_announcement.submitter);
			$("#announcementDetailText").html(p_announcement.text);
			$("#announcementDetailCourseName").html(p_announcement.courseTitle);
			$("#announcementDetailDate").html(p_announcement.startDateFormatted);
			
			_viewStateManager.changeToViewState(ViewStateManager.VIEW_STATE_ANNOUNCEMENT_DETAIL);
		};

 		/**
			Updates the Dropbox Submission Detail DOM elements with data from the given DropboxSubmission object.
			@param		{DropboxSubmission}	p_submission	The DropboxSubmission to show the deatils of on the page.
		*/
		var _updateSubmissionDetailView = function(p_submission)
		{
		    $("#dropboxSubmissionDetailSubmitter").html(p_submission.submitterNameFormatted);
		    $("#dropboxSubmissionDetailBasketTitle").html(p_submission.basketTitle);
		    $("#dropboxSubmissionDetailComments").html(p_submission.comments);
		    $("#dropboxSubmissionDetailCourseTitle").html(p_submission.courseTitle);
		    $("#dropboxSubmissionDetailSubmissionDate").html(p_submission.submissionDateFormatted);

			_viewStateManager.changeToViewState(ViewStateManager.VIEW_STATE_DROPBOX_DETAIL);
		};

        /**
            Updates the Grade Detail DOM elements with data from the given ItemGrade object.
            @param      {ItemGrade}   p_itemGrade         The ItemGrade to show the details of on the page.
        */
        var _updateGradeDetailView = function(p_itemGrade) {
            $("#gradeDetailTemplate").find("ul").attr("title", "Grade - " + p_itemGrade.title);
            $("#gradeDetailTypeName").html("Grade");
            $("#gradeDetailSubject").html(p_itemGrade.title);
            if (p_itemGrade.letterGrade.isNullOrEmpty())
                $("#gradeDetailLetterGrade").html("");
            else
                $("#gradeDetailLetterGrade").html("Letter Grade: " + p_itemGrade.letterGrade + "<br/>");
            if (p_itemGrade.numericGrade.isNullOrEmpty())
                $("#gradeDetailNumericGrade").html("");
            else
                $("#gradeDetailNumericGrade").html("Numeric Grade: " + p_itemGrade.numericGrade + "<br/>");
            $("#gradeDetailComments").html("Comments:<br/>" + p_itemGrade.comments);
            $("#gradeDetailCourseName").html(p_itemGrade.courseTitle);
            $("#gradeDetailDate").html(p_itemGrade.updatedDateFormatted);

            _viewStateManager.changeToViewState(ViewStateManager.VIEW_STATE_GRADE_DETAIL);
        };

        /**
        Updates the Announcement Detail DOM elements with data from the given UserAnnouncement object.
        @param		{UserAnnouncement}	p_announcement	The UserAnnouncement to show the deatils of on the page.
        */
        var _updateCourseItemDetailView = function(p_courseItem)
        {
            var unitTitle = "";
            var title = "";
            unitTitle = p_courseItem.parentTitle;
            title = unitTitle + " - " + p_courseItem.title;
            if (p_courseItem.id == p_courseItem.parentId)   //if this is a unit don't display the title twice (e.g. title - title)
            {
                title = p_courseItem.title;
            }
            $("#announcementDetailTemplate").find("ul").attr("title", p_courseItem.title);
            $("#happeningSoonDetailTitle").html(title);
            $("#happeningSoonDetailFormattedDate").html(p_courseItem.scheduledEventType + " " + p_courseItem.scheduledDateFormatted);

            if (p_courseItem.startDate != 0)
            {
                var start = new Date(p_courseItem.startDate);
                $("#happeningSoonStartDateDetail").html("Start: " + start.formatDate("MMM dd, yyyy")); //_formatDate(start,"MMM dd, yyyy hh:mm:ssa"));
                $("#happeningSoonStartDateDetail").show();
            }
            else
            {
                $("#happeningSoonStartDateDetail").hide();
            }
            if (p_courseItem.endDate != 0)
            {
                var end = new Date(p_courseItem.endDate);
                $("#happeningSoonEndDateDetail").html("End: " + end.formatDate("MMM dd, yyyy"));
                $("#happeningSoonEndDateDetail").show();
            }
            else
            {
                $("#happeningSoonEndDateDetail").hide();
            }
            if (p_courseItem.dueDate != 0)
            {
                var due = new Date(p_courseItem.dueDate);
                $("#happeningSoonDueDateDetail").html("Due: " + due.formatDate("MMM dd, yyyy"));
                $("#happeningSoonDueDateDetail").show();
            }
            else
            {
                $("#happeningSoonDueDateDetail").hide();
            }

            $("#happeningSoonDetailCourseName").html(p_courseItem.courseTitle);
            
            _viewStateManager.changeToViewState(ViewStateManager.VIEW_STATE_SCHEDULER_DETAIL);
        };

		/**
			Updates the Announcement Detail DOM elements with data from the given UserAnnouncement object.
			@param		{UserAnnouncement}	p_announcement	The UserAnnouncement to show the deatils of on the page.
		*/
		var _updateTopicDetailView = function(p_userTopic)
		{
		    var recentResponseCount = p_userTopic.responseCounts.last24HourResponseCount;
		
		    var responseCountDescription;
		    if(recentResponseCount == 1)
		    {
		        responseCountDescription = "1 response has been posted in the past 24 hours.";
		    }
		    else
		    {
		        responseCountDescription = recentResponseCount + " responses have been posted in the past 24 hours.";
		    }
		    
		    $("#recentResponsesDetailCount").html(recentResponseCount);
		    $("#recentResponsesDetailTitle").html(p_userTopic.containerInfo.contentItemTitle + " - " + p_userTopic.title);
		    $("#recentResponsesDetailCountDescription").html(responseCountDescription);
		    $("#recentResponsesDetailTopicLink").html("Go to " + p_userTopic.title);
		    $("#recentResponsesDetailTopicLink").data("topicId", p_userTopic.id);
		    $("#recentResponsesDetailCourseTitle").html(p_userTopic.containerInfo.courseTitle);
		    $("#recentResponsesDetailTime").html((new Date()).getFormattedTime());

			_viewStateManager.changeToViewState(ViewStateManager.VIEW_STATE_RECENT_RESPONSE_DETAIL);
		};

		/**
			Updates the Response Detail DOM elements with data from the given UserThreadResponse object.
			@param		{UserThreadResponse}	p_response	The UserThreadResponse to show the deatils of on the page.
		*/
		var _updateResponseDetailView = function(p_response)
		{
		    $("#responsesToMeDetailTitle").html(p_response.topic.containerInfo.contentItemTitle + " - " + p_response.topic.title);
		    $("#responsesToMeDetailAuthor").html(p_response.author.firstName + " " + p_response.author.lastName);
		    $("#responsesToMeDetailParentSubject").html(p_response.parentResponseTitle);
		    $("#responsesToMeDetailResponseLink").html("Go to " + p_response.topic.title);
		    $("#responsesToMeDetailResponseLink").data({
				"responseId": p_response.threadResponseId,
				"courseId": p_response.topic.containerInfo.courseId,
				"happeningsItemId": HappeningItem.THREADRESPONSE_TYPE + "-" + p_response.id
			});
			$("#responsesToMeDetailCourseTitle").html(p_response.topic.containerInfo.courseTitle);
		    $("#responsesToMeDetailDate").html(p_response.postedDateFormatted);

			_viewStateManager.changeToViewState(ViewStateManager.VIEW_STATE_RESPONSE_TO_MY_RESPONSE_DETAIL);
		};

        var _getUpdateDetailViewFunctionForItem = function(p_item)
        {
            switch(p_item.type)
            {
                case HappeningItem.ANNOUNCEMENT_TYPE:
                    return _updateAnnouncementDetailView;
                    break;
                case HappeningItem.DROPBOX_TYPE:
                    return _updateSubmissionDetailView;
                    break;
                case HappeningItem.GRADE_TYPE:
                    return _updateGradeDetailView;
                    break;
                case HappeningItem.COURSEITEM_TYPE:
                    return _updateCourseItemDetailView;
                    break;
                case HappeningItem.THREADTOPIC_TYPE:
                    return _updateTopicDetailView;
                    break;
                case HappeningItem.THREADRESPONSE_TYPE:
                    return _updateResponseDetailView;
                    break;
            }
        };
        
        var _backButtonClickHandler = function()
        {
			_viewStateManager.changeToViewState(_viewStateManager.getPreviousViewState());
        };
		
		/************************************
			Public Methods
		************************************/
				
		this.displayDetailView = function(p_item)
		{
			if (!_backButtonInitialized)
			{
				_backButtonInitialized = true;
				$("#backButton").bind("click", _backButtonClickHandler);
			}
				
	        var updateDetailFunction = _getUpdateDetailViewFunctionForItem(p_item);
		    updateDetailFunction(p_item.domainObject);
		};
		
	}	
	
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific DetailViewManager instance.
		@name		DetailViewManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[DetailViewManager]";
	}
	
	
	return new function()
	{
		/**
			Retrieves the instance of the AnnouncementsViewManager singleton.
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
