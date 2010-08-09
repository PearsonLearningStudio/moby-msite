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
	<p>The MobyAppInitializer class is a singleton that handles retrieving and storing all the data
	necessary for the Moby client.</p>
*/
var MobyAppInitializer = (function()
{
	/**
		The singleton instance of the MobyAppInitializer class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the MobyAppInitializer instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		var _happeningsPageURL = "happenings.html";
	    var _discussionsPageURL = "discussions.html";
	    
	    var _happeningsPageTitle = "Happenings";
	    var _discussionsPageTitle = "Discussions";
	    
	    var _ajaxManager;
	    var _mobyWorkflowManager;
	    var _clientStringManager;
	    
	    var _happeningsPageLoaded = false;
	    var _discussionsPageLoaded = false;
	    var _happeningsPageInitialized = false;
	    var _discussionsPageInitialized = false;
	    
	    
		/************************************
			Private Methods
		************************************/
		
		var _loadAndInitializeHappeningsPage = function()
	    {
			var initHappeningsPage = function(p_data, p_transactionId)
			{
				$("#happeningsPage").html(p_data);
				_happeningsPageLoaded = true;
				_initializeHappeningsPage();
				
			};
			_ajaxManager.get(_happeningsPageURL, [], initHappeningsPage, _loadPageErrorHandler);
	    };
	    
	    var _loadAndInitializeDiscussionsPage = function()
	    {
			var initDiscussionsPage = function(p_data, p_transactionId)
			{
				$("#discussionsPage").html(p_data);
				_discussionsPageLoaded = true;
				_initializeDiscussionPage();
				
			};
			_ajaxManager.get(_discussionsPageURL, [], initDiscussionsPage, _loadPageErrorHandler);
	    };
		
		var _showHappeningsPage = function()
		{
			document.title = _happeningsPageTitle;
			createCookie("currentPage", PAGE_NAME_HAPPENINGS, 259200);
			$("#thingsToKnow").addClass("navS").removeClass("navNS");
			$("#discussions").addClass("navNS").removeClass("navS");
			$("#happeningsPage").show();
			$("#discussionsPage").hide();
			
			// set the scroll position to remembered position, need to wait 1 ms for mobile safari
			setTimeout(function(){window.scrollTo(0, 0);}, 1);
				
			if (!_happeningsPageLoaded && !_happeningsPageInitialized)
			{
				_loadAndInitializeHappeningsPage();
			}
			else if (!_happeningsPageInitialized)
			{
				_initializeHappeningsPage();
			}
		};
		
		var _showDiscussionsPage = function()
		{
			document.title = _discussionsPageTitle;
			createCookie("currentPage", PAGE_NAME_DISCUSSIONS, 259200);
			$("#thingsToKnow").addClass("navNS").removeClass("navS");
			$("#discussions").addClass("navS").removeClass("navNS");
			$("#happeningsPage").hide();
			$("#discussionsPage").show();
			
			// set the scroll position to remembered position, need to wait 1 ms for mobile safari
			setTimeout(function(){window.scrollTo(0, 0);}, 1);
				
			if (!_discussionsPageLoaded && !_discussionsPageInitialized)
			{
				_loadAndInitializeDiscussionsPage();
			}
			else if (!_discussionsPageInitialized)
			{
				_initializeDiscussionPage();
			}
		};
		
		
		var _loadHappeningsPageSuccessHandler = function(p_data, p_transactionId)
		{
			$("#happeningsPage").html(p_data);
			_happeningsPageLoaded = true;
		};
		
		var _loadDiscussionsPageSuccessHandler = function(p_data, p_transactionId)
		{
			$("#discussionsPage").html(p_data);
			_discussionsPageLoaded = true;
		};
		
		var _loadPageErrorHandler = function(p_transactionId)
		{
			_mobyWorkflowManager.showGenericApplicationErrorMessage();
		};
		
		
		var _initializeHappeningsPage = function()
		{
			_mobyWorkflowManager.eventDispatcher.addEventListener(MobyDataEvent.HAPPENINGS_LOADED, function(p_event)
			{
				// only scroll the window to 0 if the user hasn't already scrolled it themselves
				if ($(window).scrollTop() == 0)
				{
					// set the scroll position to remembered position, need to wait 1 ms for mobile safari
					setTimeout(function(){window.scrollTo(0, 0);}, 1);
				}
				
				_happeningsPageInitialized = true;
				
				if (!_discussionsPageLoaded)
				{
					_ajaxManager.get(_discussionsPageURL, [], _loadDiscussionsPageSuccessHandler, _loadPageErrorHandler);
				}
			}, true);
			_mobyWorkflowManager.initializePage(PAGE_NAME_HAPPENINGS);
		};
		
		var _initializeDiscussionPage = function()
		{
			_mobyWorkflowManager.eventDispatcher.addEventListener(MobyDataEvent.DISCUSSIONS_LOADED, function(p_event)
			{
				// only scroll the window to 0 if the user hasn't already scrolled it themselves
				if ($(window).scrollTop() == 0)
				{
					// set the scroll position to remembered position, need to wait 1 ms for mobile safari
					setTimeout(function(){window.scrollTo(0, 0);}, 1);
				}
				
				
				_discussionsPageInitialized = true;
				
				if (!_happeningsPageLoaded)
				{
					_ajaxManager.get(_happeningsPageURL, [], _loadHappeningsPageSuccessHandler, _loadPageErrorHandler);
				}
			}, true);
			_mobyWorkflowManager.initializePage(PAGE_NAME_DISCUSSIONS);	
		};
		
		
		var _applicationErrorHandler = function(p_event)
		{
			// disable tabs
			$("#discussions").unbind("click", _showDiscussionsPage);
			$("#thingsToKnow").unbind("click", _showHappeningsPage);
		};
		
		
		
		
		
		
		/************************************
			Public Methods
		************************************/
		
		/**
			Starts the initialization of the application.
		*/
		this.startApplication = function()
		{
			// enable tabs
			$("#discussions").bind("click", _showDiscussionsPage);
			$("#thingsToKnow").bind("click", _showHappeningsPage);
				
			_ajaxManager = AjaxManager.getInstance();
			_mobyWorkflowManager = MobyWorkflowManager.getInstance();
			_clientStringManager = ClientStringManager.getInstance();
			
			// let's check for an email auth grant before we do anything else
			// if there's no email auth grant on the query string variable, then
			// continue loading the page. If there is, the app will attempt to
			// log the user in.
			if (!_mobyWorkflowManager.checkForEmailAuthGrant())
			{
				var clientString = _clientStringManager.getClientString();
				
				// Check if we are unsuccessful in finding a client string specified
				if (clientString == null || clientString == undefined || clientString == "")
				{
					// no client string detected, show some error
					$("#loadingMessageContainer").hide();
					$("#errorContainer div.errorMessage").html("The page cannot be found!");
					$("#errorContainer").show();
				}
				else
				{
					_mobyWorkflowManager.clientString = clientString;
					// before we load any pages, lets make sure the user has an access grant of some sort
					_mobyWorkflowManager.checkForAccessGrant();
    				
    				_mobyWorkflowManager.eventDispatcher.addEventListener(MobyDataEvent.APPLICATION_ERROR, _applicationErrorHandler);
					var currentPage = readCookie("currentPage");
					if (currentPage != null && currentPage != undefined)
					{
						if (currentPage == PAGE_NAME_DISCUSSIONS)
						{
							_showDiscussionsPage();
						}
						else
						{
							_showHappeningsPage();
						}
					}
					else
					{
						_showHappeningsPage();
					}
    				
				}
			}
			
	    };
	    
	    /**
			Displays an application error message.
		*/
	    this.showApplicationErrorMessage = function()
	    {
			_mobyWorkflowManager = MobyWorkflowManager.getInstance();
			_mobyWorkflowManager.showGenericApplicationErrorMessage();
		};
		
	}	
	
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific MobyAppInitializer instance.
		@name		MobyAppInitializer#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[MobyAppInitializer]";
	}
	
	
	return new function()
	{
		/**
			Retrieves the instance of the MobyAppInitializer singleton.
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
	
		

			
    		
    		
		   
			
			