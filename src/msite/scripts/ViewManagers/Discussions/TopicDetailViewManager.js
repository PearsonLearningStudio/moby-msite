/**
	@class
	@author		MacA
	
	@description
	<p>The TopicDetailViewManager class is a singleton that manages requests to the threads API.</p>
*/
var TopicDetailViewManager = (function()
{
	/**
		The singleton instance of the TopicDetailViewManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the TopicDetailViewManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		
		/**
			A jQuery object that represents the collection of all responses to a topic DOM elements that 
			were created by the TopicDetailViewManager.
			@type		jQuery
			@default	$()
		*/
		var _responsesByTopicCollection = $();
		
		
		
		/************************************
			Private Methods
		************************************/

		/**
			Creates a clone of the list item template to be used as a thread response item.
			@param		{UserAnnouncement}	p_userThreadResponse	The UserThreadResponse to show the deatils of on the page.
			@return		{jQuery}			The jQuery object representing the new clone, with the thread response data.
		*/
		var _createReponseElementClone = function(p_userThreadResponse)
		{
			var clonedItem = $("#responseItemTemplate").children().clone();
			clonedItem.attr("id", "response" + p_userThreadResponse.id);
			clonedItem.find(".subject").html(p_userThreadResponse.title);
			clonedItem.find(".replytext").html(p_userThreadResponse.description);
			clonedItem.find(".nameText").html(p_userThreadResponse.author.firstName + " " + p_userThreadResponse.author.lastName);
			clonedItem.find(".date").html(p_userThreadResponse.postedDateFormatted);
			var responsesText;
			if (p_userThreadResponse.responseCounts != null)
			{
				if (p_userThreadResponse.responseCounts.totalResponseCount == 1)
				{
					responsesText = " Response";
				}
				else
				{
					responsesText = " Responses";
				}
				responsesText = p_userThreadResponse.responseCounts.totalResponseCount + responsesText + " (" + p_userThreadResponse.responseCounts.unreadResponseCount + " Unread)"
				if (p_userThreadResponse.responseCounts.unreadResponseCount > 0)
				{
					clonedItem.find("span.replies").addClass("repliesunread").removeClass("replies");
				}
			}
			else
			{
				responsesText = "0 Responses (0 Unread)";
			}
			clonedItem.find("span.replies, span.repliesunread").html(responsesText);
			
			if (!p_userThreadResponse.markedAsRead)
			{
				clonedItem.addClass("reply").removeClass("replyread");
			}
			_responsesByTopicCollection = _responsesByTopicCollection.add(clonedItem);
			return clonedItem;
		};
		
		var _respondToggle = function()
		{
		    _hideRespondError();
			$("#RespondForm").toggle();
		}
		
		var _respondClear = function()
		{
		    $("#threadSubject").val("");
			$("#threadResponseArea").val();
		    _hideRespondError();		
		}
		
		var _respondClose = function()
		{
			$("#RespondForm").hide();
		}
		
		var _respondCancel = function()
		{
			_respondClose();
			_respondClear();
		}
		
		var _respondSubmit = function()
		{
			$("form span.ajaxLoadingThread").show();
			try
			{
				_instance.newThreadPostCallback(_instance.currentTopic.id, $("#threadSubject").val(), $("#threadResponseArea").val());
	        }
	        catch(e)
	        {
	            $("form span.ajaxLoadingThread").hide();
	            _showRespondError(e.message);
	        }
        }

        var _showRespondError = function(p_errorMessage)
        {
            var errDiv = $("#RespondForm div.inlineError");
            errDiv.text(p_errorMessage);
            errDiv.show();
        };
        
        var _hideRespondError = function()
        {
            var errDiv = $("#RespondForm div.inlineError");
            errDiv.text("");
            errDiv.hide();
        };
        
        var _updateResponseCountsOnView = function(p_responseCounts)
        {
			//Update the DOM for this Topic
			var responseText = "";
			if (p_responseCounts.totalResponseCount == 1)
			{
				responseText = " Response";
			}
			else
			{
				responseText = " Responses";
			}
			responseText = p_responseCounts.totalResponseCount + responseText + " (" + p_responseCounts.unreadResponseCount + " Unread)";
			var repliesElement = $("#responsesByTopic li.post span.replies, #responsesByTopic li.post span.repliesunread");
			repliesElement.html(responseText);
			if (p_responseCounts.unreadResponseCount > 0)
			    repliesElement.removeClass('replies').addClass('repliesunread');
			else
			    repliesElement.removeClass('repliesunread').addClass('replies');
		};
		

		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
		
		/**
			 The callback to call when a new thread post has been submitted.
			 @type		String
			 @default	null
		*/
		this.newThreadPostCallback = null;
		
		/**
			 The currently selected topic. If no topic is selected, this is null.
			 @type		UserTopic
			 @default	null
		*/
		this.currentTopic = null;

	
		/************************************
			Public Methods
		************************************/
		
		/**
			Handles any initialization needed by the view manager, such as wiring up event handlers
			@return		none
		*/
		this.initialize = function()
		{
            $("#RespondLink").bind("click", _respondToggle);
			$("#cancelBtn").bind("click", _respondCancel);
			$("#respondBtn").bind("click", _respondSubmit);
		};		

		this.createResponsesOnView = function(p_userThreadResponses, p_responseClickHandler)
		{		
			//Hide the loading image
			$("#topicDetailLoadingResponses").hide();

			for (var i = 0; i < p_userThreadResponses.length; i++)
			{
				var clonedItem = _createReponseElementClone(p_userThreadResponses[i]);
				clonedItem.find("a").bind("click", p_userThreadResponses[i], p_responseClickHandler);
				clonedItem.appendTo("#responsesByTopic ul");
			}
		};
		
		this.addNewResponseToView = function(p_userThreadResponse, p_responseClickHandler)
		{
			var clonedItem = _createReponseElementClone(p_userThreadResponse);
			clonedItem.find("a").bind("click", p_userThreadResponse, p_responseClickHandler);
			clonedItem.insertAfter("#responsesByTopic ul li.post");
		};

		
		this.show = function(p_topic)
		{
		    this.currentTopic = p_topic;
		
		    //Remove previously displayed messages
		    $("#RespondConfirm").hide();
		
			//Remove any previously displayed responses
			_instance.removeAllResponsesToTopicFromView();
			
			//Cancel any previously begun responses
			_respondCancel();

			//Update the DOM for this Topic
			$("#responsesByTopic li.cathd_discussion").html(p_topic.title);
			$("#responsesByTopic span#topicDescription").html(p_topic.description);
			
			_updateResponseCountsOnView(p_topic.responseCounts);

			//Show the loading image
			$("#topicDetailLoadingResponses").show();
			
			$("#topicDetailWarningMessage").hide();

			//Display the topic responses div
			$("#responsesByTopic").show();
		};
		
		this.hide = function()
		{
			//Hide the topic responses div
			$("#responsesByTopic").hide();
		};
		
		/**
			Removes all the responses to a topic DOM elements from the view that were created by 
			the TopicDetailViewManager.
		*/
		this.removeAllResponsesToTopicFromView = function()
		{
			_responsesByTopicCollection.remove();
			_responsesByTopicCollection = $();
		};
		
		this.updateResponseCountsOnView = function(p_responseCounts)
		{
			if (p_responseCounts != undefined && p_responseCounts != null)
			{
				this.currentTopic.responseCounts = p_responseCounts;
			}
			_updateResponseCountsOnView(this.currentTopic.responseCounts);
			
		};
		
		this.setResponseCountsText = function(p_text)
		{
			$("#responsesByTopic span.replies, #responsesByTopic span.repliesunread").html(p_text);
		};
		
		this.showResponsesLoadError = function()
		{
			//Hide the loading image
			$("#topicDetailLoadingResponses").hide();
			
			$("#topicDetailWarningMessage").show();
		};

	}
	

	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific TopicDetailViewManager instance.
		@name		TopicDetailViewManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[TopicDetailViewManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the TopicDetailViewManager singleton.
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
