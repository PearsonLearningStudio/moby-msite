/**
	@class
	@author		MacA
	
	@description
	<p>The CourseItemsServiceManager class is a singleton that manages requests to the CourseItems web service. 
	A successful response will generate a collection of Announcement objects, sorted by start date (descending), 
	and pass that collection to the "onLoadComplete" method.</p>
	
	@requires	VariableValidator.js
				AjaxManager.js
*/
var CourseItemsServiceManager = (function()
{
    /**
    The singleton instance of the CourseItemsServiceManager class.
    @private
    */
    var _instance = null;

    /**
    The constructor function for the CourseItemsServiceManager instance.
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
			A dictionary that maps transaction ID's to callback functions that need to be called when the request is complete.
			@default	{}
			@private
        */
        var _callbacksFromTransactionIds = {};


        /**
			The collection of CourseItem objects. CourseItems are created and stored in this 
			collection after a successful ajax response.
			@default	[]
			@private
        */
        var _courseItems = [];
        
        
        /**
            
        */
        var _dateCurrent = new Date();
        
        
        /**
            
        */
        var _dateSpanStart = new Date(_dateCurrent.getFullYear(), _dateCurrent.getMonth(), _dateCurrent.getDate());
        
        
        /**
        
        */
        var _dateSpanEnd = new Date(_dateCurrent.getFullYear(), _dateCurrent.getMonth(), _dateCurrent.getDate() + 8);
              

        /**
			A collection of Course objects that the user is enrolled in. This is used to associate a course ID and title to a UserAnnouncement object.
				
			@type		Array
			@default	[]
        */
        this.courses = [];

        /**
			The base URL for the course items service. Ex: "http://courseitems-api.ecollege.com"
			
			@type		String
			@default	""
        */
        this.serviceLocation = "";

        /************************************
        Private Methods
        ************************************/
        /**
			A sorting method used to sort courseitem objects by startDate.
			@param		{Announcement}	p_courseitemA		The first Announcement to compare.
			@param		{Announcement}	p_courseitemB		The second Announcement to compare.
			@return		{Integer}		The difference between the start dates.
			@private
        */
        var _compareStartDates = function(p_courseitemA, p_courseitemB)
        {
            // sort descending
            return p_courseitemB.startDate - p_courseitemA.startDate;
        };

        /**
			Handles a successful ajax request and creates CourseItem objects from the JSON data returned.
			After the CourseItems are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
        */
        var _restrictedCourseItemsByContentTypeSuccessHandler = function(p_data, p_transactionId)
        {
			_wmm.measure("Moby.Scheduler.RestrictedItems.Service", "scheduler.restrictedItems");
            courseItems = [];

            for (var i = 0; i < p_data.courses.length; i++)
            {
                var parentCourse = p_data.courses[i];

                if (parentCourse.structure.items != undefined)
                {
                    for (var j = 0; j < parentCourse.structure.items.length; j++)
                    {
                        var parentItem = parentCourse.structure.items[j];

                        if (parentItem.items != undefined)
                        {

                            for (var k = 0; k < parentItem.items.length; k++)
                            {
                                var childItem = parentItem.items[k];


                                //We only care about items that have a schedule and access restrictions set
                                if (childItem.schedule != undefined && childItem.access != undefined)
                                {
                                    var itemSchedule = childItem.schedule;

                                    //Check to see if this item is before it's start date and access is restricted
                                    if (itemSchedule.startDateTime != null && itemSchedule.startDateTime != undefined && itemSchedule.startDateTime != "")
                                    {
                                        var itemStartDate = itemSchedule.startDateTime.toDate();

                                        if (itemStartDate > _dateCurrent && childItem.access.canAccessBeforeStartDateTime == false)
                                        {
                                            courseItems.push(_createCourseItem(childItem, parentItem, parentCourse));
                                        }

                                    }

                                    //Check to see if this item is after it's end date and access is restricted
                                    if (itemSchedule.startDateTime != null && itemSchedule.startDateTime != undefined && itemSchedule.startDateTime != "")
                                    {
                                        var itemEndDate = itemSchedule.endDateTime.toDate();

                                        if (itemEndDate < _dateCurrent && childItem.access.canAccessAfterEndDateTime == false)
                                        {
                                            courseItems.push(_createCourseItem(childItem, parentItem, parentCourse));
                                        }

                                    }
                                }

                            }
                        }
                    }
                }
            }

            courseItems.sort(_compareStartDates);

            _callbacksFromTransactionIds[p_transactionId](courseItems);
        };


        var _courseItemsDueSuccessHandler = function(p_data, p_transactionId)
        {
			_wmm.measure("Moby.Scheduler.DueItems.Service", "scheduler.dueItems");
            _courseItems = [];


            for (var i = 0; i < p_data.courses.length; i++)
            {
                var parentCourse = p_data.courses[i];

                if (parentCourse.structure.items != undefined)
                {
                    for (var j = 0; j < parentCourse.structure.items.length; j++)
                    {
                        var unitIsInRange = false;
                        var parentItem = parentCourse.structure.items[j]; ;

                        //TODO: clean up. make this a function
                        if (parentItem.schedule != undefined)
                        {


                            if (parentItem.schedule.dueDate != null && parentItem.schedule.dueDate != undefined && parentItem.schedule.dueDate != "")
                            {
                                var dueDate = parentItem.schedule.dueDate.toDate();

                                if (dueDate > _dateSpanStart && dueDate < _dateSpanEnd)
                                {
                                    unitIsInRange = true;
                                    _courseItems.push(_createDueItem(parentItem, parentItem, parentCourse));
                                }

                            }

                        }
                        if (parentItem.items != undefined)
                        {

                            for (var k = 0; k < parentItem.items.length; k++)
                            {
                                var childItemIsInRange = false;
                                var childItem = parentItem.items[k];
                                if (childItem.schedule != undefined)
                                {
                                    var itemSchedule = childItem.schedule;

                                    if (itemSchedule.dueDate != null && itemSchedule.dueDate != undefined && itemSchedule.dueDate != "")
                                    {
                                        var dueDate = itemSchedule.dueDate.toDate();

                                        if (dueDate > _dateSpanStart && dueDate < _dateSpanEnd)
                                        {
                                            childItemIsInRange = true;
                                            _courseItems.push(_createDueItem(childItem, parentItem, parentCourse));
                                        }

                                    }

                                }
                            }
                        }

                    }
                }
            }

            _courseItems.sort(_compareStartDates);
            _callbacksFromTransactionIds[p_transactionId](_courseItems);

        };


        var _courseItemsStartingSuccessHandler = function(p_data, p_transactionId)
        {
			_wmm.measure("Moby.Scheduler.StartItems.Service", "scheduler.startItems");
            _courseItems = [];

            for (var i = 0; i < p_data.courses.length; i++)
            {
                var parentCourse = p_data.courses[i];

                if (parentCourse.structure.items != undefined)
                {
                    for (var j = 0; j < parentCourse.structure.items.length; j++)
                    {
                        var unitIsInRange = false;
                        var parentItem = parentCourse.structure.items[j];

                        //TODO: clean up. make this a function
                        if (parentItem.schedule != undefined)
                        {


                            if (parentItem.schedule.startDateTime != null && parentItem.schedule.startDateTime != undefined && parentItem.schedule.startDateTime != "")
                            {
                                var startDate = parentItem.schedule.startDateTime.toDate();

                                if ((startDate > _dateSpanStart && startDate < _dateSpanEnd))
                                {
                                    unitIsInRange = true;
                                }

                            }

                        }
                        if (parentItem.items != undefined)
                        {

                            for (var k = 0; k < parentItem.items.length; k++)
                            {
                                var childItemIsInRange = false;
                                var childItem = parentItem.items[k];
                                if (childItem.schedule != undefined)
                                {
                                    var itemSchedule = childItem.schedule;

                                    if (itemSchedule.startDateTime != null && itemSchedule.startDateTime != undefined && itemSchedule.startDateTime != "")
                                    {
                                        var startDate = itemSchedule.startDateTime.toDate();

                                        if ((startDate > _dateSpanStart && startDate < _dateSpanEnd))
                                        {
                                            childItemIsInRange = true;
                                            _courseItems.push(_createStartsItem(childItem, parentItem, parentCourse));
                                        }

                                    }

                                }
                                if (!childItemIsInRange && unitIsInRange)
                                {
                                    _courseItems.push(_createStartsItem(childItem, parentItem, parentCourse, true));
                                }

                            }
                        }

                    }
                }
            }

            _courseItems.sort(_compareStartDates);
            _callbacksFromTransactionIds[p_transactionId](_courseItems);

        };




        var _courseItemsEndingSuccessHandler = function(p_data, p_transactionId)
        {
			_wmm.measure("Moby.Scheduler.EndItems.Service", "scheduler.endItems");
            _courseItems = [];


            for (var i = 0; i < p_data.courses.length; i++)
            {
                var parentCourse = p_data.courses[i];

                if (parentCourse.structure.items != undefined)
                {
                    for (var j = 0; j < parentCourse.structure.items.length; j++)
                    {
                        var unitIsInRange = false;
                        var parentItem = parentCourse.structure.items[j];

                        if (parentItem.schedule != undefined)
                        {
                            if (parentItem.schedule.endDateTime != null && parentItem.schedule.endDateTime != undefined && parentItem.schedule.endDateTime != "")
                            {
                                var endDate = parentItem.schedule.endDateTime.toDate();

                                if (endDate > _dateSpanStart && endDate < _dateSpanEnd)
                                {
                                    unitIsInRange = true;
                                }

                            }

                        }
                        if (parentItem.items != undefined)
                        {

                            for (var k = 0; k < parentItem.items.length; k++)
                            {
                                var childItemIsInRange = false;
                                var childItem = parentItem.items[k];
                                if (childItem.schedule != undefined)
                                {
                                    var itemSchedule = childItem.schedule;

                                    if (itemSchedule.endDateTime != null && itemSchedule.endDateTime != undefined && itemSchedule.endDateTime != "")
                                    {
                                        var endDate = itemSchedule.endDateTime.toDate();

                                        if (endDate > _dateSpanStart && endDate < _dateSpanEnd)
                                        {
                                            childItemIsInRange = true;
                                            _courseItems.push(_createEndsItem(childItem, parentItem, parentCourse));
                                        }

                                    }

                                }

                                if (!childItemIsInRange && unitIsInRange)
                                {
                                    _courseItems.push(_createEndsItem(childItem, parentItem, parentCourse, true));
                                }

                            }
                        }

                    }
                }
            }

            _courseItems.sort(_compareStartDates);
            _callbacksFromTransactionIds[p_transactionId](_courseItems);

        };








        /**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
        */
        var _courseItemsErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
        {
            _courseItems = null;
            if (p_statusCode == "401")
            {
                // get new token and try again
            }
            else
            {
                //_instance.onLoadComplete(_courseItems);
                _callbacksFromTransactionIds[p_transactionId](_courseItems);
            }
        };

        var _createItemSansDates = function(p_courseItemData, p_parentCourseItemData, p_parentCourseData)
        {
            var courseItem = new CourseItem();
            courseItem.id = p_courseItemData.id;
            courseItem.courseId = p_parentCourseData.id;
            courseItem.courseTitle = p_parentCourseData.title;
            courseItem.orderNumber = p_courseItemData.orderNumber;
            courseItem.parentId = p_parentCourseItemData.id;
            courseItem.parentTitle = p_parentCourseItemData.title;
            courseItem.parentOrderNumber = p_parentCourseItemData.orderNumber;

            if (p_parentCourseData.unitHeader != undefined)
            {
                courseItem.unitHeader = p_parentCourseData.unitHeader;
            }

            courseItem.title = p_courseItemData.title;
            courseItem.contentType = p_courseItemData.contentType;
            if (p_courseItemData.access != null && p_courseItemData.access != undefined && p_courseItemData.access != "")
            {
                courseItem.canAccessBeforeStartDate = p_courseItemData.access.canAccessBeforeStartDateTime;
                courseItem.canAccessAfterEndDate = p_courseItemData.access.canAccessAfterEndDateTime;
            }
            return courseItem;

        }

        var _createStartsItem = function(p_courseItemData, p_parentCourseItemData, p_parentCourseData, p_useUnitStartDates)
        {

            var courseItem = _createItemSansDates(p_courseItemData, p_parentCourseItemData, p_parentCourseData);

            var sched;
            if (p_useUnitStartDates)
            {
                sched = p_parentCourseItemData.schedule;
            }
            else
            {
                sched = p_courseItemData.schedule;
            }

            courseItem.scheduledDateISO8601 = sched.startDateTime;
            courseItem.scheduledDate = sched.startDateTime.toDate().getTime();
            courseItem.scheduledDateFormatted = sched.startDateTime.toDate().getFormattedDaysFromNow();
            courseItem.scheduledEventType = "Starts";

            courseItem.startDateISO8601 = sched.startDateTime;
            courseItem.startDate = sched.startDateTime.toDate().getTime();
            courseItem.startDateFormatted = sched.startDateTime.toDate().getFormattedDaysFromNow();


            return courseItem;
        };


        /**
        Creates a UserAnnouncement object from the announcement data returned by the web service.
        @param		{Object}			p_announcementData		The announcement data in the form of a JSON object
        @param		{String}			p_courseId				The course ID associated with this announcement
        @param		{String}			p_courseTitle			The course title associated with this announcement
        @return		{UserAnnouncement}	The newly created UserAnnouncement object
        */
        var _createEndsItem = function(p_courseItemData, p_parentCourseItemData, p_parentCourseData, p_useUnitStartDates)
        {

            var courseItem = _createItemSansDates(p_courseItemData, p_parentCourseItemData, p_parentCourseData);


            var sched;

            if (p_useUnitStartDates)
            {
                sched = p_parentCourseItemData.schedule;
            }
            else
            {
                sched = p_courseItemData.schedule;
            }
            courseItem.scheduledDateISO8601 = sched.endDateTime;
            courseItem.scheduledDate = sched.endDateTime.toDate().getTime();
            courseItem.scheduledDateFormatted = sched.endDateTime.toDate().getFormattedDaysFromNow();
            courseItem.scheduledEventType = "Ends";

            courseItem.endDateISO8601 = sched.endDateTime;
            courseItem.endDate = sched.endDateTime.toDate().getTime();
            courseItem.endDateFormatted = sched.endDateTime.toDate().getFormattedDaysFromNow();

            return courseItem;
        };



        /**
        Creates a UserAnnouncement object from the announcement data returned by the web service.
        @param		{Object}			p_announcementData		The announcement data in the form of a JSON object
        @param		{String}			p_courseId				The course ID associated with this announcement
        @param		{String}			p_courseTitle			The course title associated with this announcement
        @return		{UserAnnouncement}	The newly created UserAnnouncement object
        */
        var _createDueItem = function(p_courseItemData, p_parentCourseItemData, p_parentCourseData)
        {

            var courseItem = _createItemSansDates(p_courseItemData, p_parentCourseItemData, p_parentCourseData);
            var sched;
            sched = p_courseItemData.schedule;
            courseItem.scheduledDateISO8601 = sched.dueDate;
            courseItem.scheduledDate = sched.dueDate.toDate().getTime();
            courseItem.scheduledDateFormatted = sched.dueDate.toDate().getFormattedDaysFromNow();
            courseItem.scheduledEventType = "Due";

            courseItem.dueDateISO8601 = sched.dueDate;
            courseItem.dueDate = sched.dueDate.toDate().getTime();
            courseItem.dueDateFormatted = sched.dueDate.toDate().getFormattedDaysFromNow();

            return courseItem;
        };


        /**
        Creates a CourseItem object from the data returned by the web service.
        @param		{Object}			p_courseItemData		The course item data in the form of a JSON object
        @param		{Object}			p_parentCourseItemData	The parent of the course item in the form of a JSON object
        @param		{Object}			p_parentCourseData		The course of the course item in the form of a JSON object
        @return		{CourseItem}	The newly created CourseItem object
        */
        var _createCourseItem = function(p_courseItemData, p_parentCourseItemData, p_parentCourseData)
        {
            var courseItem = new CourseItem();
            courseItem.id = p_courseItemData.id;
            courseItem.courseId = p_parentCourseData.id;
            courseItem.courseTitle = p_parentCourseData.title;
            courseItem.orderNumber = p_courseItemData.orderNumber;
            courseItem.parentId = p_parentCourseItemData.id;
            courseItem.parentTitle = p_parentCourseItemData.title;
            courseItem.parentOrderNumber = p_parentCourseItemData.orderNumber;

            if (p_parentCourseData.unitHeader != undefined)
            {
                courseItem.unitHeader = p_parentCourseData.unitHeader;
            }
            //TODO: build the correct title according to the parent item (unit title) and header.
            courseItem.title = p_courseItemData.title;
            courseItem.contentType = p_courseItemData.contentType;
            if (p_courseItemData.schedule != null && p_courseItemData.schedule != undefined && p_courseItemData.schedule != "")
            {
                if (p_courseItemData.schedule.startDateTime != null && p_courseItemData.schedule.startDateTime != undefined && p_courseItemData.schedule.startDateTime != "")
                {
                    courseItem.startDateISO8601 = p_courseItemData.schedule.startDateTime;
                    courseItem.startDate = p_courseItemData.schedule.startDateTime.toDate().getTime();
                    courseItem.startDateFormatted = p_courseItemData.schedule.startDateTime.toDate().getFormattedDateTime();
                }
                if (p_courseItemData.schedule.endDateTime != null && p_courseItemData.schedule.endDateTime != undefined && p_courseItemData.schedule.endDateTime != "")
                {
                    courseItem.endDateISO8601 = p_courseItemData.schedule.endDateTime;
                    courseItem.endDate = p_courseItemData.schedule.endDateTime.toDate().getTime();
                    courseItem.endDateFormatted = p_courseItemData.schedule.endDateTime.toDate().getFormattedDateTime();
                }
                if (p_courseItemData.schedule.dueDate != null && p_courseItemData.schedule.dueDate != undefined && p_courseItemData.schedule.dueDate != "")
                {
                    courseItem.dueDateISO8601 = p_courseItemData.schedule.dueDate;
                    courseItem.dueDate = p_courseItemData.schedule.dueDate.toDate().getTime();
                    courseItem.dueDateFormatted = p_courseItemData.schedule.dueDate.toDate().getFormattedDateTime();
                }
            }

            if (p_courseItemData.access != null && p_courseItemData.access != undefined && p_courseItemData.access != "")
            {
                courseItem.canAccessBeforeStartDate = p_courseItemData.access.canAccessBeforeStartDateTime;
                courseItem.canAccessAfterEndDate = p_courseItemData.access.canAccessAfterEndDateTime;
            }

            return courseItem;
        };




        /************************************
			Public Methods
        ************************************/
        /**
			Makes a request to get user-specific CourseItems.
			
			@param	{String}	p_courseIds			The course IDs to get the course list for.
			@param	{Array}		p_requestHeaders	An array of AjaxRequestHeader objects to attach to the request.
        */

        this.getCourseItemsByUserContentTypesAndCourseIds_WithDatesStartingBetween = function(p_userId, p_courseIds, p_contentTypes, p_startsAfterDate, p_startsBeforeDate, p_requestHeaders, p_callback)
        {
            VariableValidator.require(this, p_courseIds, "string");
            VariableValidator.optional(this, p_requestHeaders, "Array");
            _wmm.mark("scheduler.startItems");
            //            var d = new Date();
            //            var startDate = d.getUTCFullYear() + "-" + (parseInt(d.getUTCMonth()) + 1) + "-" + d.getUTCDate();
            //            d.setDate(d.getDate() + 7);
            //            var endDate = d.getUTCFullYear() + "-" + (parseInt(d.getUTCMonth()) + 1) + "-" + d.getUTCDate();
            var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/usercoursestructure?courses=" + p_courseIds + "&expand=course;items;schedule&contentTypes=" + p_contentTypes + "&itemsstartbetween=" + p_startsAfterDate + ";" + p_startsBeforeDate, p_requestHeaders, _courseItemsStartingSuccessHandler, _courseItemsErrorHandler);
            _callbacksFromTransactionIds[transactionId] = p_callback;
        };
        this.getCourseItemsByUserContentTypesAndCourseIds_WithDatesDueBetween = function(p_userId, p_courseIds, p_contentTypes, p_dueAfterDate, p_dueBeforeDate, p_requestHeaders, p_callback)
        {
            VariableValidator.require(this, p_courseIds, "string");
            VariableValidator.optional(this, p_requestHeaders, "Array");
            _wmm.mark("scheduler.dueItems");
            var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/usercoursestructure?courses=" + p_courseIds + "&expand=course;items;schedule&contentTypes=" + p_contentTypes + "&itemsduebetween=" + p_dueAfterDate + ";" + p_dueBeforeDate, p_requestHeaders, _courseItemsDueSuccessHandler, _courseItemsErrorHandler);
            _callbacksFromTransactionIds[transactionId] = p_callback;
        };
        this.getCourseItemsByUserContentTypesAndCourseIds_WithDatesEndingBetween = function(p_userId, p_courseIds, p_contentTypes, p_endsAfterDate, p_endsBeforeDate, p_requestHeaders, p_callback)
        {
            VariableValidator.require(this, p_courseIds, "string");
            VariableValidator.optional(this, p_requestHeaders, "Array");
            _wmm.mark("scheduler.endItems");
            var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/usercoursestructure?courses=" + p_courseIds + "&expand=course;items;schedule&contentTypes=" + p_contentTypes + "&itemsendbetween=" + p_endsAfterDate + ";" + p_endsBeforeDate, p_requestHeaders, _courseItemsEndingSuccessHandler, _courseItemsErrorHandler);
            _callbacksFromTransactionIds[transactionId] = p_callback;
        };

        /**
			Makes a request to get user-specific CourseItems based on the content type passed in.
			
			@param	{String}	p_courseIds			The course IDs to get the course list for.
			@param	{String}	p_contentTypes		The content types to return.
			@param	{Array}		p_requestHeaders	An array of AjaxRequestHeader objects to attach to the request.
        */
        this.getRestrictedCourseItemsByCourseIdsAndContentTypes = function(p_userId, p_courseIds, p_contentTypes, p_requestHeaders, p_callback)
        {
            VariableValidator.require(this, p_courseIds, "string");
            VariableValidator.require(this, p_contentTypes, "string");
            VariableValidator.optional(this, p_requestHeaders, "Array");
			_wmm.mark("scheduler.restrictedItems");
            //var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/usercoursestructure?courses=" + p_courseIds + "&expand=items;schedule&contentTypes=" + p_contentTypes + "&itemsendbetween=" + p_endsAfterDate + ";" + p_endsBeforeDate, p_requestHeaders, _courseItemsEndingSuccessHandler, _courseItemsErrorHandler);

            var transactionId = _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/usercoursestructure?courses=" + p_courseIds + "&expand=course;items;schedule;access&contentTypes=" + p_contentTypes, p_requestHeaders, _restrictedCourseItemsByContentTypeSuccessHandler, _courseItemsErrorHandler);
            _callbacksFromTransactionIds[transactionId] = p_callback;
        }



    }

    /************************************
		Public Prototype Methods
    ************************************/
    /**
		Returns information about the specific CourseItemsServiceManager instance.
		@name		CourseItemsServiceManager#toString
		@function
		@return		{String}	The class name
		
	*/
    PrivateConstructor.prototype.toString = function()
    {
        return "[CourseItemsServiceManager]";
    }

    return new function()
    {
        /**
			Retrieves the instance of the CourseItemsServiceManager singleton.
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
