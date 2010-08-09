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
		
		/**
			Creates HappeningItems out of each collection of other items produced by all the Service Managers.
			@param	{Array}		p_items		The collection of items to be converted to HappeningItems and added to memory.
			@param	{Function}	p_conversionFunction	A function used to convert the collection of items to HappeningItems
		*/
		this.addItems = function(p_items, p_conversionFunction)
		{
		    for(var i = 0; i < p_items.length; i++)
		    {
		        _happeningItems.push(p_conversionFunction(p_items[i]));
		    }
		    
		    _isSorted = false;
		};
		
		/**
			Removes a HappeningItem from the collection of items based on the ID.
			@param	{String}	p_itemId	The ID of the HappeningItem
			@return	The HappeningItem that was removed
		*/
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
		
		/**
			Retrieves a collection of HappeningItems based on a filter function.
			@param	{Function}	p_FilterFunction	A method used to filter which items to retrun
			@return	{Array}	The collection of HappeningItems
		*/
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
		
		
		/**
			Converts a UserAnnouncement object to a HappeningItem and returns it.
			@param	{UserAnnouncement}	p_announcement	The UserAnnouncement to convert
			@return	{HappeningItem}	The HappeningItem based on the UserAnnouncement
		*/
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
		
		/**
			Converts a DropboxSubmission object to a HappeningItem and returns it.
			@param	{DropboxSubmission}	p_submission	The DropboxSubmission to convert
			@return	{HappeningItem}	The HappeningItem based on the DropboxSubmission
		*/
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
		
		/**
			Converts a ItemGrade object to a HappeningItem and returns it.
			@param	{ItemGrade}	p_itemGrade	The ItemGrade to convert
			@return	{HappeningItem}	The HappeningItem based on the ItemGrade
		*/
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
		
		/**
			Converts a CourseItem object to a HappeningItem and returns it.
			@param	{CourseItem}	p_courseItem	The CourseItem to convert
			@return	{HappeningItem}	The HappeningItem based on the CourseItem
		*/
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
		
		/**
			Converts a UserTopic object to a HappeningItem and returns it.
			@param	{UserTopic}	p_userTopic		The UserTopic to convert
			@return	{HappeningItem}	The HappeningItem based on the UserTopic
		*/
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

		/**
			Converts a UserResponse object to a HappeningItem and returns it.
			@param	{UserResponse}	p_response	The UserResponse to convert
			@return	{HappeningItem}	The HappeningItem based on the UserResponse
		*/
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
		
		
		/**
			Determines if a HappeningItem has a type of "CourseItem".
			@param	{HappeningItem}	p_item	The HappeningItem to check
			@return	{Boolean}	true if the Happening item matches the type, false otherwise
		*/
		this.thingsHappeningSoonFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.COURSEITEM_TYPE)
                return true;
            else    
                return false;
        };
        
        /**
			Determines if a HappeningItem has a type of "CourseItem".
			@param	{HappeningItem}	p_item	The HappeningItem to check
			@return	{Boolean}	true if the Happening item matches the type, false otherwise
		*/
        this.thingsThatHappenedFilter = function(p_item)
		{
            if(p_item.type != HappeningItem.COURSEITEM_TYPE)
                return true;
            else    
                return false;
        };
		
		/**
			Determines if a HappeningItem has a type of "Announcement".
			@param	{HappeningItem}	p_item	The HappeningItem to check
			@return	{Boolean}	true if the Happening item matches the type, false otherwise
		*/
        this.announcementFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.ANNOUNCEMENT_TYPE)
                return true;
            else    
                return false;
        };
		
		/**
			Determines if a HappeningItem has a type of "Grade".
			@param	{HappeningItem}	p_item	The HappeningItem to check
			@return	{Boolean}	true if the Happening item matches the type, false otherwise
		*/
        this.gradeFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.GRADE_TYPE)
                return true;
            else    
                return false;
        };
		
		/**
			Determines if a HappeningItem has a type of "CourseItem".
			@param	{HappeningItem}	p_item	The HappeningItem to check
			@return	{Boolean}	true if the Happening item matches the type, false otherwise
		*/
        this.courseItemFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.COURSEITEM_TYPE)
                return true;
            else    
                return false;
        };
        
        /**
			Determines if a HappeningItem has a type of "ThreadResponse" or ThreadTopic.
			@param	{HappeningItem}	p_item	The HappeningItem to check
			@return	{Boolean}	true if the Happening item matches the type, false otherwise
		*/
        this.discussionFilter = function(p_item)
		{
            if(p_item.type == HappeningItem.THREADRESPONSE_TYPE || p_item.type == HappeningItem.THREADTOPIC_TYPE)
                return true;
            else    
                return false;
        };
        
        /**
			Determines if a HappeningItem has a type of "Dropbox".
			@param	{HappeningItem}	p_item	The HappeningItem to check
			@return	{Boolean}	true if the Happening item matches the type, false otherwise
		*/
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
