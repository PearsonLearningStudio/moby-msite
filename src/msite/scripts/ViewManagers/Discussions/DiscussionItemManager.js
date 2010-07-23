/**
	@class
	@author		TimS
	
	@description
	<p>The DiscussionItemManager class is a singleton that manages the data returned by requests to the threads API.</p>
*/
var DiscussionItemManager = (function()
{
	/**
		The singleton instance of the DiscussionItemManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the DiscussionItemManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		
		/**
			holds all of the discussion items that have been loaded
			@type		Array
			@default	false
		*/
		var _discussionItems = [];
		
		/**
			Indicates whether or not all topics have been loaded
			@type		Boolean
			@default	false
		*/
		var _topicsLoaded = false;
		
		/**
			Indicates whether or not all closed threads have been loaded
			@type		Boolean
			@default	false
		*/
		var _closedThreadsLoaded = false;
		
		/************************************
			Private Methods
		************************************/
		
		var _discussionItemSort = function(p_itemA, p_itemB)
		{
		    if(p_itemA.courseTitle < p_itemB.courseTitle) return -1;
		    else if(p_itemA.courseTitle > p_itemB.courseTitle) return 1;
		    else if(p_itemA.unitNumber < p_itemB.unitNumber) return -1;
		    else if(p_itemA.unitNumber > p_itemB.unitNumber) return 1;
		    else if(p_itemA.itemOrderNumber < p_itemB.itemOrderNumber) return -1;
		    else if(p_itemA.itemOrderNumber > p_itemB.itemOrderNumber) return 1;
		    else return 0;
		}

		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
		
		
		/************************************
			Public Methods
		************************************/
		
		
		this.addTopics = function(p_topics)
		{
		    for(var i = 0; i < p_topics.length; i++)
		    {
		        var topic = p_topics[i];
		        var discussionItem = new DiscussionItem();
		        discussionItem.courseId = topic.containerInfo.courseId;
		        discussionItem.courseTitle = topic.containerInfo.courseTitle
		        discussionItem.unitNumber = topic.containerInfo.unitNumber;
		        discussionItem.unitHeader = topic.containerInfo.unitHeader;
		        discussionItem.unitTitle = topic.containerInfo.unitTitle;
		        discussionItem.itemOrderNumber = topic.containerInfo.contentItemOrderNumber;
		        discussionItem.item = topic;
		        
		        if(topic.isActive())
		        {
		            discussionItem.itemType = "ActiveTopic";
		        }
		        else
		        {
		            discussionItem.itemType = "InactiveTopic";
		        }
		        
		        _discussionItems.push(discussionItem);
		    }
		    _topicsLoaded = true;
		};
				
		this.addClosedThreads = function(p_courseItems)
		{
		    for(var i = 0; i < p_courseItems.length; i++)
		    {
		        var courseItem = p_courseItems[i];
		        var discussionItem = new DiscussionItem();
		        discussionItem.courseId = courseItem.courseId;
		        discussionItem.courseTitle = courseItem.courseTitle;
		        discussionItem.unitNumber = courseItem.parentOrderNumber;
		        discussionItem.unitHeader = courseItem.unitHeader;
		        discussionItem.unitTitle = courseItem.parentTitle;
		        discussionItem.itemOrderNumber = courseItem.orderNumber;
		        discussionItem.item = courseItem;
		        discussionItem.itemType = "ClosedThread";
		        
		        _discussionItems.push(discussionItem);
		    }
		    _closedThreadsLoaded = true;
		};

        this.areAllItemsLoaded = function()
        {
            return _topicsLoaded && _closedThreadsLoaded;
        };
        
        this.getDiscussionItems = function()
        {
            _discussionItems.sort(_discussionItemSort);
            return _discussionItems;
        }
	}
	
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific DiscussionItemManager instance.
		@name		DiscussionItemManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[DiscussionItemManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the DiscussionItemManager singleton.
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
