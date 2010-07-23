/**
	@class
	@author		MacA
	
	@description
	<p>The DiscussionsServiceManager class is a singleton that manages requests to the threads web service.</p>
	
	@requires	VariableValidator.js
				AjaxManager.js
*/
var DiscussionsServiceManager = (function()
{
	/**
		The singleton instance of the DiscussionsServiceManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the DiscussionsServiceManager instance.
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
			The collection of UserThreadResponse objects. UserThreadResponse are created and stored in this 
			collection after a successful ajax response.
			@default	[]
			@private
		*/
		var _userThreadResponses = [];
		
		/**
			The collection of Topic objects. Topics are created and stored in this 
			collection after a successful ajax response.
			@default	[]
			@private
		*/
		var _topics = [];

				/**
			A dictionary that maps transaction ID's to topic ids so that response counts can be put into the proper context.
			@default	{}
			@private
		*/
		var _transactionIdToTopicIdDictionary = {};


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
			A collection of Course objects that the user is enrolled in. This is used to associate a course ID and title to a ... object.
			
			@type		Array
			@default	[]
		*/
		this.courses = [];
		
		/**
			The base URL for the discussions service. Ex: "http://discussions-api.ecollege.com"
			
			@type		String
			@default	""
		*/
		this.serviceLocation = "";
		
		/************************************
			Private Methods
		************************************/
		
		/**
			Handles a successful ajax request and creates a Topic object from the JSON data returned.
			After the Topic is created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _getUserTopicByIdSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Threads.UserTopicById.Service", "threads.userTopicById");
			var userTopic = _createUserTopic(p_data.userTopics[0]);
			
			_callbacksFromTransactionIds[p_transactionId](userTopic);
		};
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _getUserTopicByIdErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.Threads.UserTopicById.Service", "threads.userTopicById");
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](null);
			}
		};

		/**
			Handles a successful ajax request and creates Topic objects from the JSON data returned.
			After the UserTopics are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _userTopicsByUserSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Threads.UserTopics.Service", "threads.userTopics");
			_userTopics = [];
			for (var i = 0; i < p_data.userTopics.length; i++)
			{
				_userTopics.push(_createUserTopic(p_data.userTopics[i]));
			}
			
			_callbacksFromTransactionIds[p_transactionId](_userTopics);
		};
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _userTopicsByUserErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.Threads.UserTopics.Service", "threads.userTopics");
			_userTopics = null;
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](_userTopics);
			}
		};

		/**
			Handles a successful ajax request for setting the read status of a response.
			@param		{Object}	p_data				The data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _setResponseReadStatusSuccessHandler = function(p_data, p_transactionId)
		{
			_callbacksFromTransactionIds[p_transactionId](null);
		};

		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _setResponseReadStatusErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](null);
			}
		};

		/**
			Handles a successful ajax request and creates UserThreadResponse objects from the JSON data returned.
			After the UserThreadResponses are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _responsesByTopicSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Threads.UserResponsesToTopic.Service", "threads.userResponsesToTopic");
			_userThreadResponses = [];
			for (var i = 0; i < p_data.userResponses.length; i++)
			{
				_userThreadResponses.push(_createUserThreadResponse(p_data.userResponses[i]));
			}
			
			_callbacksFromTransactionIds[p_transactionId](_userThreadResponses);
		};
		
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _responsesByTopicErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.Threads.UserResponsesToTopic.Service", "threads.userResponsesToTopic");
			_userThreadResponses = null;
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](_userThreadResponses);
			}
		};
		
		/**
			Handles a successful ajax request and creates UserThreadResponse objects from the JSON data returned.
			After the UserThreadResponses are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _responsesByResponseSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Threads.UserResponsesToResponse.Service", "threads.userResponsesToResponse");
			_userThreadResponses = [];
			for (var i = 0; i < p_data.userResponses.length; i++)
			{
				_userThreadResponses.push(_createUserThreadResponse(p_data.userResponses[i]));
			}
			
			_callbacksFromTransactionIds[p_transactionId](_userThreadResponses);
		};
		
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _responsesByResponseErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.Threads.UserResponsesToResponse.Service", "threads.userResponsesToResponse");
			_userThreadResponses = null;
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](_userThreadResponses);
			}
		};
		
		/**
			Handles a successful ajax request and creates UserThreadResponse objects from the JSON data returned.
			After the UserThreadResponses are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _responsesToAuthoredResponsesSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Threads.UserResponsesToMe.Service", "threads.userResponsesToMe");
			_userThreadResponses = [];
			for (var i = 0; i < p_data.userResponses.length; i++)
			{
				_userThreadResponses.push(_createUserThreadResponse(p_data.userResponses[i]));
			}
			
			_callbacksFromTransactionIds[p_transactionId](_userThreadResponses);
		};
		
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _responsesToAuthoredResponsesErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.Threads.UserResponsesToMe.Service", "threads.userResponsesToMe");
			_userThreadResponses = null;
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](_userThreadResponses);
			}
		};
				
		/**
			Handles a successful ajax request and creates a UserThreadResponse object from the JSON data returned.
			After the UserThreadResponse is created, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _userResponseByIdSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Threads.UserResponseById.Service", "threads.userResponsesById");
			var userThreadResponse = _createUserThreadResponse(p_data.userResponses[0]);
			
			_callbacksFromTransactionIds[p_transactionId](userThreadResponse);
		};
		
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _userResponseByIdErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			_wmm.measure("Moby.Threads.UserResponseById.Service", "threads.userResponsesById");
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](null);
			}
		};
				
		/**
			Handles a successful ajax request and creates a UserThreadResponse object from the JSON data returned.
			After a ThreadResponse is created, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _postResponseToTopicSuccessHandler = function(p_data, p_transactionId)
		{
			_callbacksFromTransactionIds[p_transactionId](_createThreadResponse(p_data.responses[0]));
		};
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _postResponseToTopicErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](null);
			}
		};
		
		/**
			Handles a successful ajax request and creates a UserThreadResponse object from the JSON data returned.
			After a ThreadResponse is created, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
		*/
		var _postResponseToResponseSuccessHandler = function(p_data, p_transactionId)
		{
			_callbacksFromTransactionIds[p_transactionId](_createThreadResponse(p_data.responses[0]));
		};
		
		/**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
		*/
		var _postResponseToResponseErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](null);
			}
		};
		
		
		var _getResponseCountsToTopicSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Threads.ResponseCountsTopic.Service", "threads.resopnseCountsToTopic");
			_callbacksFromTransactionIds[p_transactionId](_createResponseCounts(p_data.responseCount));
		};
		
		var _getResponseCountsToResponseSuccessHandler = function(p_data, p_transactionId)
		{
			_wmm.measure("Moby.Threads.ResponseCountsResponse.Service", "threads.resopnseCountsToResponse");
			_callbacksFromTransactionIds[p_transactionId](_createResponseCounts(p_data.responseCount));
		};
		
		var _getResponseCountsErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
			if (p_statusCode == "401")
			{
				// get new token and try again
			}
			else
			{
				_callbacksFromTransactionIds[p_transactionId](null);
			}
		};

		/**
			Creates a UserTopic object from the usertopic data returned by the web service.
			@param		{Object}				p_userTopicData		The user topic data in the form of a JSON object
			@return		{Topic}	The newly created Topic object
			@private
		*/
		var _createUserTopic = function(p_userTopicData)
		{
			var userTopic = new UserTopic();
			userTopic.id = p_userTopicData.topic.id.toString();
			userTopic.title = p_userTopicData.topic.title.stripHtmlTags();
			userTopic.description = p_userTopicData.topic.description.stripHtmlTags();
			userTopic.orderNumber = p_userTopicData.topic.orderNumber;
			userTopic.containerInfo = _createContainerInfo(p_userTopicData.topic.containerInfo);
			userTopic.responseCounts = _createResponseCounts(p_userTopicData.childResponseCounts);
			return userTopic;
		};

		/**
			Creates a ContainerInfo object from the topic data returned by the web service.
			@param		{Object} p_containerInfo		The container data for the topic in the form of a JSON object
			@return		{ContainerInfo}	The newly created ContainerInfo object
			@private
		*/
		var _createContainerInfo = function(p_containerInfo)
		{
			var containerInfo = new ContainerInfo();
			containerInfo.contentItemId = p_containerInfo.contentItemID.toString();
			containerInfo.contentItemTitle = p_containerInfo.contentItemTitle.stripHtmlTags();
			containerInfo.contentItemOrderNumber = p_containerInfo.contentItemOrderNumber;
			containerInfo.unitTitle = p_containerInfo.unitTitle.stripHtmlTags();
			containerInfo.unitNumber = p_containerInfo.unitNumber;
			containerInfo.unitHeader = p_containerInfo.unitHeader;
			containerInfo.courseId = p_containerInfo.courseID.toString();
			containerInfo.courseTitle = p_containerInfo.courseTitle.stripHtmlTags();
			return containerInfo;
		};

		/**
			Creates a ResponseCounts object from the response counts data returned by the web service.
			@param		{Object} p_responseCounts		The response counts data in the form of a JSON object
			@return		{Topic}	The newly created ResponseCounts object
			@private
		*/
		var _createResponseCounts = function(p_responseCounts)
		{
			var responseCounts = new ResponseCounts();
			responseCounts.totalResponseCount = p_responseCounts.totalResponseCount;
			responseCounts.unreadResponseCount = p_responseCounts.unreadResponseCount;
			responseCounts.last24HourResponseCount = p_responseCounts.last24HourResponseCount;
			responseCounts.personalResponseCount = p_responseCounts.personalResponseCount;
			return responseCounts;
		};

		/**
			Creates a UserThreadResponse object from the user thread response data returned by the web service.
			@param		{Object}				p_userThreadResponseData		The thread response data in the form of a JSON object
			@return		{UserThreadResponse}	The newly created UserThreadResponse object
			@private
		*/
		var _createThreadResponse = function(p_threadResponseData)
		{
			var userThreadResponse = new UserThreadResponse();
			userThreadResponse.author = _createThreadResponseAuthor(p_threadResponseData.author);
			userThreadResponse.id = userThreadResponse.author.id + "-" + p_threadResponseData.id;
			userThreadResponse.markedAsRead = true;
			userThreadResponse.threadResponseId = p_threadResponseData.id.toString();
			userThreadResponse.title = p_threadResponseData.title.stripHtmlTags();
			userThreadResponse.description = p_threadResponseData.description.stripHtmlTags();
			userThreadResponse.postedDateISO8601 = p_threadResponseData.postedDate;
			userThreadResponse.postedDate = p_threadResponseData.postedDate.toDate().getTime();
			userThreadResponse.postedDateFormatted = p_threadResponseData.postedDate.toDate().getFormattedDateTime();
			userThreadResponse.responseCounts = new ResponseCounts();
			return userThreadResponse;
		};
		
		/**
			Creates a UserThreadResponse object from the user thread response data returned by the web service.
			@param		{Object}				p_userThreadResponseData		The user thread response data in the form of a JSON object
			@return		{UserThreadResponse}	The newly created UserThreadResponse object
			@private
		*/
		var _createUserThreadResponse = function(p_userThreadResponseData)
		{
			var userThreadResponse = new UserThreadResponse();
			userThreadResponse.author = _createThreadResponseAuthor(p_userThreadResponseData.response.author);
			userThreadResponse.id = p_userThreadResponseData.id;
			userThreadResponse.markedAsRead = p_userThreadResponseData.markedAsRead;
			userThreadResponse.threadResponseId = p_userThreadResponseData.response.id.toString();
			userThreadResponse.title = p_userThreadResponseData.response.title.stripHtmlTags();
			userThreadResponse.description = p_userThreadResponseData.response.description.stripHtmlTags();
			userThreadResponse.postedDateISO8601 = p_userThreadResponseData.response.postedDate;
			userThreadResponse.postedDate = p_userThreadResponseData.response.postedDate.toDate().getTime();
			userThreadResponse.postedDateFormatted = p_userThreadResponseData.response.postedDate.toDate().getFormattedDateTime();
			if (p_userThreadResponseData.childResponseCounts != undefined)
			{
				userThreadResponse.responseCounts = _createResponseCounts(p_userThreadResponseData.childResponseCounts);
			}
            if(p_userThreadResponseData.parentUserTopic != undefined)
            {
                userThreadResponse.topicId = p_userThreadResponseData.parentUserTopic.topic.id.toString();
            }
            if(p_userThreadResponseData.parentUserResponse != undefined)
            {
                userThreadResponse.parentResponseId = p_userThreadResponseData.parentUserResponse.response.id.toString();
                userThreadResponse.parentResponseTitle = p_userThreadResponseData.parentUserResponse.response.title;
            }
			return userThreadResponse;
		};
		
		
		/**
			Creates a ThreadResponseAuthor object from the thread response author data returned by the web service.
			@param		{Object}				p_authorData		The data about the author of a response in the form of a JSON object
			@return		{ThreadResponseAuthor}	The newly created ThreadResponseAuthor object
			@private
		*/
		var _createThreadResponseAuthor = function(p_authorData)
		{
			var author = new ThreadResponseAuthor();
			author.id = p_authorData.id;
			author.firstName = p_authorData.firstName;
			author.lastName = p_authorData.lastName;
			author.email = p_authorData.email;
			return author;
		};
		
		
		/************************************
			Public Methods
		************************************/
		/**
			Makes a request to get all user topics for the provided user.
			
			@param	{String}	p_userId			The user ID to get user topics for.
			@param	{String}	p_courseList		The courses to get user topics for.
			@param	{Array}		p_requestHeaders	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. An array of UserTopic
													objects will be passed to this method when it is invoked.
		*/
		this.getUserTopicsByUserIdAndCourseList = function(p_userId, p_courseList, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_courseList, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("threads.userTopics");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/userTopics?courses=" + p_courseList, p_requestHeaders, _userTopicsByUserSuccessHandler, _userTopicsByUserErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
			
		};
		/**
			Makes a request to get a user topic by id for a specific user.
			
			@param	{String}	p_userId			The user ID to get counts for.
			@param	{String}	p_topicId			The topic ID to get counts for.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. An array of responseCounts
													objects will be passed to this method when it is invoked.
		*/
		this.getUserTopicById = function(p_userId, p_topicId, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_topicId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("threads.userTopicById");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/usertopics/" + p_userId + "-" + p_topicId, p_requestHeaders, _getUserTopicByIdSuccessHandler, _getUserTopicByIdErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;			
		};

		/**
			Makes a request to get a single user response by user id and response id.
			
			@param	{String}	p_userId			The user ID to get a response for.
			@param	{String}	p_responseId		The id of the response to retrieve.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. An array of UserThreadResponse
													objects will be passed to this method when it is invoked.
		*/
		this.getUserResponseById = function(p_userId, p_responseId, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_responseId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("threads.userResponseById");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/userresponses/" + p_userId + "-" + p_responseId, p_requestHeaders, _userResponseByIdSuccessHandler, _userResponseByIdErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
			
		};

		/**
			Makes a request to get the set of user-specific responses to a given topic.
			
			@param	{String}	p_userId			The user ID to get topic responses for.
			@param	{String}	p_topicId			The topic ID to get the responses to.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. An array of UserThreadResponse
													objects will be passed to this method when it is invoked.
		*/
		this.getUserResponsesByTopicId = function(p_userId, p_topicId, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_topicId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("threads.userResponsesToTopic");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/topics/" + p_topicId + "/userresponses", p_requestHeaders, _responsesByTopicSuccessHandler, _responsesByTopicErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
			
		};
		
		/**
			Makes a request to get the set of user-specific responses to a given response.
			
			@param	{String}	p_userId			The user ID to get responses for.
			@param	{String}	p_responseId		The response ID to get the child responses to.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. An array of UserThreadResponse
													objects will be passed to this method when it is invoked.
		*/
		this.getUserResponsesByParentResponseId = function(p_userId, p_responseId, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_responseId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("threads.userResponsesToResponse");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/responses/" + p_responseId + "/userresponses", p_requestHeaders, _responsesByResponseSuccessHandler, _responsesByResponseErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
			
		};

		
		/**
			Makes a request to get the set responses that were made directly to responses authored by the provided user.
			
			@param	{String}	p_userId			The user ID to get responses for.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. An array of UserThreadResponse
													objects will be passed to this method when it is invoked.
		*/
		this.getResponsesToAuthoredResponsesByUserId = function(p_userId, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("threads.userResponsesToMe");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/authoredResponses/userResponses?includeCounts=false&markedAsRead=false", p_requestHeaders, _responsesToAuthoredResponsesSuccessHandler, _responsesToAuthoredResponsesErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
			
		};

		/**
			Makes a request to post a discussion response by a user to a given topic.
			
			@param	{String}	p_userId			The user ID to post the response for.
			@param	{String}	p_topicId			The topic ID to post the response to.
			@param	{String}	p_data				The data to include in the post.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. The newly created UserThreadResponse
													object will be passed to this method when it is invoked.
		*/
		this.postResponseToTopic = function(p_userId, p_topicId, p_data, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_topicId, "string");
			VariableValidator.require(this, p_data, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			
			var transactionId = _ajaxManager.post(this.serviceLocation + "/users/" + p_userId + "/topics/" + p_topicId + "/responses", p_data, p_requestHeaders, _postResponseToTopicSuccessHandler, _postResponseToTopicErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
		};
		
		/**
			Makes a request to post a discussion response by a user to a given response.
			
			@param	{String}	p_userId			The user ID to post the response for.
			@param	{String}	p_responseId		The response ID to post the response to.
			@param	{String}	p_data				The data to include in the post.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. The newly created UserThreadResponse
													object will be passed to this method when it is invoked.
		*/
		this.postResponseToResponse = function(p_userId, p_responseId, p_data, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_responseId, "string");
			VariableValidator.require(this, p_data, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			
			var transactionId = _ajaxManager.post(this.serviceLocation + "/users/" + p_userId + "/responses/" + p_responseId + "/responses", p_data, p_requestHeaders, _postResponseToTopicSuccessHandler, _postResponseToTopicErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
		};

		/**
			Makes a request to post a discussion response by a user to a given topic.
			
			@param	{String}	p_userId			The user ID to post the response for.
			@param	{String}	p_responseId		The response ID to set the read status on.
			@param	{String}	p_data				The data to include in the post.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. 
		*/
		this.setResponseReadStatus = function(p_userId, p_responseId, p_data, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_responseId, "string");
			VariableValidator.require(this, p_data, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			
			var transactionId = _ajaxManager.post(this.serviceLocation + "/users/" + p_userId + "/responses/" + p_responseId + "/readStatus", p_data, p_requestHeaders, _setResponseReadStatusSuccessHandler, _setResponseReadStatusErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
		};
		
		
		/**
			Makes a request to get response counts for a given topic.
			
			@param	{String}	p_userId			The user ID to get response counts for.
			@param	{String}	p_topicId			The topic ID to get response counts for.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. 
		*/
		this.getResponseCountsToTopic = function(p_userId, p_topicId, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_topicId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("threads.resopnseCountsToTopic");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/topics/" + p_topicId + "/responseCounts", p_requestHeaders, _getResponseCountsToTopicSuccessHandler, _getResponseCountsErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
		};
		
		/**
			Makes a request to get response counts for a given response.
			
			@param	{String}	p_userId			The user ID to get response counts for.
			@param	{String}	p_responseId		The reponse ID to get response counts for.
			@param	{Array}		[p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
			@param	{Function}	[p_callback]		A method to call when the request is complete. 
		*/
		this.getResponseCountsToResponse = function(p_userId, p_responseId, p_requestHeaders, p_callback)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_responseId, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
			VariableValidator.optional(this, p_callback, "function");
			_wmm.mark("threads.resopnseCountsToResponse");
			
			var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/responses/" + p_responseId + "/responseCounts", p_requestHeaders, _getResponseCountsToResponseSuccessHandler, _getResponseCountsErrorHandler);
			_callbacksFromTransactionIds[transactionId] = p_callback;
		};

	}
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific DiscussionsServiceManager instance.
		@name		DiscussionsServiceManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[DiscussionsServiceManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the DiscussionsServiceManager singleton.
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
