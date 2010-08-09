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
	<p>The ListViewManager class is a singleton that handles dynamically generating 
	the view (HTML) for topic items. This class is currently very tightly coupled to the view. 
	Changes to class names or ID's on the view may cause this class to stop functioning properly.</p>
*/
var ListViewManager = (function()
{
	/**
		The container of instances of the ListViewManager class.
		@private
	*/
	var _instances = {};
	
	/**
		The constructor function for the ListViewManager instance.
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
		var _listViewManager = this;
		
		/**
			A reference to the ViewStateManager instance which controls the view state of the Happenings Page.
			@private
		*/
		var _viewStateManager = ViewStateManager.getInstance();
		
		/**
			A reference to the DetailViewManager.
			@private
		*/
		var _detailViewManager = DetailViewManager.getInstance();
		
		/************************************
			Public Properties
		************************************/
		
		/**
			The type of list this instance is managing
			@type	String
			@default	""
		*/
		this.listType = "";
		
		/**
			The course ID (if one exists for the list) that this instance is managing
			@type	String
			@default	null
		*/
		this.courseId = null;
		
		/**
			The maximum number of items to initially display in the list.
			@type	Integer
			@default	5
		*/
        this.currentDisplayMax = 5;
        
        /**
			The maximum number of items to show when the more link is clicked.
			@type	Integer
			@default	10
		*/
        this.moreDisplayCount = 10;
        
		/************************************
			Private Methods
		************************************/
		
        var _getCssClassForItem = function(p_item, p_viewState)
        {
            var cssClass = "";

            if (p_viewState == ViewStateManager.VIEW_STATE_BY_TYPE)
		    {
		        cssClass = GENERIC_ITEM_CLASS_NAME;
		    }
		    else
		    {
                switch(p_item.type)
                {
                    case HappeningItem.ANNOUNCEMENT_TYPE:
                        cssClass = ANNOUNCEMENT_ITEM_CLASS_NAME;
                        break;
                    case HappeningItem.GRADE_TYPE:
                        cssClass = GRADE_ITEM_CLASS_NAME;
                        break;
                    case HappeningItem.COURSEITEM_TYPE:
                        cssClass = SCHEDULED_ITEM_CLASS_NAME;
                        break;
                    case HappeningItem.THREADRESPONSE_TYPE:
                        cssClass = UNREAD_RESPONSES_ITEM_CLASS_NAME;
                        break;
                    case HappeningItem.THREADTOPIC_TYPE:
                        cssClass = RECENT_RESPONSES_ITEM_CLASS_NAME;
                        break;
                    case HappeningItem.DROPBOX_TYPE:
                        cssClass = DROPBOX_ITEM_CLASS_NAME;
                        break;
                }
            }
            
            return cssClass;
        };		
        
        var _getViewFromListType = function(listType)
        {
            var view = "";
            
            switch(listType)
            {
                case ListViewManager.BY_DATE_HAPPENING_SOON:
                case ListViewManager.BY_DATE_THINGS_THAT_HAPPENED:
                    view = ViewStateManager.VIEW_STATE_BY_DATE;
                    break;
                case ListViewManager.BY_TYPE_ANNOUNCEMENTS:
                case ListViewManager.BY_TYPE_HAPPENING_SOON:
                case ListViewManager.BY_TYPE_GRADES:
                case ListViewManager.BY_TYPE_DROPBOX:
                case ListViewManager.BY_TYPE_DISCUSSIONS:
                    view = ViewStateManager.VIEW_STATE_BY_TYPE;
                    break;
                case ListViewManager.BY_COURSE:
                    view = ViewStateManager.VIEW_STATE_BY_COURSE;
                    break;
            }
            return view;
        };
        
        var _getContainerFromListType = function(listType)
        {
            var container = "";
            
            switch(listType)
            {
                case ListViewManager.BY_DATE_HAPPENING_SOON:
                    container = "THSContainer";
                    break;
                case ListViewManager.BY_DATE_THINGS_THAT_HAPPENED:
                    container = "TTHContainer";
                    break;
                case ListViewManager.BY_TYPE_ANNOUNCEMENTS:
                    container = "announcementsContainer";
                    break;
                case ListViewManager.BY_TYPE_HAPPENING_SOON:
                    container = "happeningSoonContainer";
                    break;
                case ListViewManager.BY_TYPE_GRADES:
                    container = "gradesContainer";
                    break;
                case ListViewManager.BY_TYPE_DROPBOX:
                    container = "dropboxSubmissionsContainer";
                    break;
                case ListViewManager.BY_TYPE_DISCUSSIONS:
                    container = "discussionsContainer";
                    break;
                case ListViewManager.BY_COURSE:
                     container = "course" + _listViewManager.courseId;  
                    break;
            }
            return container;
        };

        
        var _getItemListId = function(p_item)
        {
            return _listViewManager.listType + "-" + p_item.id + "-" + p_item.timeFromNow;
        };

		/**
		    Creates a clone of the template list item, and populates data for that list item.
		    @param	{HappeningItem}	p_item		    The item to render
		    @param	{String}		p_viewState		The view state that this item should be displayed on
	    */
	    var _createListItem = function(p_item, p_viewState)
	    {
		    VariableValidator.require(this, p_item, "HappeningItem");
		    VariableValidator.require(this, p_viewState, "string");
    		
		    var cssClass = _getCssClassForItem(p_item, p_viewState);		
    		
		    var clonedItem = $("#itemTemplate li").clone();
		    clonedItem.attr("id", _getItemListId(p_item));
		    clonedItem.addClass(cssClass);
		    clonedItem.find(".subject").html(p_item.subject);
		    clonedItem.find(".replytext").html(p_item.text);
		    clonedItem.find(".courseName").html(p_item.courseTitle);
		    clonedItem.find(".date").html(p_item.dateFormatted);
    		
		    clonedItem.bind("click", function(){_detailViewManager.displayDetailView(p_item);});

		    if (p_viewState == ViewStateManager.VIEW_STATE_BY_COURSE)
		    {
			    // since this is grouped by course, hide the course name for each individual item
			    clonedItem.find(".courseName").hide();
		    }
		    
		    return clonedItem;
	    };
		
		/************************************
			Public Methods
		************************************/
		
		/**
		    Displays as many of the provided items that it can under this list.  Note: This method 
		    depends on the items being sent to be in the same order every time this method is called.
		    @param	{Array}	p_items		The items to display in this list
	    */
		this.displayItems = function(p_items)
		{				
	        var currentView = _getViewFromListType(this.listType);
	        var containerId = _getContainerFromListType(this.listType);
	        var containerElement = $("#" + containerId);
	        
	        if(p_items.length == 0)
	        {
	            containerElement.find("li.none").show();
	        }
	        else
	        {   	
	            containerElement.find("li.none").hide();
	            
	            for(var i = 0; i < p_items.length; i++)
	            {
	                //First, if we're already past the number of items allowed to be displayed we can stop looping
	                if(i >= this.currentDisplayMax)
	                {
	                    break;
	                }
    	            
	                //Next, check to see if this item has already been rendered, and if so skip to the next one
	                var itemElement = $("#" + _getItemListId(p_items[i]));
	                if(itemElement.length > 0)
	                {
	                    itemElement.show();
	                    continue;
	                }
    	        
	                //Create the item
	                var item = _createListItem(p_items[i], currentView)
    	            
	                //Now figure out where to put it in the list.  If this is the first item, just append it to 
	                //the list.  Otherwise insert it after the element before it.
	                if(i == 0)
	                {
	                    item.prependTo(containerElement.find("ul.itemList"));
	                }
	                else
	                {
	                    item.insertAfter("#" + _getItemListId(p_items[i-1]));
	                }
	            }
    	        
	            //Make sure any items after the currentDisplayMax are hidden
	            var itemsToHide = containerElement.find("ul.itemList li:gt(" + (this.currentDisplayMax - 1) + ")");
	            itemsToHide.hide();
    	        
	            //Show the "more..." link, if needed
	            var numItemsLeft = p_items.length - this.currentDisplayMax;
                var moreElement = containerElement.find('ul.itemListFooter li.more');
	            if(numItemsLeft <= 0)
	            {
                    moreElement.hide();
	            }
	            else
	            {
	                if(numItemsLeft > this.moreDisplayCount)
	                {
	                    numItemsLeft = this.moreDisplayCount;
	                }
    	            
                    moreElement.children("a").html("Show " + numItemsLeft + " more...");
                    moreElement.show();
                    
                    //Store this instance of ListViewManager with the more link so 
                    //that it is easily accessible from the click event handler
                    moreElement.data("ListType", this.listType);
                    moreElement.data("CourseId", this.courseId);
	            }
	        }
		};
		
		/**
			Removes an item from the view.
			@param	{HappeningItem}	p_item	The item to remove
		*/
		this.removeItem = function(p_item)
		{
	        $("#" + _getItemListId(p_item)).remove();
		};
		
		/**
			Increases the list's display limit
		*/
		this.increaseItemDisplayLimit = function()
		{
		    this.currentDisplayMax = this.currentDisplayMax + this.moreDisplayCount;
		};
		
	}	
	
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific ListViewManager instance.
		@name		ListViewManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[ListViewManager]";
	}
	
	
	return new function()
	{
		/**
			Retrieves the instance of the ListViewManager singleton.
		*/
        this.getInstance = function(listType, courseId)
		{
		    var instanceId = listType;
		    if(courseId != undefined)
		    {
		        instanceId = instanceId + ":" + courseId;
		    }
		    var instance = _instances[instanceId];
		    
            if (instance == null || typeof(instance) == undefined)
			{
                instance = new PrivateConstructor();
                instance.constructor = null;
                instance.listType = listType;
                instance.courseId = (courseId != undefined) ? courseId : null;
                
                //The "Things That Happened" list needs to show 15 items initially
                if(listType == ListViewManager.BY_DATE_THINGS_THAT_HAPPENED)
                {
                    instance.currentDisplayMax = 15;
                }
                
                _instances[instanceId] = instance;
            }
            return instance;
        };
    }
	
})();

/************************************
	Static Properties
************************************/

/**
	Defines the list type for the Happening soon by date list.
	@static
	@type	String
	@default	"byDateHappeningSoon"
*/
ListViewManager.BY_DATE_HAPPENING_SOON = "byDateHappeningSoon";

/**
	Defines the list type for the Things that happened by date list.
	@static
	@type	String
	@default	"byDateThingsThatHappened"
*/
ListViewManager.BY_DATE_THINGS_THAT_HAPPENED = "byDateThingsThatHappened";

/**
	Defines the list type for the Announcements by type list.
	@static
	@type	String
	@default	"byTypeAnnouncements"
*/
ListViewManager.BY_TYPE_ANNOUNCEMENTS = "byTypeAnnouncements";

/**
	Defines the list type for the Happening soon by type list.
	@static
	@type	String
	@default	"byTypeHappeningSoon"
*/
ListViewManager.BY_TYPE_HAPPENING_SOON = "byTypeHappeningSoon";

/**
	Defines the list type for the Grades by type list.
	@static
	@type	String
	@default	"byTypeGrades"
*/
ListViewManager.BY_TYPE_GRADES = "byTypeGrades";

/**
	Defines the list type for the Dropbox by type list.
	@static
	@type	String
	@default	"byTypeDropbox"
*/
ListViewManager.BY_TYPE_DROPBOX = "byTypeDropbox";

/**
	Defines the list type for the Discussion by type list.
	@static
	@type	String
	@default	"byTypeDiscussions"
*/
ListViewManager.BY_TYPE_DISCUSSIONS = "byTypeDiscussions";

/**
	Defines the list type for the by course list.
	@static
	@type	String
	@default	"byCourse"
*/
ListViewManager.BY_COURSE = "byCourse";
