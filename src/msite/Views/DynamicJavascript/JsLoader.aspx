<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage" %>
<% 
    //We want to put the list of files into a javascript array, so
    //we need to format it like "script1.js","script2.js"
    string files = "";
    IList<string> fileList = (IList<string>)ViewData["FileList"];

    if (fileList.Count > 0)
    {
        foreach (string filePath in ((IEnumerable)ViewData["FileList"]))
        {
            files += "\"" + filePath + "\",";
        }

        //Remove the last comma
        files = files.Substring(0, files.Length - 1);
    }
%>
var files = [<%= files %>];
var bodyElement = document.getElementsByTagName("head")[0];

for(var i = 0; i < files.length; i++)
{
    document.write("<script src='" + files[i] + "'><\/script>"); 
}