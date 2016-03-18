window.OpenMetrics = function(openMetricUrl) {
  window._om = window._om || [];
  openMetricUrl = openMetricUrl || window.openMetricUrl;
  // simple cookie api, from https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie/Simple_document.cookie_framework
  var docCookies = {
    getItem: function (sKey) {
      if (!sKey) { return null; }
      return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, sPath, sDomain, bSecure) {
      if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) { return false; }
      var sExpires = "; expires=Fri, 31 Dec 9999 23:59:59 GMT"; // max cookie expiration date
      document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
      return true;
    },
  };
  var COOKIE_KEY = '_metricId';

  var openMetrics = {
    
    /*
     * Below are functions that can be called directly
     */



    /*
     * log an event, with optional properties
     * @properties should be a hash of propertyName: propertyValue
     */
    logEvent: function(eventName, properties) {
      openMetrics._eventsQueue.push({name: eventName, props: properties, ts: Date.now()});
      openMetrics._pingFlush();
    },

    /*
     * set the user ID to be use, probably to match the id on your product
     */
    setUserId: function(newUserId) {
      openMetrics._get('/v1/setUserId', {uid: newUserId});
    },
    
    /*
     * attach any number of properties to the current user
     * @properties should be a hash of propertyName: propertyValue
     */
    setUserProperties: function(properties) {
      openMetrics._get('/v1/setUserProps', {props: properties});
    },
    
    /*
     * create a new session, that will be independent of past events
     */
    clearSession: function(fromFlush) {
      if (!fromFlush)
        openMetrics._pingFlush(true);
      openMetrics._setNewSessionId();
    },


    
    /*
     * Below are functions that are not made to be called directly
     */


    /*
     * a queue of events to be logged. We only make one request a second
     */
    _eventsQueue: [],

    /*
     * make a simple POST request to the server
     * @callback is called when the request is done
     */
    _get: function(route, payload, callback) {
      payload.sessionId = docCookies.getItem(COOKIE_KEY);
      var url = openMetricUrl + route + '?q='+JSON.stringify(payload);
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
          callback && callback();
          // console.log(xhr.responseText);
        }
      }
      xhr.send(null);
    },

    /*
     * last time the events have been logged
     */
    _lastTimeFlushed: null,

    /*
     * try to log pending events
     * if @flushAnyway, a request will be made no matter how recent is the last one
     */
    _pingFlush: function(flushAnyway) {
      var t = Date.now(),
        lastFlushed = openMetrics._lastTimeFlushed;
      // make sure we don't make requests too often
      if (!flushAnyway && lastFlushed && t - lastFlushed < 1000) {
        return;
      }
      openMetrics._lastTimeFlushed = t;

      // get the events put in the queue by the user
      for (var k in window._om) {
        var log = window._om[k];
        switch (log[0]) {
          case 'event':
            openMetrics.logEvent(log[1], log[2]);
            break;
          case 'setUserId':
            openMetrics.setUserId(log[1]);
            break;
          case 'setUserProperties':
            openMetrics.setUserProperties(log[1]);
            break;
          case 'clearSession':
            openMetrics.clearSession(true);
            break;
        }
      }
      window._om = [];

      // don't do anything if there's nothing to do
      if (!openMetrics._eventsQueue.length)
        return;

      openMetrics._get('/v1/events', {events: openMetrics._eventsQueue});
      openMetrics._eventsQueue = [];
    },

    /*
     * create a new session, independant from previous things that happened
     */
    _setNewSessionId: function() {
      // create a random string, from http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
      var createRandomString = function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (var i=0; i < 10; i++)
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
      };
      var newId = createRandomString();
      docCookies.setItem(COOKIE_KEY, newId, '/');
    },
  };

  // create a session id if needed
  if (!docCookies.getItem(COOKIE_KEY)) {
    openMetrics._setNewSessionId();
  }

  // regularly log events
  openMetrics._pingFlush();
  setInterval(openMetrics._pingFlush, 1000);

  // make sure events get logged when user leave page
  var _onbeforeunload = window.onbeforeunload;
  window.onbeforeunload = function() {
    _onbeforeunload && _onbeforeunload();
    openMetrics._pingFlush(true);
  };
  return openMetrics;
};

// automatically start logging if required properties have been defined
if (window.openMetricUrl && window._om)
  window.openMetrics = new OpenMetrics();
