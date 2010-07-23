<%@ Page Language="C#" Inherits="System.Web.Mvc.ViewPage" %>

var serviceDomains = {};
var SERVICE_DOMAIN_PROXY = "apiproxy";

serviceDomains[SERVICE_DOMAIN_PROXY] = "<%= ViewData["ProxyServiceDomain"]%>";