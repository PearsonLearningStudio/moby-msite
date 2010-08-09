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
	<p>The ItemGrade class defines a set of properties that are specific to a Gradable Item and its Grade for a given user.</p>
*/
function ItemGrade() {

    /************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
    ************************************/
    /**
		The ID of the Gradable Item
		@type	String
    */
    this.id = "";

    /**
		The title of the Gradable Item
		@type	String
    */
    this.title = "";

    /**
		The points achieved for the Gradable Item
		@type	String
    */
    this.points = "";
    
    /**
		True/False if the points achieved have been set
		@type   Boolean
    */
    this.pointsSet = "";

    /**
		The possible points achievable for the Gradable Item
		@type	String
    */
    this.pointsPossible = "";
    
    /**
		True/False if the points achievable have been set
		@type   Boolean
    */
    this.pointsPossibleSet = "";

    /**
		The letter grade assigned for the Grade of the Gradable Item
		@type	String
    */
    this.letterGrade = "";
    
    /**
		True/False if the letter grade has been set
		@type   Boolean
    */
    this.letterGradeSet = "";
    
    /**
		The numeric grade assigned for the Grade of the Gradable Item.
		Combination of points possible and points achieved.
		@type   String
    */
    this.numericGrade = "";

    /**
		The combined grade is the numeric and letter grades combined & formatted
		@type   String
    */
    this.combinedGrade = "";

    /**
		The professor's comments for the Grade of the Gradable Item
		@type	String
    */
    this.comments = "";

	/**
		The date the Grade was last updated for the Gradable Item (ISO 8601 format)
		@type	Integer
    */
    this.updatedDateISO8601 = 0;

    /**
		The date the Grade was last updated for the Gradable Item (in milliseconds since Jan 1, 1970)
		@type	Integer
    */
    this.updatedDate = 0;

    /**
		The updated date of the Grade for the Gradable Item formatted with the following criteria:
		<ul>
		<li>If the date is today, the value will be "Today [Time Posted]"</li>
		<li>If the date is yesterday, the value will be "Yesterday [Time Posted]"</li>
		<li>If the date is 2 days ago or older, the value will be "[Date Posted] [Time Posted]"</li>
		</ul>
		@type	String
    */
    this.updatedDateFormatted = ""

    /**
		The course ID that this announcement is posted to.
		@type	String
    */
    this.courseId = "";

    /**
		The name of the course that this announcement is posted to.
		@type	String
    */
    this.courseTitle = "";
    
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific ItemGrade instance.
	@name		ItemGrade#toString
	@function
	@return		{String}	The class name.
	
*/
ItemGrade.prototype.toString = function() {
    return "[ItemGrade]";
}