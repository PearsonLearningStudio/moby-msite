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
/**
	@class
	@author		MacA
	
	@description
	<p>The ActiveTopicsViewManager class is a singleton that manages requests to the threads API.</p>
*/
var ActiveTopicsViewManager = (function()
{
	/**
		The singleton instance of the ActiveTopicsViewManager class.
		@private
	*/
	var _instance = null;
	
	/**
		The constructor function for the ActiveTopicsViewManager instance.
		@private
	*/
	function PrivateConstructor()
	{
		/************************************
			Private Properties
		************************************/
		
		/**
			Indicates whether or not all data has been loaded for this view
			@type		Boolean
			@default	false
		*/
		var _loadCompleted = false;
		
		
		/************************************
			Private Methods
		************************************/
		
		/**
			Creates a clone of the course template to be used on the main discussions screen.
			@param		{Course}	p_course	The course to include in the list.
			@return		{jQuery}			The jQuery object representing the new clone, with the course data.
		*/
		var _createCourseElementClone = function(p_course, p_allTopicsClickHandler)
		{
			var clonedItem = $("#topicCourseTemplate").children().clone();
			clonedItem.attr("id", "disc-course" + p_course.id);
			clonedItem.find("span.courseTitleHeader").html(p_course.title);
			clonedItem.find("span.moreCourseTitle").html(p_course.title);
			clonedItem.find("ul").attr("title", p_course.title);
			clonedItem.find("ul.courseTopicListFooter li.more a").bind("click", p_course.id, p_allTopicsClickHandler);

			return clonedItem;
		};

		/**
			Creates a clone of the unit header template to be used on the main discussions screen.
			@param		{ContainerInfo}	p_containerInfo	Information on the topic's parents.
			@return		{jQuery}			The jQuery object representing the new clone.
		*/
		var _createUnitHeaderElementClone = function(p_unitNumber, p_unitHeader, p_unitTitle)
		{
			//Construct the unit header that should be displayed
			var unitHeader = "";
		
			if(p_unitNumber == 0)
			{
				//If this is course home, just display "Course Home"
				unitHeader = p_unitTitle;
			}
			else
			{
				//Otherwise, display the full unit header, e.g. "Unit 2: Discussions"
				unitHeader = p_unitHeader + " " + p_unitNumber + ": " + p_unitTitle;
			}
			
			//Clone the template and set the html
			var clonedItem = $("#unitHeaderTemplate").children().clone();
			clonedItem.html(unitHeader);
			
			//Start the unit header out hidden since it shouldn't be displayed on the main view
			clonedItem.hide();
			
			return clonedItem;
		};

		/**
			Creates a clone of the topic template to be used on the main discussions screen.
			@param		{Topic}	p_topic		The topic to include in the list.
			@return		{jQuery}			The jQuery object representing the new clone.
		*/
		var _createTopicElementClone = function(p_topic)
		{
			var topicTitle = p_topic.containerInfo.contentItemTitle + " - " + p_topic.title;
		
			var clonedItem = $("#topicItemTemplate").children().clone();
			clonedItem.attr("id", "topic" + p_topic.id);
			clonedItem.find(".subject").html(topicTitle);
			return clonedItem;
		};

		/**
			Creates a clone of the topic template to be used on the main discussions screen.
			@param		{Topic}	p_topic		The topic to include in the list.
			@return		{jQuery}			The jQuery object representing the new clone.
		*/
		var _createClosedThreadClone = function(p_courseItem)
		{
		    var closedMessage = "";
		    
            var currentDate = new Date();

		    if (p_courseItem.startDate > currentDate && p_courseItem.canAccessBeforeStartDate == false)
		    {
			    closedMessage = "(Closed until " + p_courseItem.startDateISO8601.toDate().getFormattedDate() + ")";
		    }
		    else if (p_courseItem.endDate < currentDate && p_courseItem.canAccessAfterEndDate == false)
		    {
			    closedMessage = "(Closed since " + p_courseItem.endDateISO8601.toDate().getFormattedDate()+ ")";
		    }

			var clonedItem = $("#closedThreadTemplate").children().clone();
			clonedItem.find(".subject").html(p_courseItem.title);
			clonedItem.find(".replies").html(closedMessage);
			return clonedItem;
		};
		
		/**
			Creates a clone of the topic response counts template to be used on the main discussions screen.
			@param		{ResponseCounts}	p_responseCounts	The response counts to include in the list.
			@return		{jQuery}			The jQuery object representing the new clone, with the course data.
		*/
		var _createTopicResponseCountsElementClone = function(p_responseCounts)
		{
			//We need to display different html based on if there are responses or not
			var clonedItem;
			if(p_responseCounts.totalResponseCount == 0)
			{
				clonedItem = $("#topicNoResponseCountsTemplate").children().clone();
			}
			else
			{
				clonedItem = $("#topicResponseCountsTemplate").children().clone();
				clonedItem.find(".last24HourResponseCount").html(_getResponsesText(p_responseCounts.last24HourResponseCount, "response"));
				clonedItem.find(".personalResponseCount").html(_getResponsesText(p_responseCounts.personalResponseCount, "response"));
				clonedItem.find(".totalResponseCount").html(_getResponsesText(p_responseCounts.totalResponseCount, "Response"));
				clonedItem.find(".unreadResponseCount").html(p_responseCounts.unreadResponseCount);
				
				//If there are unread responses, then change the background color to signify this
				if(p_responseCounts.unreadResponseCount > 0)
				{
					clonedItem.filter(".replies").attr("class", "repliesunread");
				}
			}
			return clonedItem;
		};
		
		/**
			Creates a clone of the topic response counts template to be used on the main discussions screen.
			@param		{Number}	p_responseCount	The number of responses.
			@param		{string}	p_responseLabel	The label for the response.  Either "response" or "Response".
			@return		{String}			The count and the label put together.  Ex. "1 response", "4 Responses" etc.
		*/
		var _getResponsesText = function(p_responseCount, p_responseLabel)
		{
			if(p_responseCount != 1)
			{
				p_responseLabel = p_responseLabel + "s";
			}
			
			return p_responseCount + " " + p_responseLabel;
		}
		

		/************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
		************************************/
		
		
		/************************************
			Public Methods
		************************************/
		
		/**
			Handles any initialization needed by the view manager, such as wiring up event handlers.
		*/
		this.initialize = function()
		{
		};
		
		/**
			Updates the response count numbers on the UI for a specified Topic.
			@param	{String}	p_topicId	The ID of the topic to update
			@param	{ResponseCounts}	p_responseCounts	The new response counts for the Topic
		*/
		this.updateResponseCountsOnView = function(p_topicId, p_responseCounts)
		{
			var topicReponseCounts = $("#topic" + p_topicId);
			topicReponseCounts.find(".last24HourResponseCount").html(_getResponsesText(p_responseCounts.last24HourResponseCount, "response"));
			topicReponseCounts.find(".personalResponseCount").html(_getResponsesText(p_responseCounts.personalResponseCount, "response"));
			topicReponseCounts.find(".totalResponseCount").html(_getResponsesText(p_responseCounts.totalResponseCount, "Response"));
			topicReponseCounts.find(".unreadResponseCount").html(p_responseCounts.unreadResponseCount);
			if (p_responseCounts.unreadResponseCount > 0)
			{
				topicReponseCounts.find("span.repliesunread, span.replies").removeClass('replies').addClass('repliesunread');
			}
			else
			{
				topicReponseCounts.find("span.repliesunread, span.replies").removeClass('repliesunread').addClass('replies');
			}
		};
		
		/**
			Creates the course elements on the UI and assigns click handlers for each course.
			@param	{Array}		p_courses	The collection of Course objects to create UI elements for
			@param	{Function}	p_allTopicsClickHandler		A function to be called when the user clicks the 
															"All ..." link for a given course
		*/
		this.createCoursesOnView = function(p_courses, p_allTopicsClickHandler)
		{
			for(var i = 0; i < p_courses.length; i++)
			{	
				//First, add the course to the course list dropdown
				$("#discussionsByCourseFilter").append("<option value='" + p_courses[i].id + "'>" + p_courses[i].title + "</option>");

				//Then create a new div for the course
				var clonedCourseItem = _createCourseElementClone(p_courses[i], p_allTopicsClickHandler);
				clonedCourseItem.appendTo("#courseTopics");
			}
		
		};
		
		/**
			Creates the discussions elements on the UI and assigns click handlers for each item.
			@param	{Array}		p_discussionItems	The collection of discussion items to add.
			@param	{Array}		p_courses			The collection of course objects
			@param	{Function}	p_topicClickHandler	The callback function for when a topic is clicked
		*/
		this.createDiscussionItemsOnView = function(p_discussionItems, p_courses, p_topicClickHandler)
		{		
			var coursesWithTopics = [];
			var currentCourseId = -1;
			var currentUnitNumber = -1;
			var courseActiveTopicCount = {};
			
			for (var i = 0; i < p_discussionItems.length; i++)
			{
			    //If it isn't there already add this course to the list of courses that have items
			    if(courseActiveTopicCount[p_discussionItems[i].courseId] == undefined)
			    {
			        courseActiveTopicCount[p_discussionItems[i].courseId] = 0;
			    }
			
				//If this item is under a new unit, display the unit header
				if(p_discussionItems[i].courseId != currentCourseId || p_discussionItems[i].unitNumber != currentUnitNumber) 
				{
					currentCourseId = p_discussionItems[i].courseId;
					currentUnitNumber = p_discussionItems[i].unitNumber;
					
					var clonedUnitHeader = _createUnitHeaderElementClone(p_discussionItems[i].unitNumber, p_discussionItems[i].unitHeader, p_discussionItems[i].unitTitle);
					clonedUnitHeader.appendTo("#disc-course" + p_discussionItems[i].courseId + " ul.courseTopicList");
				}
			
			    var clonedItem = null;
			    if(p_discussionItems[i].itemType == "ActiveTopic" || p_discussionItems[i].itemType == "InactiveTopic")
			    {
			        var topic = p_discussionItems[i].item;
				    clonedItem = _createTopicElementClone(topic);
    				
				    //Attach an event handler for when the user clicks on the topic
				    clonedItem.find("a").bind("click", topic, p_topicClickHandler);
    				
				    if(topic.isActive() == true)
				    {
				        courseActiveTopicCount[p_discussionItems[i].courseId]++;
				    }
				    else
				    {
				        //If this topic isn't active then hide it
					    clonedItem.addClass("fullCourseOnlyTopic");
					    clonedItem.hide();
				    }

				    var clonedResponseCounts = _createTopicResponseCountsElementClone(topic.responseCounts);
				    clonedItem.find("a").append(clonedResponseCounts);
				}
				else //If it's not an activeTopic or InactiveTopic, then it is a ClosedThread
				{
			        var courseItem = p_discussionItems[i].item;
				    clonedItem = _createClosedThreadClone(courseItem);
				}
	
				//Insert the topic at the end of the list
				clonedItem.appendTo("#disc-course" + p_discussionItems[i].courseId + " ul.courseTopicList");
			}		
			
			//Make sure the appropriate messages and links are displayed under each course
			for(var i = 0; i < p_courses.length; i++)
			{
			    var courseId = p_courses[i].id;
			    
			    //Check to see if this course has any items under it
			    if(courseActiveTopicCount[courseId] == undefined)
			    {
			        //Add the "No Discussions" message to all courses that don't have any topics
			        var noDiscussionsMessage = $("#noDiscussionsTemplate").html();
			        $("#disc-course" + courseId + " ul.courseTopicList").append(noDiscussionsMessage);
        			
			        //Remove the 'all' link from all courses that don't have any topics
			        $("#disc-course" + courseId + " li.more").remove();  
			    }
			    else
			    {
			        if(courseActiveTopicCount[courseId] == 0)
			        {
			            //Add the "No Active Topics" message to all courses that don't have any active topics
			            var noActiveTopicsMessage = $("#noActiveTopicsTemplate").html();
			            $("#disc-course" + courseId + "  ul.courseTopicList").append(noActiveTopicsMessage);
			        }
    			    
		            //Show the "all" link under each course that has topics
		            $("#disc-course" + courseId + " li.more").show();
			    }
			}
			
			//Hide the "ajax-loading" gifs on the courses
			$("#discussionsContentContainer li.cathd span.ajaxLoadingHeader").hide();

			_loadCompleted = true;
		};
		
		/**
			Displays the view for active topics.
			@param	{String}	[p_filteredCourseId]	A course ID to filter by
		*/
		this.show = function(p_filteredCourseId)
		{
			//Display the dropdown list
			$("#discussionsCourseDropdownContainer").show();
			
			//Hide the back button
			$("#discussionsBackButtonContainer").hide();
			
			//Show the course list
			$("#courseTopics").show();
			
			//Hide the responses by topic div
			$("#responsesByTopic").hide();
			
			//Show all courses
			$('#courseTopics .module_bgroup').show();
			
			//Hide all topics that should only be displayed on the full course screen
			$(".fullCourseOnlyTopic").hide();
			
			//Hide all topics that are not part of the current filtration,
			//or update filtration drop-down to match view.
            if (p_filteredCourseId != null && p_filteredCourseId != undefined && p_filteredCourseId != "0")
		        $("#courseTopics .module_bgroup:not(#disc-course" + p_filteredCourseId + ")").hide();
			if (p_filteredCourseId == "0")
			    $("#discussionsByCourseFilter").val("0");
			
			//Show the 'all' link under all courses if the view is done loading
			if(_loadCompleted == true)
			{
			    $("ul.courseTopicListFooter li.more").show();
            }
            
            //Show the 'no active topics' message under all courses that have it
			$("li.none:has(span.noActiveTopics)").show();
            
			//Hide the unit headers
			$(".unitHeading").hide();
			
			//Hide any closed threads
			$(".closedtopic").hide();
		};
		
		/**
			Hides the view for active topics.
		*/
		this.hide = function()
		{
			//Hide the dropdown list
			$("#discussionsCourseDropdownContainer").hide();
			
			//Show the back button
			$("#discussionsBackButtonContainer").show();
			
			//Hide the course list
			$("#courseTopics").hide();
		};
		
	}
	
	
	/************************************
		Public Prototype Methods
	************************************/
	/**
		Returns information about the specific ActiveTopicsViewManager instance.
		@name		ActiveTopicsViewManager#toString
		@function
		@return		{String}	The class name
		
	*/
	PrivateConstructor.prototype.toString = function()
	{
		return	"[ActiveTopicsViewManager]";
	}
	
	return new function()
	{
		/**
			Retrieves the instance of the ActiveTopicsViewManager singleton.
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
