/**
	@class
	@author		TimS
	
	@description
	<p>The ResponseDetailViewManager class is a singleton that manages the display of the Response Detail view.</p>
*/
var ResponseDetailViewManager = (function()
{
	/**
		The singleton instance of the ResponseDetailViewManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the ResponseDetailViewManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		
		/**
			A jQuery object that represents the collection of all responses to a topic DOM elements that 
			were created by the DiscussionsViewManager.
			@type		jQuery
			@default	$()
		*/
		var _childResponsesCollection = $();
		
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

			return clonedItem;
		};
		
		var _respondToggle = function()
		{
		    _hideRespondError();
			$("#respondToResponseForm").toggle();
		}
		
		var _respondClear = function()
		{
		    var newTitle = _instance.currentResponse.title.htmlDecode();
		    if (!newTitle.startsWith("RE:") && !newTitle.startsWith("re:"))
		        newTitle = "RE: " + newTitle;
            $("#respondToResponseSubject").val(newTitle);
		    $("#respondToResponseArea").val("");
		    _hideRespondError();
		}
		
		var _respondClose = function()
		{
			$("#respondToResponseForm").hide();
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
			    _instance.newThreadPostCallback(_instance.currentResponse, $("#respondToResponseSubject").val(), $("#respondToResponseArea").val());
			}
			catch(e)
			{
	            $("form span.ajaxLoadingThread").hide();
			    _showRespondError(e.message);
			}
        }

        var _showRespondError = function(p_errorMessage)
        {
            var errDiv = $("#respondToResponseForm div.inlineError");
            errDiv.text(p_errorMessage);
            errDiv.show();
        };
        
        var _hideRespondError = function()
        {
            var errDiv = $("#respondToResponseForm div.inlineError");
            errDiv.text("");
            errDiv.hide();
        };
        
        var _updateResponseCountsOnView = function(p_responseCounts)
        {
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
			var repliesElement = $("#responsesByResponse li.post span.replies, #responsesByResponse li.post span.repliesunread");
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
			 The current UserThreadResponse
			 @type		UserThreadResponse
			 @default	""
		*/
		this.currentResponse = null;
		
		/**
			 The callback to call when a new thread post has been submitted.
			 @type		String
			 @default	null
		*/
		this.newThreadPostCallback = null;
				

		/************************************
			Public Methods
		************************************/

		/**
			Handles any initialization needed by the view manager, such as wiring up event handlers
			@return		none
		*/
		this.initialize = function()
		{
			$("#respondToResponseLink").bind("click", _respondToggle);
			$("#respondToResponseCancelBtn").bind("click", _respondCancel);
			$("#respondToResponseRespondBtn").bind("click", _respondSubmit);
		};
				
		/**
			Displays the view to the user.
			@param		{UserThreadResponse}	p_response	The UserThreadResponse that should be displayed on the view.
			@return		{none}
		*/
		this.show = function(p_response)
		{
		    //Remove previously displayed messages
		    $("#respondToResponseConfirm").hide();
		    
		    this.currentResponse = p_response;
			//Remove any existing responses from the div
			this.removeAllResponsesToTopicFromView();
			
			//Cancel any previously begun responses
			_respondCancel();
		
			//Update the DOM for this response
			$("#responsesByResponse ul").attr("title", p_response.title);
			$("#responsesByResponse li.cathd_discussionR").html(p_response.title);
			$("#responseDescription").html(p_response.description);
			$("#responseAuthorName").html(p_response.author.firstName + " " + p_response.author.lastName);
			$("#responsePostedDate").html(p_response.postedDateFormatted);
			
			_updateResponseCountsOnView(p_response.responseCounts);

			//Show the loading image
			$("#responseDetailLoadingResponses").show();
			
			$("#responseDetailWarningMessage").hide();

			//Show the response detail div
			$("#responsesByResponse").show();
		};
		
		this.hide = function()
		{
			//Hide the response detail div
			$("#responsesByResponse").hide();
		};
		
		/**
			Adds a new response to the child response list.
			@param		{UserThreadResponse}	p_response	The new UserThreadResponse that should be displayed in the list.
			@param		{callback}	p_responseClickHandler	The function to call when the user clicks on the response.
			@return		{none}
		*/
		this.addNewChildResponseToView = function(p_userThreadResponse, p_responseClickHandler)
		{
			var clonedItem = _createReponseElementClone(p_userThreadResponse);
			clonedItem.find("a").bind("click", p_userThreadResponse, p_responseClickHandler);
			clonedItem.insertAfter("#responsesByResponse ul li.post");
			_childResponsesCollection = _childResponsesCollection.add(clonedItem);
		};
		
		/**
			Adds the list of child responses to the view
			@param		{UserThreadResponse}	p_response	The UserThreadResponse objects that should be displayed in the list.
			@param		{callback}	p_responseClickHandler	The function to call when the user clicks on one of the responses.
			@return		{none}
		*/
		this.createChildResponsesOnView = function(p_userThreadResponses, p_responseClickHandler)
		{			
			//Remove the loading image
			$("#responseDetailLoadingResponses").hide();
			
			for (var i = 0; i < p_userThreadResponses.length; i++)
			{
				var clonedItem = _createReponseElementClone(p_userThreadResponses[i]);
				clonedItem.find("a").bind("click", p_userThreadResponses[i], p_responseClickHandler);
				clonedItem.appendTo("#responsesByResponse ul");
				_childResponsesCollection = _childResponsesCollection.add(clonedItem);
			}
		};

		
		/**
			Removes all the responses to a topic DOM elements from the view that were created by 
			the ResponseDetailViewManager.
		*/
		this.removeAllResponsesToTopicFromView = function()
		{
			_childResponsesCollection.remove();
			_childResponsesCollection = $();
		};
		
		this.updateResponseCountsOnView = function(p_responseCounts)
		{
			if (p_responseCounts != undefined && p_responseCounts != null)
			{
				this.currentResponse.responseCounts = p_responseCounts;
			}
			_updateResponseCountsOnView(this.currentResponse.responseCounts);
		};
		
		this.setResponseCountsText = function(p_text)
		{
			$("#responsesByResponse span.replies, #responsesByResponse span.repliesunread").html(p_text);
		};
		
		this.showResponsesLoadError = function()
		{
			//Hide the loading image
			$("#responseDetailLoadingResponses").hide();
			
			$("#responseDetailWarningMessage").show();
		};


	}
	

	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific ResponseDetailViewManager instance.
		@name		ResponseDetailViewManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[ResponseDetailViewManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the ResponseDetailViewManager singleton.
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
