
var _wmm = function()
{

    var _instance = null;

    var measurementsContainer = {};

    var _measurements = [];
    var markers = [];

    var tracker_svc_location = "/observations";

    var captureConfigSetting = "bulkajax";

    var captured_metrics = [];
    var page_metrics = [];
    var ISBULKAJAX = true;

    var _webMeasurementSuccessHandler = function(p_data, p_transactionId)
    {
        _measurements = [];

    };

    var _webMeasurementErrorHandler = function(p_transactionId, p_errorStatus, p_statusCode, p_statusText)
    {
        _measurements = [];
        if (p_statusCode == "401")
        {
            // get new token and try again
        }
        else
        {

        }
    };

    var _createObservation = function(name, eventName, details, type, timeStamp, elapsedTime)
    {

        var measurement = new wm();
        measurement.nm = eventName; //switched name and event name.  need to clarify this a bit.
        measurement.evt = name;
        measurement.ts = timeStamp;
        measurement.d = details;
        measurement.ot = type;
        measurement.et = elapsedTime;
        return measurement;
    };


    return {
        mark: function(markName)
        {
            var currTime = (new Date()).getTime();
            markers[markName] = { startTime: currTime, lastTime: currTime };
        },
        addMarksMeasures: function(name, markName, elapseTime, refTime)
        {
            var observation = _createObservation(name, markName, "", "measurement", refTime, elapseTime);
            captured_metrics.push(observation);
        },
        measure: function(name, markName)
        {

            var currTime = new Date().getTime();

            var refStartTime;
            var elapsedTime;

            if (markName != null && markers[markName] != null)
            {
                refStartTime = markers[markName].lastTime;
                elapsedTime = currTime - refStartTime;
                markers[markName].lastTime = currTime;
            }
            else
            {
                refStartTime = (new Date()).getTime();
                elapsedTime = currTime - refStartTime;
            }

            if (markName != null)
            {

                this.addMarksMeasures(name, markName, elapsedTime, refStartTime);
            }
            else
            {

                markers["UnknownEvent"] = { startTime: refStartTime, lastTime: currTime };
                this.addMarksMeasures(name, "UnknownEvent", elapsedTime, refStartTime); // pageTimer?
            }
            if (!ISBULKAJAX)
            {
                var allMetrics = getMetrics();
                this.sendMetrics();   //fix to include authheader
                //string customID, string name, string type, string details, string timeStamp, string url, string elapsedTime
                this.clear();
            }
        },
        capture: function(name, eventName, details, type, timeStamp, elapsedTime)
        {
            //var trackerSvc = _webMeasurementManager;
            //(name, eventName, details, type, timeStamp, elapsedTime)
            var observation = _createObservation(name, eventName, details, type, timeStamp, elapsedTime);
            captured_metrics.push(observation);

            if (!ISBULKAJAX)
            {
                var allMetrics = this.getMetrics();
                this.sendMetrics(); //fix to include authheader (e.g. through capture method) or remove "bulk" sending
                clear();

            }

        },
        captureError: function(name, timeStamp, details)
        {
            //(name, eventName, details, type, timeStamp, elapsedTime)
            var observation = _createObservation(name, "errorEvent", details, "error", timeStamp, 0)
            captured_metrics.push(observation);

            if (!ISBULKAJAX)
            {
                var allMetrics = this.getMetrics();
                this.sendMetrics();
                clear();
                
            }

        },
        createUniqueID: function()
        {
            return Math.round(Math.random() * 1000000000000000);
        },
        getMetrics: function()
        {
            return captured_metrics;
        },
        clear: function()
        {
            captured_metrics = [];
        },
        sendMetrics: function(headers)
        {
            
            measurementsContainer.wms = this.getMetrics();
            //        _ajaxManager.post(window.location.protocol + "//" + window.location.hostname + tracker_svc_location, JSON.stringify(measurementsContainer), headers, _webMeasurementSuccessHandler, _webMeasurementErrorHandler);


            $.ajax({
                type: "POST",
                url: window.location.protocol + "//" + window.location.hostname + tracker_svc_location,
                data: JSON.stringify(measurementsContainer),
                async: true,
                'beforeSend': function(xhr)
                {
                    for (var i = 0; i < headers.length; i++)
                    {
                        xhr.setRequestHeader(headers[i].name, headers[i].value)
                    }

                }
            });
            this.clear();

        }


    };


}();



function wm()
{

    this.nm = "";
    this.evt = "";
    this.d = "";
    this.ts = 0;
    this.ot = "";
    this.et = 0;


}
wm.prototype.toString = function()
{
    return "[webMeasurement]" + "\n" +
			"\t" + "name = " + this.nm + "\n" +
			"\t" + "timeStamp = " + this.ts.toString() + "\n" +
			"\t" + "details = " + this.d + "\n" +
			"\t" + "observationType = " + this.ot + "\n" +
			"\t" + "eventName = " + this.evt + "\n" +
			"\t" + "elapsedtime = " + this.et.toString();
}
