/**
	@class
	@author		TimS
	
	@description
	<p>The ErrorViewManager class is a singleton that handles displaying error messages on the Happenings views. This class is currently very tightly coupled to the view. 
	Changes to class names or ID's on the view may cause this class to stop functioning properly.</p>
*/
var ErrorViewManager = (function()
{
	/**
		The singleton instance of the ErrorViewManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the ErrorViewManager instance.
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
		var _errorViewManager = this;
		
		
		/************************************
			Public Methods
		************************************/
				
		this.showApplicationErrorMessage = function(p_errorText)
		{
			$("#errorContainer div.errorMessage").html(p_errorText);
			$("#discussionsErrorContainer div.errorMessage").html(p_errorText);
			$("#errorContainer").show();
			$("#discussionsErrorContainer").show();
			$("#loadingMessageContainer").hide();
			$("#discussionsLoadingMessageContainer").hide();
			$("#contentContainer").hide();
			$("#discussionsContentContainer").hide();
		};

		/**
			Unhides the warning DOM elements for announcements.
		*/
		this.showAnnouncementsErrorMessage = function()
		{
			$("#announcementsByDateWarning").show();
			$("#announcementsByTypeWarning").show();
			$("li[id^='announcementsByCourseWarning']").show();
		};
		
		/**
			Unhides the warning DOM elements for dropbox submissions.
		*/
		this.showSubmissionsErrorMessage = function()
		{
			$("#dropboxByDateWarning").show();
			$("#dropboxByTypeWarning").show();
			$("li[id^='dropboxByCourseWarning']").show();
		};

        /**
            Unhides the warning DOM elements for grades.
        */
        this.showGradesErrorMessage = function()
        {
            $("#gradesByDateWarning").show();
            $("#gradesByTypeWarning").show();
            $("li[id^='gradesByCourseWarning']").show();
        };

        /**
        Unhides the warning DOM elements for scheduled items.
        */
        this.showHappeningSoonErrorMessage = function()
        {
            $("#happeningSoonByDateWarning").show();
            $("#happeningSoonByTypeWarning").show();
            $("li[id^='happeningSoonByCourseWarning']").show();
        };

		/**
			Unhides the warning DOM elements for recent responses.
		*/
		this.showRecentResponsesErrorMessage = function()
		{
			$("#recentResponsesByDateWarning").show();
			$("#recentResponsesByTypeWarning").show();
			$("li[id^='recentResponsesByCourseWarning']").show();
		};

		/**
			Unhides the warning DOM elements for responses to me.
		*/
		this.showResponsesToMeErrorMessage = function()
		{
			$("#responsesToMeByDateWarning").show();
			$("#responsesToMeByTypeWarning").show();
			$("li[id^='responsesToMeByCourseWarning']").show();
		};
	}	
	
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific ErrorViewManager instance.
		@name		ErrorViewManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[ErrorViewManager]";
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
