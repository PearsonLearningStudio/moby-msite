/**
	@class
	@author		TimS
	
	@description
	<p>The HappeningItemManager class is a singleton that manages the data returned by the various services needed for the happenings page.</p>
*/
var HappeningItemManager = (function()
{
	/**
		The singleton instance of the HappeningItemManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the HappeningItemManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		
		/**
			holds all of the happening items that have been loaded
			@type		Array
			@default	[]
		*/
		var _happeningItems = [];
		
		/**
			Whether or not the _happeningItems array is currently sorted.
			@type		Boolean
			@default	false
		*/
		var _isSorted = false;
				
		/************************************
			Private Methods
		************************************/
		
		var _timeFromNowAscendingSort = function(p_itemA, p_itemB)
		{
		    //Sort first by time from now, then by course title, and finally by id
		    if(p_itemA.timeFromNow < p_itemB.timeFromNow) return -1;
		    else if(p_itemA.timeFromNow > p_itemB.timeFromNow) return 1;
		    else 
		    {
		        if(p_itemA.courseTitle < p_itemB.courseTitle) return -1;
		        else if(p_itemA.courseTitle > p_itemB.courseTitle) return 1;
		        else
		        {
	                if(p_itemA.id < p_itemB.id) return -1;
	                else if(p_itemA.id > p_itemB.id) return 1;
	                else return 0;
		        }
		    }
		};

		/**
			Returns the date to be used when displaying this topic
		*/
		var _getDateForTopic = function()
		{
		    var topicDate = new Date();
		    
		    //Set the topic date to be yesterday
		    topicDate.setDate(topicDate.getDate() - 1);
		    
		    return topicDate;
		};
		
		var _getTimeFromNow = function(p_itemDate)
		{
		    var itemTime = 0;
		    if(typeof p_itemDate == "number")
		    {
		        itemTime = p_itemDate;
		    }
		    else
		    {
		        itemTime = p_itemDate.getTime();
		    }
		    
		    return Math.abs(itemTime - (new Date()).getTime());
		};

		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
		
		
		/************************************
			Public Methods
		************************************/
		
		
		this.addItems = function(p_items, p_conversionFunction)
		{
		    for(var i = 0; i < p_items.length; i++)
		    {
		        _happeningItems.push(p_conversionFunction(p_items[i]));
		    }
		    
		    _isSorted = false;
		};
		
		
		this.removeItemById = function(p_itemId)
		{
			for(var i = 0; i < _happeningItems.length; i++)
		    {
				if (_happeningItems[i].id == p_itemId)
				{
					_isSorted = false; // not sure if this is necessary
					return _happeningItems.splice(i, 1)[0];
				}
		    }
		    return null;
		};
		
		
		this.getItems = function(p_filterFunction)
		{
		    if(_isSorted == false)
		    {
		        _happeningItems.sort(_timeFromNowAscendingSort);
		        _isSorted = true;
		    }
		
		    var filteredItems = [];
	        if(p_filterFunction == undefined)
	        {
		        for(var i = 0; i < _happeningItems.length; i++)
		        {
    		        filteredItems.push(_happeningItems[i]);
                }
	        }
	        else
	        {
		        for(var i = 0; i < _happeningItems.length; i++)
		        {
		            if(p_filterFunction(_happeningItems[i]) == true)
		            {
    		            filteredItems.push(_happeningItems[i]);
		            }
	            }
	        }
		    
		    return filteredItems;
		};
		
		
		this.convertAnnouncement = function(p_announcement)
		{
		    var happeningItem = new HappeningItem();
	        happeningItem.type = HappeningItem.ANNOUNCEMENT_TYPE;
		    happeningItem.id = happeningItem.type + "-" + p_announcement.id;
	        happeningItem.date = p_announcement.startDate;
	        happeningItem.dateFormatted = p_announcement.startDateFormatted;
	        happeningItem.timeFromNow = _getTimeFromNow(happeningItem.date);
	        happeningItem.subject = p_announcement.subject;
	        happeningItem.text = p_announcement.text;
	        happeningItem.courseId = p_announcement.courseId;
	        happeningItem.courseTitle = p_announcement.courseTitle;
	        happeningItem.domainObject = p_announcement;
		    
		    return happeningItem;
		};

		this.convertDropboxSubmission = function(p_submission)
		{
		    var happeningItem = new HappeningItem();
	        happeningItem.type = HappeningItem.DROPBOX_TYPE;
		    happeningItem.id = happeningItem.type + "-" + p_submission.id;
	        happeningItem.date = p_submission.submissionDate;
	        happeningItem.dateFormatted = p_submission.submissionDateFormatted;
	        happeningItem.timeFromNow = _getTimeFromNow(happeningItem.date);
	        happeningItem.subject = "Dropbox Submission: " + p_submission.submitterNameFormatted;
	        happeningItem.text = p_submission.basketTitle;
	        happeningItem.courseId = p_submission.courseId;
	        happeningItem.courseTitle = p_submission.courseTitle;
	        happeningItem.domainObject = p_submission;
		    
		    return happeningItem;
		};
		
		this.convertItemGrade = function(p_itemGrade)
		{
		    var happeningItem = new HappeningItem();
	        happeningItem.type = HappeningItem.GRADE_TYPE;
		    happeningItem.id = happeningItem.type + "-" + p_itemGrade.id;
	        happeningItem.date = p_itemGrade.updatedDate;
	        happeningItem.dateFormatted = p_itemGrade.updatedDateFormatted;
	        happeningItem.timeFromNow = _getTimeFromNow(happeningItem.date);
	        happeningItem.subject = "Grade: " + p_itemGrade.combinedGrade;
	        happeningItem.text = p_itemGrade.title;
	        happeningItem.courseId = p_itemGrade.courseId;
	        happeningItem.courseTitle = p_itemGrade.courseTitle;
	        happeningItem.domainObject = p_itemGrade;
		    
		    return happeningItem;
		};
		
		this.convertCourseItem = function(p_courseItem)
		{
            var title = "";
            if (p_courseItem.id == p_courseItem.parentId)   //if this is a unit don't display the title twice (e.g. title - title)
            {
                title = p_courseItem.title;
            }
            else
            {
                title = p_courseItem.parentTitle + " - " + p_courseItem.title;
            }

		    var happeningItem = new HappeningItem();
	        happeningItem.type = HappeningItem.COURSEITEM_TYPE;
		    happeningItem.id = happeningItem.type + "-" + p_courseItem.id;
	        happeningItem.date = p_courseItem.scheduledDate;
	        happeningItem.dateFormatted = p_courseItem.scheduledDateFormatted;
	        happeningItem.timeFromNow = _getTimeFromNow(happeningItem.date);
	        happeningItem.subject = p_courseItem.scheduledEventType + " " + p_courseItem.scheduledDateFormatted;
	        happeningItem.text = title;
	        happeningItem.courseId = p_courseItem.courseId;
	        happeningItem.courseTitle = p_courseItem.courseTitle;
	        happeningItem.domainObject = p_courseItem;
		    
		    return happeningItem;
		};
		
		this.convertTopic = function(p_userTopic)
		{
		    var happeningItem = new HappeningItem();
	        happeningItem.type = HappeningItem.THREADTOPIC_TYPE;
		    happeningItem.id = happeningItem.type + "-" + p_userTopic.id;
	        happeningItem.date = _getDateForTopic();
	        happeningItem.dateFormatted = "Since " + happeningItem.date.getFormattedDateTime();
	        happeningItem.timeFromNow = _getTimeFromNow(happeningItem.date);
	        happeningItem.subject = "Recent Discussion Responses: " + p_userTopic.responseCounts.last24HourResponseCount;
	        happeningItem.text = p_userTopic.containerInfo.contentItemTitle + " - " + p_userTopic.title;
	        happeningItem.courseId = p_userTopic.containerInfo.courseId;
	        happeningItem.courseTitle = p_userTopic.containerInfo.courseTitle;
	        happeningItem.domainObject = p_userTopic;
		    
		    return happeningItem;
		};

		this.convertResponse = function(p_response)
		{
		    var happeningItem = new HappeningItem();
	        happeningItem.type = HappeningItem.THREADRESPONSE_TYPE;
		    happeningItem.id = happeningItem.type + "-" + p_response.id;
	        happeningItem.date = p_response.postedDate;
	        happeningItem.dateFormatted = p_response.postedDateFormatted;
	        happeningItem.timeFromNow = _getTimeFromNow(happeningItem.date);
	        happeningItem.subject = "Unread Response to Your Post";
	        happeningItem.text = p_response.author.firstName + " " + p_response.author.lastName + ", " + p_response.title;
	        happeningItem.courseId = p_response.topic.containerInfo.courseId;
	        happeningItem.courseTitle = p_response.topic.containerInfo.courseTitle;
	        happeningItem.domainObject = p_response;
		    
		    return happeningItem;
		};
		
		
		this.thingsHappeningSoonFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.COURSEITEM_TYPE)
                return true;
            else    
                return false;
        };
        
        this.thingsThatHappenedFilter = function(p_item)
		{
            if(p_item.type != HappeningItem.COURSEITEM_TYPE)
                return true;
            else    
                return false;
        };

        this.announcementFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.ANNOUNCEMENT_TYPE)
                return true;
            else    
                return false;
        };

        this.gradeFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.GRADE_TYPE)
                return true;
            else    
                return false;
        };

        this.courseItemFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.COURSEITEM_TYPE)
                return true;
            else    
                return false;
        };
        
        this.discussionFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.THREADRESPONSE_TYPE || p_item.type == HappeningItem.THREADTOPIC_TYPE)
                return true;
            else    
                return false;
        };
        
        this.dropboxFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.DROPBOX_TYPE)
                return true;
            else    
                return false;
        };
	}
	
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific HappeningItemManager instance.
		@name		HappeningItemManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[HappeningItemManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the HappeningItemManager singleton.
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
