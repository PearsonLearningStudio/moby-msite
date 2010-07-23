/**
	@class
	@author		MacA
	
	@description
	<p>The CrossDomainInitializer class is a singleton that provides functionality for posting messages
	between iFrames that live in different domains. A set of iFrames are created dynamically for each
	domain specified by the user upon calling the initializeDomain method. You must specify a callback
	method for each domain you initialized. This callback will be invoked when either the domain is
	initialized successfully, or the domain fails to load. The callback can expect one parameter which 
	is a Boolean value that specifies whether the domain initialized successfully (true) or not (false).
	This class assumes that a file called "CrossDomainCommunicator.html" lives at the root of each domain 
	that is to be communicated with. If that file cannot be located, the domain (and any domains that depend
	on that domain) will not initialize.</p>
	
	<p>The initializeDomain method will return an ID that it associates with that domain. When invoking the 
	initializeDomain method, you can specify a collection of domain ID's that the domain you want to initialize
	depends on. So let's say you have some services on domain2.ecollege.com that depend on data from services
	on domain1.ecollege.com. You would want to make sure domain1.ecollege.com loads first and fires it's callback 
	first. To do this, you would call initializeDomain for domain1.ecollege.com first, and use the ID that gets 
	returned as the third parameter when calling initializeDomain for domain2.ecollege.com. The third parameter of 
	initializeDomain optionally takes an array of ID's that the domain you are initializing depends on.</p>
	
	<p>Once a domain has been flagged as "ready", it will perform a check to see if all of the domains
	it depends on are initialized. If the domains it depends on are not initialized, it will sit in a "waiting" state.
	It then checks if other domains are depending on it. If so, each of those domains be checked to see if they
	are "ready". And if so, they will each perform their own check to see if all of the domains they depend on
	are initialized.</p>
	
	<p><strong>Note:</strong> If domain2 is dependent on domain1, domain1's callback *should* finish executing before
	domain2's callback starts. So you shouldn't have to worry about multi-threading issues, even though the domains
	are loading asychronously.</p>
	
	@requires	VariableValidator.js
				CrossFrameMessage.js
				jquery-1.4.2.js
*/
var CrossDomainInitializer = (function()
{
	/**
		The singleton instance of the AjaxManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the AjaxManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		/**
			The number of iFrames created by the CrossDomainInitializer.
			@type		Integer
			@default	0
			@private
		*/
		var _numberOfIFrames = 0;
		
		/**
			A counter to keep track of the number of iFrames that have loaded successfully.
			@type		Integer
			@default	0
			@private
		*/
		var _numberOfIFramesReady = 0;
		
		/**
			A counter used to provide unique ID's for each iFrame that gets created.
			@type		Integer
			@default	0
			@private
		*/
		var _iFrameIdCounter = 0;
		
		/**
			A value to prefix each iFrame ID with to distiguish that the iFrame was created via the CrossDomainInitializer.
			@type		String
			@default	"crossDomainCommunicator"
			@private
		*/
		var _iFrameIdPrefix = "crossDomainCommunicator";
		
		/**
			A URL specifying the origin of all communication with the iFrames.
			Ex. "http://mydomain.ecollege.com"
			@type	String
			@default	""
			@private
		*/
		var _origin = "";
		
		/**
			An object used as a dictionary that maps a domain to a callback function. Used to call
			a function for a specific domain once the domain loads or fails to load.
			@type	Object
			@default	{}
			@private
		*/
		var _callbacksFromDomains = {};
		
		/**
			An object used as a dictionary that maps a domain to a boolean value which flags whether or not
			a domain has loaded successfully or not.
			@type	Object
			@default	{}
			@private
		*/
		var _initializedFlagsFromDomains = {};
		
		/**
			An object used as a dictionary that maps a domain to a boolean value which flags whether or not
			a domain has received a "ready" message.
			@type	Object
			@default	{}
			@private
		*/
		var _readyFlagsFromDomains = {};
		
		/**
			An object used as a dictionary that maps a domain ID to a domain URL.
			@type	Object
			@default	{}
			@private
		*/
		var _domainUrlsFromIds = {};
		
		/**
			An object used as a dictionary that maps a domain URL to domain ID's that the domain is dependent on.
			@type	Object
			@default	{}
			@private
		*/
		var _dependentDomainIdsFromDomains = {};
		
		/**
			An object used as a dictionary that maps a domain URL to domain IDs that depend on that domain.
			@type	Object
			@default	{}
			@private
		*/
		var _domainsFromDependedUponDomainIds = {};
		
		/**
			An object used as a dictionary that maps a domain URL to an interval ID for a set interval for a secondary
			way to make sure the code is thread-safe.
			@type	Object
			@default	{}
			@private
		*/
		var _threadSafeIntervalsIDFromDomains = {};
		
		/**
			An interger that represents the amount of time (in milliseconds) before a thread-safe check is performed
			after a domain is marked as needing the check.
			@type	    Integer
			@default	1000
			@private
		*/
		var _threadSafeCheckInterval = 1000;
		
		/**
			A private reference to this instance of the CrossDomainInitializer object.
			@type	CrossDomainInitializer
			@private
		*/
		var _crossDomainInitializer = this;
		
		
		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
		
		/**
			The URL that all cross domain communication will be originating from. Ex. "http://mydomain.ecollege.com"
			
			@type		String
			@default	""
		*/
		this.originUrl = "";
		
		/**
			The number of milliseconds to wait before a domain being initialized is considered unresponsive and dead.
			
			@type		Integer
			@default	10000
		*/
		this.timeout = 20000;
		
		/**
			Toggles debug mode. Setting this to true will cause the class to generate messages on the error console.
			These console messages are specific to the Firebug plugin for Firefox. Setting this to true will cause errors in IE.
			
			@type		Boolean
			@deafult	false
		*/
		this.debug = false;
		
		
		/************************************
			Private Methods
		************************************/
		/**
			Handler used when receiving of new messages from other iframes. This handler specifically
			looks for a "loaded" message and if it receives one, it counts another iFrame as loaded.
			
			@param		{Event}		p_event		The message event that was received
			@private
		*/
		var _crossFrameMessageHandler = function(p_event)
		{
			if (_crossDomainInitializer.debug) console.group(_crossDomainInitializer, "Received CrossFrameMessage from: " + p_event.origin);
			// verify that the message came from a domain that was set to be initialized
			// since we only expect messages from those domains
			if (_callbacksFromDomains[p_event.origin] != undefined)
			{
				var message;
				try
				{
					// parse the data of the message into an object
					message = JSON.parse(p_event.data);
				}
				catch (p_error)
				{
					// if the parsing into JSON object failed, then we don't care about the message
					message = {messageType: "none"};
				}
				
				if (_crossDomainInitializer.debug) console.info("Message Type: " + message.messageType);
				if (message.messageType == CrossFrameMessage.MESSAGE_TYPE_LOADED)
				{
					// create a new CrossFrameMessage to send to each of the iFrames to register a domain origin
					// for which all requests should come from. Any messages from other domains will be ignored by the iFrames.
					var newMessage = new CrossFrameMessage();
					newMessage.messageType = CrossFrameMessage.MESSAGE_TYPE_REGISTER_DOMAIN;
					newMessage.domainOrigin = _crossDomainInitializer.originUrl;
					// send the register domain message back to the window that we received the "loaded" message from
					p_event.source.postMessage(JSON.stringify(newMessage), p_event.origin);
				}
				else if (message.messageType == CrossFrameMessage.MESSAGE_TYPE_READY)
				{
					// flag the domain as "ready"
					_readyFlagsFromDomains[p_event.origin] = true;
					
					// if this domain doesn't depend on other domains
					if (_dependentDomainIdsFromDomains[p_event.origin].length < 1)
					{
						// set the initialized flag for this domain to true
						_initializedFlagsFromDomains[p_event.origin] = true;
						
						if (_crossDomainInitializer.debug) console.info("Domain is not dependent on any other domains being loaded, so call callback function");
						// call the callback function and pass it a parameter of true, meaning that the domain loaded successfully
						_callbacksFromDomains[p_event.origin](true, _getDomainIdFromDom(p_event.origin));
						
						if (_crossDomainInitializer.debug) console.group("Checking if any domains depend on: " + p_event.origin);
						if (_domainsFromDependedUponDomainIds[p_event.origin].length < 1)
						{
							if (_crossDomainInitializer.debug) console.debug("No domains are depending on: " + p_event.origin);
						}
						// loop through all the domains that depend on this one, and have them re-check to 
						// see if they can mark themselves as initialized now
						for (var j = 0; j < _domainsFromDependedUponDomainIds[p_event.origin].length; j++)
						{
							_checkDomainDependencies(_domainsFromDependedUponDomainIds[p_event.origin][j]);
						}
						if (_crossDomainInitializer.debug) console.groupEnd();
					}
					// otherwise, this domain does depend on other domains
					else
					{
						if (_crossDomainInitializer.debug) console.info("Domain: " + p_event.origin + " is dependent on other domains being loaded.");
					
						// if all the domains that this domain depends on were initialized
						if (_checkDependentDomains(p_event.origin))
						{
							// set the initialized flag for this domain to true
							_initializedFlagsFromDomains[p_event.origin] = true;
							
							if (_crossDomainInitializer.debug) console.debug("All dependent domains have been loaded, so call the callback function");
							// call the callback function and pass it a parameter of true, meaning that the domain loaded successfully
							_callbacksFromDomains[p_event.origin](true, _getDomainIdFromDom(p_event.origin));
							
							if (_crossDomainInitializer.debug) console.group("Checking if any domains depend on: " + p_event.origin);
							if (_domainsFromDependedUponDomainIds[p_event.origin].length < 1)
							{
								if (_crossDomainInitializer.debug) console.debug("No domains are depending on: " + p_event.origin);
							}
							// loop through all the domains that depend on this one, and have them re-check to 
							// see if they can mark themselves as initialized now
							for (var j = 0; j < _domainsFromDependedUponDomainIds[p_event.origin].length; j++)
							{
								_checkDomainDependencies(_domainsFromDependedUponDomainIds[p_event.origin][j]);
							}
							if (_crossDomainInitializer.debug) console.groupEnd();
						}
						// otherwise create a check to be completed at a given interval just in case
						// another thread was started (a domain loaded) while we were executing our checks
						else
						{
							_threadSafeIntervalsIDFromDomains[p_event.origin] = setInterval(function(){_threadSafeCheck(p_event.origin)}, _threadSafeCheckInterval);
						}
					}
				}
			}
			else
			{
				throw new Error("CrossDomainInitializer._crossFrameMessageHandler() - A message was received from an invalid domain: " + p_event.origin);
			}
			if (_crossDomainInitializer.debug) console.groupEnd();
		};
		
		
		/**
			This method is invoked at a specified interval when a domain could have missed being initialized because
			a separate thread (for a domain it depends on) was executing at the same time. This method is used just 
			to make sure a domain with dependecies gets initialized if it's dependencies are intialized. In most cases 
			the domain will have already been initialized successfully, but this is needed in those rare cases.
			
			@param		{String}	p_domainUrl		The URL of the domain to check
			@private
		*/
		var _threadSafeCheck = function(p_domainUrl)
		{
			if (_crossDomainInitializer.debug) console.group(_crossDomainInitializer, "Performing thread-safe check for: " + p_domainUrl);
			// if this domain was not initialized
			if (!_initializedFlagsFromDomains[p_domainUrl])
			{
				// if all the domains that this domain depends on were initialized
				if (_checkDependentDomains(p_domainUrl))
				{
					// set the initialized flag for this domain to true
					_initializedFlagsFromDomains[p_domainUrl] = true;
					
					if (_crossDomainInitializer.debug) console.debug("All dependent domains have been loaded.");
					// call the callback function and pass it a parameter of true, meaning that the domain loaded successfully
					_callbacksFromDomains[p_domainUrl](true, _getDomainIdFromDom(p_domainUrl));
					
					if (_crossDomainInitializer.debug) console.group("Checking if any domains depend on this domain...");
					if (_domainsFromDependedUponDomainIds[p_domainUrl].length < 1)
					{
						if (_crossDomainInitializer.debug) console.debug("No domains are depending on: " + p_domainUrl);
					}
					for (var j = 0; j < _domainsFromDependedUponDomainIds[p_domainUrl].length; j++)
					{
						_checkDomainDependencies(_domainsFromDependedUponDomainIds[p_domainUrl][j]);
					}
					if (_crossDomainInitializer.debug) console.groupEnd();
					
					clearInterval(_threadSafeIntervalsIDFromDomains[p_domainUrl]);
				}
			}
			else
			{
				if (_crossDomainInitializer.debug) console.debug("This domain was initialized successfully");
				clearInterval(_threadSafeIntervalsIDFromDomains[p_domainUrl]);
			}
			if (_crossDomainInitializer.debug) console.groupEnd();
		};
		
		/**
			Handler used to check if a domain has loaded within the time defined by the timeout.
			@param		{String}	p_domainUrl		The URL of the domain that was to be loaded.	
			@private
		*/
		var _checkDomainForTimeout = function(p_domainUrl)
		{
			if (_crossDomainInitializer.debug) console.group(_crossDomainInitializer, "Checking if domain: " + p_domainUrl + " has timed out");
			// if the domain hasn't been loaded, assume it's never going to
			if (!_initializedFlagsFromDomains[p_domainUrl])
			{
				if (_crossDomainInitializer.debug) console.warn("Domain has timed out!");
				// call the callback function and pass it a parameter of false, meaning that the domain failed to load
				_callbacksFromDomains[p_domainUrl](false, _getDomainIdFromDom(p_domainUrl));
				// clean up
				_killDomain(p_domainUrl);
			}
			else
			{
				if (_crossDomainInitializer.debug) console.debug("negative");
			}
			if (_crossDomainInitializer.debug) console.groupEnd();
		};
		
		/**
			Method used to check if all the dependent domains for a given domain have been loaded.
			@param		{String}	p_domainUrl		The URL of the domain that has dependent domains.
			@return		{Boolean}	true if all domains that this domain depend on are initialized, false otherwise
			@private
		*/
		var _checkDependentDomains = function(p_domainUrl)
		{
			var allDependentDomainsInitialized = true;
			if (_dependentDomainIdsFromDomains[p_domainUrl].length < 1)
			{
				if (_crossDomainInitializer.debug) console.debug("No dependent domains.");
			}
			// loop through all the dependent domain IDs for this domain
			for (var i = 0; i < _dependentDomainIdsFromDomains[p_domainUrl].length; i++)
			{
				if (_crossDomainInitializer.debug) console.group("Checking dependent domain: " + _domainUrlsFromIds[_dependentDomainIdsFromDomains[p_domainUrl][i]]);
				// if this dependent domain has not been initialized yet, stop check the other ones
				if (!_initializedFlagsFromDomains[_domainUrlsFromIds[_dependentDomainIdsFromDomains[p_domainUrl][i]]])
				{
					if (_readyFlagsFromDomains[_domainUrlsFromIds[_dependentDomainIdsFromDomains[p_domainUrl][i]]])
					{
						if (_crossDomainInitializer.debug) console.warn("This domain has received a " + CrossFrameMessage.MESSAGE_TYPE_READY + " message, but is waiting for domains that it depends on");
					}
					else
					{
						if (_crossDomainInitializer.debug) console.warn("This domain is still waiting for a " + CrossFrameMessage.MESSAGE_TYPE_READY + " message");
					}
					allDependentDomainsInitialized = false
					if (_crossDomainInitializer.debug) console.groupEnd();
					break;
				}
				if (_crossDomainInitializer.debug) console.info("This domain has received a " + CrossFrameMessage.MESSAGE_TYPE_READY + " message");
				if (_crossDomainInitializer.debug) console.groupEnd();
			}
			
			return allDependentDomainsInitialized;
		};
		
		/**
			Method used to check if a domain that depends on this domain was waiting, and if so check it's dependent domains
			to see if it can be flagged as initialized.
			@param		{String}	p_domainUrl		The URL of the domain that was to be loaded.	
			@private
		*/
		var _checkDomainDependencies = function(p_domainUrl)
		{
			// if this domain was not initialized successfully
			if (!_initializedFlagsFromDomains[p_domainUrl])
			{
				// if this domain is ready (and waiting)
				if (_readyFlagsFromDomains[p_domainUrl])
				{
					if (_crossDomainInitializer.debug) console.debug("Domain: " + p_domainUrl + " was waiting and ready");
					if (_crossDomainInitializer.debug) console.group("Checking all dependecies for: " + p_domainUrl);
					for (var i = 0; i < _dependentDomainIdsFromDomains[p_domainUrl].length; i++)
					{
						if (_crossDomainInitializer.debug) console.debug("Domain: " + p_domainUrl + " has a dependent domain of: " + _domainUrlsFromIds[_dependentDomainIdsFromDomains[p_domainUrl][i]]);
						// if the domain URL doesn't exist, then that means that domain has timed out
						if (_domainUrlsFromIds[_dependentDomainIdsFromDomains[p_domainUrl][i]] == undefined)
						{
							if (_crossDomainInitializer.debug) console.debug("Domain never loaded... so fail this domain (" + p_domainUrl + ")");
							// call the callback for this domain and pass it a parameter of false, meaning that since
							// a dependent domain failed to load, this one also will fail to be loaded.
							_callbacksFromDomains[p_domainUrl](false, _getDomainIdFromDom(p_domainUrl));
							// clean up
							_killDomain(p_domainUrl);
						}
					}
					if (_crossDomainInitializer.debug) console.groupEnd();
					
					// if all the domains that this domain depends on were initialized
					if (_checkDependentDomains(p_domainUrl))
					{
						// set the initialized flag for this domain to true
						_initializedFlagsFromDomains[p_domainUrl] = true;
							
						if (_crossDomainInitializer.debug) console.debug("All dependent domains have been loaded, so call the callback function");
						
						// call the callback function and pass it a parameter of true, meaning that the domain loaded successfully
						_callbacksFromDomains[p_domainUrl](true, _getDomainIdFromDom(p_domainUrl));
						
						if (_crossDomainInitializer.debug) console.group("Checking if any domains depend on: " + p_domainUrl);
						if (_domainsFromDependedUponDomainIds[p_domainUrl].length < 1)
						{
							if (_crossDomainInitializer.debug) console.debug("No domains are depending on: " + p_domainUrl);
						}
						for (var j = 0; j < _domainsFromDependedUponDomainIds[p_domainUrl].length; j++)
						{
							_checkDomainDependencies(_domainsFromDependedUponDomainIds[p_domainUrl][j]);
						}
						if (_crossDomainInitializer.debug) console.groupEnd();
					}
				}
				else
				{
					if (_crossDomainInitializer.debug) console.debug("Domain: " + p_domainUrl + " is not ready yet");
				}
			}
			else
			{
				if (_crossDomainInitializer.debug) console.debug("Domain: " + p_domainUrl + " was already initialized");
			}
		};
		
		/**
			Used to delete memory for a domain that was attempted to be loaded but failed.
			@param		{String}	p_domainUrl		The URL of the domain that was to be loaded.	
			@private
		*/
		var _killDomain = function(p_domainUrl)
		{
			var $iframe = $("iframe[src^='" + p_domainUrl + "']");
			var domainID = $iframe.attr("id").replace(_iFrameIdPrefix, "");
			$iframe.remove();
			clearInterval(_threadSafeIntervalsIDFromDomains[p_domainUrl]);
			delete _initializedFlagsFromDomains[p_domainUrl];
			delete _readyFlagsFromDomains[p_domainUrl];
			delete _callbacksFromDomains[p_domainUrl];
			delete _domainUrlsFromIds[domainID];
			delete _dependentDomainIdsFromDomains[p_domainUrl];
			delete _domainsFromDependedUponDomainIds[p_domainUrl];
			delete _threadSafeIntervalsIDFromDomains[p_domainUrl];
		};
		
		/**
			Used to retrieve a domain ID from the ID attribute of the associated iFrame.
			@param		{String}	p_domainUrl		The URL of the domain that was to be loaded.
			@return		The ID for that domain.
			@private
		*/
		var _getDomainIdFromDom = function(p_domainUrl)
		{
			var $iframe = $("iframe[src^='" + p_domainUrl + "']");
			// parse out the ID and convert it to an int
			return parseInt($iframe.attr("id").replace(_iFrameIdPrefix, ""), 10);
		};
		
		
		/************************************
			Public Methods
		************************************/
		/**
			Creates an iFrame for the domain specified, and creates a message listener to listen for "ready" messages coming from that iFrame.
			It is expected that the "CrossDomainCommunicator.html" file lives at the root of each of the specified domains. When all the iFrames
			created have loaded successfully, the "onInitialized" method will be invoked.
			
			@param	{String}	p_domainUrl					A URL to the domain that needs to be initialized for cross domain communication. Ex. "http://mydomain.ecollege.com"
			@param	{Function}	p_callback					A function that will get called when:
															<ol><li>the domain has been initialized</li>
															<li>or the domain fails to initialize within the time defined by the timeout</li></ol>
															<p>The callback function can expect to receive two parameters. the first is a boolean
															flag that specifies whether the domain initialized successfully or not. It will be true
															if it was successful, false otherwise. The second will be the ID assigned to that domain.</p>
			@param	{Array}		[p_dependentDomainIds]		A collection of ID's of domains that need to be initialized before this domain fires it's callback.
			@return {Integer}	An ID that is assigned to the domain being initialized. This ID will also be appended to the id attribute of the iframe that is created.
		*/
		this.initializeDomain = function(p_domainUrl, p_callback, p_dependentDomainIds)
		{
			// parameter validation
			VariableValidator.require(this, p_domainUrl, "string");
			VariableValidator.require(this, p_callback, "function");
			VariableValidator.optional(this, p_dependentDomainIds, "Array");
			if (p_domainUrl == "" || p_domainUrl == "*" || p_domainUrl.indexOf(".") < 0)
			{
				throw new Error("CrossDomainInitializer.initializeDomain() - '" + p_domainUrl + "' is not a valid domain URL.");
			}
			// DOM ready validation
			var $body = $(document.body);
			if ($body.length < 1)
			{
				throw new Error("CrossDomainInitializer.initializeDomain() - The DOM is not ready yet! Cannot create iFrame.");
			}
			
			// other variable validation
			if (this.originUrl == null || this.originUrl == undefined || this.originUrl == "")
			{
				throw new Error("CrossDomainInitializer.initializeDomain() - Please set the originUrl property before initializing a domain.");
			}
			if (_callbacksFromDomains[p_domainUrl] != undefined)
			{
				throw new Error("CrossDomainInitializer.initializeDomain() - '" + p_domainUrl + "' has already been initialized.");
			}
			if (p_dependentDomainIds != undefined && p_dependentDomainIds != null)
			{
				if (!(p_dependentDomainIds instanceof Array))
				{
					throw new TypeError("CrossDomainInitializer.initializeDomain() - The collection of dependent domain IDs should be of type Array.");
				}
				for (var i = 0; i < p_dependentDomainIds.length; i++)
				{
					if (_domainUrlsFromIds[p_dependentDomainIds[i]] == undefined)
					{
						throw new Error("CrossDomainInitializer.initializeDomain() - 'Unable to depend on domain ID: " + p_dependentDomainIds[i] + "'  since that ID does not exist.");
					}
					else
					{
						// if the dependent domain has not been fully initialized yet
						if (!_initializedFlagsFromDomains[_domainUrlsFromIds[p_dependentDomainIds[i]]])
						{
							// add this domain to the list of domains that are waiting on the dependent domain
							_domainsFromDependedUponDomainIds[_domainUrlsFromIds[p_dependentDomainIds[i]]].push(p_domainUrl);
						}
					}
				}
			}
			else
			{
				p_dependentDomainIds = [];
			}
			
			
			if (this.debug) console.debug(_crossDomainInitializer, "Initializing: " + p_domainUrl);
			
			// keep track of which callback is related to the domain
			_callbacksFromDomains[p_domainUrl] = p_callback;
			// set the initialized flag for this domain to false
			_initializedFlagsFromDomains[p_domainUrl] = false;
			// set the ready flag for this domain to false
			_readyFlagsFromDomains[p_domainUrl] = false;
			// keep track of which domain URL is associated with each ID
			_domainUrlsFromIds[_iFrameIdCounter] = p_domainUrl;
			// keep track of the dependent domain ID's for this domain
			_dependentDomainIdsFromDomains[p_domainUrl] = p_dependentDomainIds;
			// initialize a collection for domains that could be (in the future) dependent on this domain
			_domainsFromDependedUponDomainIds[p_domainUrl] = new Array();
			
			$body.append("<iframe id='" + _iFrameIdPrefix + _iFrameIdCounter + "' style='display:none;' src='" + p_domainUrl + "/CrossDomainCommunicator.aspx'></iframe>");
			
			// check to make sure the domain loaded successfully after the timeout time has been reached
			setTimeout(function(){_checkDomainForTimeout(p_domainUrl)}, this.timeout);
			
			return _iFrameIdCounter++;
		};
		
		/************************************
			Constructor Initialization
		************************************/
		// attach message listeners to listen for new messages
		if (typeof window.addEventListener != 'undefined')
		{
			window.addEventListener('message', _crossFrameMessageHandler, false);
		}
		else if (typeof window.attachEvent != 'undefined')
		{
			window.attachEvent('onmessage', _crossFrameMessageHandler);
		}
		else
		{
			throw new Error("CrossDomainInitializer.constructor() - Oops! Your browser doesn't support event listeners.");
		}
	}
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific CrossDomainInitializer instance.
		@name		CrossDomainInitializer#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[CrossDomainInitializer]";
	}
	
	
	return new function()
	{
		/**
			Retrieves the instance of the CrossDomainInitializer singleton.
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