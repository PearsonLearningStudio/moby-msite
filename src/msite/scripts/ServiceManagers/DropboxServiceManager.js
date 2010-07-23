/**
	@class
	@author		TimS
	
	@description
	<p>The DropboxServiceManager class is a singleton that manages requests to the dropbox web service.</p>
	
	@requires	VariableValidator.js
				AjaxManager.js
*/
var DropboxServiceManager = (function()
{
	/**
		The singleton instance of the DropboxServiceManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the DropboxServiceManager instance.
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
			A dictionary that maps transaction ID's to callback functions that need to be called when the request is complete.
			@default	{}
			@private
		*/
		var _callbacksFromTransactionIds = {};
		
		
		
		
		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
						
        /**
			The base URL for the dropbox service. Ex: "http://dropbox-api.ecollege.com"
			
			@type		String
			@default	""
		*/
		this.serviceLocation = "";
		
        /**
            A collection of Course objects that the user is enrolled in. This is used to associate a course ID and title to an ItemGrade object.
			
			@type		Array
            @default	[]
        */
        this.courses = [];

		/************************************
			Private Methods
		************************************/
		
		/**
			Handles a successful ajax request and creates Topic objects from the JSON data returned.
			After the Topics are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _submissionsByUserSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Dropbox.Service", "dropbox");
			var _submissions = [];
			
			//The service call will return an array of basket objects.  Each basket object contains
			//an array of user basket objects.  Each user basket object contains an array of 
			//submission objects.  We only want to grab the last submission in each user basket.
			for (var i = 0; i < p_data.baskets.length; i++)
			{
			    var currentBasket = p_data.baskets[i];
			    
			    for (var j = 0; j < currentBasket.userBaskets.length; j++)
			    {
			        var currentUserBasket = currentBasket.userBaskets[j];
			        
			        if(currentUserBasket.view == "Inbox" && currentUserBasket.submissions.length > 0)
			        {
			            //We need to find the submission with the latest submission date
			            var latestSubmission = _getLatestSubmission(currentUserBasket.submissions);
			            
			            _submissions.push(_createSubmission(currentBasket, latestSubmission));
			        }
			    }
			}
			
			_callbacksFromTransactionIds[p_transactionId](_submissions);
		};
		
		
		/**
			Finds the submission object with the latest submission date in an array of submission objects
			@param		{Array}				p_submissions	An array of JSON objects representing submissions
			@return		{Submission}	    The submission with the latest submission date
			@private
		*/
		var _getLatestSubmission = function(p_submissions)
		{
            var latestSubmission = p_submissions[0];
            for (var k = 0; k < p_submissions.length; k++)
            {
                if(p_submissions[k].submissionDate > latestSubmission.submissionDate)
                {
                    latestSubmission = p_submissions[k];
                }
            }
            
            return latestSubmission;
		}
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _submissionsByUserErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.Dropbox.Service", "dropbox");
			_submissions = null;
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](_submissions);
			}
		};
		
		/**
			Creates a DropboxSubmission object from the submission data returned by the web service.
			@param		{Object}				p_basketData		The basket data in the form of a JSON object
			@param		{Object}				p_submissionData	The submission data in the form of a JSON object
			@return		{Topic}	The newly created DropboxSubmission object
			@private
		*/
		var _createSubmission = function(p_basketData, p_submissionData)
		{
			var submission = new DropboxSubmission();
			submission.id = p_submissionData.id.toString();
			submission.submitterNameFormatted = p_submissionData.submitter;
			submission.submissionDateISO8601 = p_submissionData.submissionDate;
			submission.submissionDate = p_submissionData.submissionDate.toDate();
			submission.submissionDateFormatted = p_submissionData.submissionDate.toDate().getFormattedDateTime();
			submission.comments = p_submissionData.comments.stripHtmlTags();
			submission.basketTitle = p_basketData.title;
			
			//Find the course id in the "basketScopes" array
			for(var i = 0; i < p_basketData.basketScopes.length; i++)
			{
			    var scope = p_basketData.basketScopes[i];
			    if(scope.scopeTargetType = "course")
			    {
			        submission.courseId = scope.scopeTargetId.toString();
			        break;
			    }
			}
			
			//Find the title of the course
			for(var i = 0; i < _instance.courses.length; i++)
			{
			    if(_instance.courses[i].id == submission.courseId)
			    {
			        submission.courseTitle = _instance.courses[i].title;
			        break;
			    }
			}

			return submission;
		};

		
		/************************************
			Public Methods
		************************************/
		/**
			Makes a request to get all dropbox submissions for the provided user.
			
			@param	{String}	p_userId			The user ID to get submissions for.
			@param	{String}	p_courseIds		    The semi-colon list of course ids to get submissions for.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. An array of UserTopic
													objects will be passed to this method when it is invoked.
		*/
		this.getSubmissionsByUserIdAndCourseIds = function(p_userId, p_courseIds, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_courseIds, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("dropbox");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/baskets/submissions?view=inbox&courses=" + p_courseIds, p_requestHeaders, _submissionsByUserSuccessHandler, _submissionsByUserErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
			
		};

	}
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific DropboxServiceManager instance.
		@name		DropboxServiceManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[DropboxServiceManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the DropboxServiceManager singleton.
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
