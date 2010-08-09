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
	@author		BobS
		
	@description
	<p>The GradesServiceManager class is a singleton that manages requests to the Grades web service. 
	A successful response will generate a collection of ItemGrade objects, sorted by start date (descending), 
	and pass that collection to the "onLoadComplete" method.</p>
	
	@requires	VariableValidator.js
				AjaxManager.js
*/
var GradesServiceManager = (function()
{
    /**
		The singleton instance of the GradesServiceManager class.
		@private
    */
    var _instance = null;

    /**
		The constructor function for the GradesServiceManager instance.
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
			A dictionary that maps transaction ID's to course ids so that grades can be put into the proper context.
			@default	{}
			@private
        */
        var _transactionIdToCourseIdDictionary = {};

        /**
			The collection of Announcement objects. Announcements are created and stored in this 
			collection after a successful ajax response.
			@default	[]
			@private
        */
        var _itemGrades = [];



        /************************************
			Public Properties
			Note: In order for these to be parsed by the documenter, they must be assigned a default value.
        ************************************/
        /**
			The onLoadComplete handler contains a reference to a function that will be invoked when the 
			announcement request has been received. The method will receive an array of Announcement objects
			as a parameter.
			
			@type		Function
			@default	null
        */
        this.onLoadComplete = null;

        /**
			A collection of Course objects that the user is enrolled in. This is used to associate a course ID and title to an ItemGrade object.
			
			@type		Array
			@default	[]
        */
        this.courses = [];
		
		/**
			The base URL for the grades service. Ex: "http://grades-api.ecollege.com"
			
			@type		String
			@default	""
		*/
        this.serviceLocation = "";

        /************************************
			Private Methods
        ************************************/
        /**
			A sorting method used to sort grade objects by startDate.
			@param      {ItemGrade}   p_gradeA        The first Grade to compare.
			@param      {ItemGrade}   p_gradeB        The second Grade to compare.
			@return     {Integer}                     The difference between the start dates.
			@private
        */
        var _compareDates = function(p_gradeA, p_gradeB)
		{
            // sort descending
            return p_gradeA.updatedDate - p_gradeB.updatedDate;
        };

        /**
			Handles a successful ajax request and creates Announcement objects from the JSON data returned.
			After the Announcements are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
        */
        var _gradesSuccessHandler = function(p_data, p_transactionId)
		{
            _itemGrades = [];
			//Get the course ID for this transaction
            _wmm.measure("Moby.Grades.Service", "grades.all");
            
            if (p_data.courseitemgrades != null)
            {
                //Get all grades from the data returned
                for (var i = 0; i < p_data.courseitemgrades.length; i++)
			    {
					// filter out ungraded gradable items
					if (!p_data.courseitemgrades[i].letterGradeSet &&
					    !p_data.courseitemgrades[i].pointsSet)
					{
						_itemGrades.push(_createItemGrade(p_data.courseitemgrades[i]));
					}
                }

                _itemGrades.sort(_compareDates);
            }
            _instance.onLoadComplete(_itemGrades);
        };


        /**
			Handles a failed ajax request.
			@param	{Integer}	p_transactionId		The transaction Id assigned to the original request
			@param	{String}	p_errorStatus		The error status message of the request.
			@param	{String}	p_statusCode		The HTTP status code of the request.
			@param	{String}	p_statusText		The data returned by the server.
			@private
        */
        var _gradesErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
		{
            _itemGrades = null;
            
            _wmm.measure("Moby.Grades.Service", "grades.all");
            
            if (p_statusCode == "401")
			{
                // get new token and try again
            }
            else
			{
                _instance.onLoadComplete(_itemGrades);
            }
        };

        /**
			Handles a successful ajax request and creates ItemGrade objects from the JSON data returned.
			After the ItemGrades are created and stored into the collection, the "onLoadComplete" function is invoked.
			@param		{Object}	p_data				The JSON object representing the data returned by the ajax request.
			@param		{String}	p_transactionId		The transaction ID associated with the request.
			@private
        */
        var _createItemGrade = function(p_courseItemGradeData)
		{
            var itemGrade = new ItemGrade();
            
            var courseTitle = "";
            for (var k = 0; k < _instance.courses.length; k++)
            {
                if (_instance.courses[k].id == p_courseItemGradeData.course.id)
	            {
                    courseTitle = _instance.courses[k].title;
                    break;
                }
            }

            //Gather gradebook item data
            itemGrade.id = p_courseItemGradeData.gradebookItem.id;
            itemGrade.title = p_courseItemGradeData.gradebookItem.title;
            itemGrade.pointsPossible = p_courseItemGradeData.gradebookItem.pointsPossible;
            itemGrade.pointsPossibleSet = p_courseItemGradeData.gradebookItem.pointsPossibleSet;
            
            //Gather grade item data
            itemGrade.points = p_courseItemGradeData.grade.points;
            itemGrade.pointsSet = p_courseItemGradeData.grade.pointsSet;
            itemGrade.letterGrade = p_courseItemGradeData.grade.letterGrade;
            itemGrade.letterGradeSet = p_courseItemGradeData.grade.letterGradeSet;
            itemGrade.comments = p_courseItemGradeData.grade.comments.stripHtmlTags(true);

            //Set synthetic/combined property values            
            _setFormattedGrades(itemGrade);
            itemGrade.updatedDateISO8601 = p_courseItemGradeData.grade.updatedDate;
            itemGrade.updatedDate = p_courseItemGradeData.grade.updatedDate.toDate().getTime();
            itemGrade.updatedDateFormatted = p_courseItemGradeData.grade.updatedDate.toDate().getFormattedDateTime();
            itemGrade.courseId = p_courseItemGradeData.course.id;
            itemGrade.courseTitle = courseTitle;

            return itemGrade;
        };

        var _setFormattedGrades = function(p_itemGrade)
        {
            _setNumericGrade(p_itemGrade);
            _setCombinedGrade(p_itemGrade); // numericGrade MUST be set before calling this.
        };

        var _setCombinedGrade = function(p_itemGrade)
        {
            p_itemGrade.combinedGrade = "*";
            if (p_itemGrade.numericGrade != "" && p_itemGrade.letterGradeSet)
            {
                p_itemGrade.combinedGrade = p_itemGrade.numericGrade + " " + p_itemGrade.letterGrade;
                return;
            }
            if (p_itemGrade.numericGrade != "")
            {
                p_itemGrade.combinedGrade = p_itemGrade.numericGrade;
                return;
            }
            if (p_itemGrade.letterGradeSet)
            {
                p_itemGrade.combinedGrade = p_itemGrade.letterGrade;
                return;
            }
        };
        
        var _setNumericGrade = function(p_itemGrade)
        {
            if (p_itemGrade.pointsPossibleSet && p_itemGrade.pointsSet)
            {
                p_itemGrade.numericGrade = p_itemGrade.points + "/" + p_itemGrade.pointsPossible;
                return;
            }
            p_itemGrade.numericGrade == "";
        };
        

        /************************************
			Public Methods
        ************************************/
        /**
			Makes a request to get user & course specific grades.
				
			@param  {String}    p_userId			The user ID to get the grades for.
			@param	{String}	p_courseIds			The semi-colon list of course ids to get grades for.
			@param  {Array}     [p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
        */
        /*
        this.getGradesByUserIdAndCourseIds = function(p_userId, p_courseIds, p_requestHeaders)
		{
			VariableValidator.require(this, p_userId, "string");
			VariableValidator.require(this, p_courseIds, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
            _wmm.mark("grades.all");
            _ajaxManager.get(this.serviceLocation + "/users/" + p_userId + "/courseitemgrades?courses=" + p_courseIds, p_requestHeaders, _gradesSuccessHandler, _gradesErrorHandler);
        };
        */
        
        /**
			Makes a request to get course specific grades for the user that is currently authenticated.
			
			@param	{String}	p_courseIds			The semi-colon list of course ids to get grades for.
			@param  {Array}     [p_requestHeaders]	An array of AjaxRequestHeader objects to attach to the request.
        */
        this.getGradesByCourseIdsForMe = function(p_courseIds, p_requestHeaders)
		{
			VariableValidator.require(this, p_courseIds, "string");
			VariableValidator.optional(this, p_requestHeaders, "Array");
            _wmm.mark("grades.all");
            _ajaxManager.get(this.serviceLocation + "/me/courseitemgrades?courses=" + p_courseIds, p_requestHeaders, _gradesSuccessHandler, _gradesErrorHandler);
        };

    }

    /************************************
		Public Prototype Methods
    ************************************/
    /**
		Returns information about the specific GradesServiceManager instance.
		@name		GradesServiceManager#toString
		@function
		@return		{String}	The class name
    */
    PrivateConstructor.prototype.toString = function()
	{
        return "[GradesServiceManager]";
    }

    return new function()
	{
        /**
			Retrieves the instance of the GradesServiceManager singleton.
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