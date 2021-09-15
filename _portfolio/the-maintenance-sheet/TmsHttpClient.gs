/*** TMS HTTP Client to perform HTTP requests on TMS
 *
 * This object extends the UrlFetchApp object, and sets default HTTP request headers suited for TMS.
 */
var TmsHttpClient = Object.create(UrlFetchApp);

/* Default HTTP request header to use */
TmsHttpClient.defaultHeaders = {
  'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:37.0) Gecko/20100101 Firefox/37.0',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate',
  'Connection': 'keep-alive',
  'Content-Type': 'application/json'
}

/*** Fetches Grabber Log entries from TMS
 *
 * Fetches the Grabber log entries from TMS between `startdate' and `enddate',
 * via a GET request on `url' using the headers set above.
 */
TmsHttpClient.fetchGrabberLog = function(url, startdate, enddate) {
  var url = url || CONFIG.grabberLogDataUrl;
  var headers = this.defaultHeaders;
  
  var options = {
    'headers': headers
  }
  
  return JSON.parse(this.fetch(url, options).getContentText()).NewsSourceEntry;
}