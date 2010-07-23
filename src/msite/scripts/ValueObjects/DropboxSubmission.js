/**
	@class
	@author		TimS
	
	@description
	<p>The DropboxSubmission class defines a set of properties that are specific 
	to a dropbox submission.</p>
*/
function DropboxSubmission()
{
	/************************************
		Public Properties
		Note: In order for these to be parsed by the documenter, they must be assigned a default value.
	************************************/
	/**
		The ID of the submission.
		@type String
	*/
	this.id = "";
	
	/**
		The name of the submitter in "FirstName LastName" format
		@type String
	*/
	this.submitterNameFormatted = "";
	
	/**
		The date of the submission in ISO 8601 format.
		@type String
	*/
	this.submissionDateISO8601 = "";
	
	/**
		The date of the submission in milliseconds since Jan 1, 1970.
		@type Integer
	*/
	this.submissionDate = 0;
	
	/**
		The date of the submission formatted using the following criteria:
		<ul>
		<li>If the date is today, the value will be "Today [Time Posted]"</li>
		<li>If the date is yesterday, the value will be "Yesterday [Time Posted]"</li>
		<li>If the date is 2 days ago or older, the value will be "[Date Posted] [Time Posted]"</li>
		</ul>
		@type String
	*/
	this.submissionDateFormatted = "";
	
	/**
		Comments made as part of the submission
		@type String
	*/
	this.comments = "";
	
	/**
		The name of the dropbox basket that the submission was made in
		@type ContainerInfo
	*/
	this.basketTitle = "";
	
	/**
		The id of the course that the submission was made in
		@type String
	*/
	this.courseId = "";
	
	/**
		The title of the course that the submission was made in
		@type String
	*/
	this.courseTitle = "";
	
}


/************************************
	Public Prototype Methods
************************************/
/**
	Returns information about the specific DropboxSubmission instance.
	@name		DropboxSubmission#toString
	@function
	@return		{String}	The class name
	
*/
DropboxSubmission.prototype.toString = function()
{
	return	"[DropboxSubmission]";
}