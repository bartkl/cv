/*** Main function
 *
 * The entry point of the application, when the script runs this is where execution starts.
 */
function main () {
  /* Fetch the Grabber Log data in JSON */
  var jsonData = TmsHttpClient.fetchGrabberLog()
  /* FOR TESTING: Uncomment this to use test data from `JsonDataTest.gs' instead */
  //var jsonData = JSON_DATA_TEST
  
  /* Import the JSON data into the Grabberlog sheet */
  GrabberLogSheet.importJsonData(jsonData)
}

/*** Simple edit trigger
 *
 * This function triggers as soon as an edit event occurs.
 * The associated Event object is passed to it as e.
 */
function onEdit (e) {
  /* Automatic fill of `Treated' and `Developer' columns in Grabber Log sheet when `Status' is filled in or altered */
  Ui.tagRow(e)
  
  /* Automatic fill of the `Ignored since' and `Ignored by' columns in the Ignore sheet */
  if (e.range.getSheet().getName() === CONFIG.errorsToIgnoreSheetName) {
    Ui.tagIgnoreRow(e)
  }
}


/*** Modify datetimestamps of weekend additions to Monday
 * 
 * Runs only on Mondays and checks for entries that were added in the weekend before, i.e. between Fri 5pm and Monday 0am.
 * It then modifies the `Day added' and `Time added' datetimestamps to the Monday it runs.
 */
function fixDtsWeekendRows () {
  var now = new Date()
  var dayOfWeek = now.getDay()

  /* If it's not Monday: terminate */
  if (dayOfWeek !== 1) {
    return false
  }
  
  var timeAddedCol = GrabberLogSheet.getCol('Time added')
  var dayAddedCol = GrabberLogSheet.getCol('Day added')
  
  var threeDaysAgo = new Date(now.getTime() - 259200000);
  var lastFridayEvening = new Date(threeDaysAgo.getFullYear(), threeDaysAgo.getMonth(), threeDaysAgo.getDate(), 17, 00)
  
  /* Remove invalid items */
  timeAddedCol = timeAddedCol.filter(function (value) {
    if (!value) { return false }
    return true
  })
  dayAddedCol = dayAddedCol.filter(function (value) {
    if (!value) { return false }
    return true
  })
  
  /* Modify the datetimestamps to that of today (the appropriate Monday) */  
  for (var i = 0; i < timeAddedCol.length; i++) {
    var dts = new Date(timeAddedCol[i])
    if (dts.getTime() > lastFridayEvening.getTime() && dts.getDay() !== dayOfWeek) {
      timeAddedCol[i] = [now]
      dayAddedCol[i] = [Utils.dateToString(now).slice(0,10)] // this assumes leading zero formatted datetimestamps in Time added column!
    } else {
      timeAddedCol[i] = [dts]
      dayAddedCol[i] = [Utils.dateToString(dts).slice(0,10)]
    }
  }
  
  var timeAdded = GrabberLogSheet.getRange(2, GrabberLogSheet.getColNr('Time added'), GrabberLogSheet.getDataRange().getLastRow()-1, 1)
  var dayAdded = GrabberLogSheet.getRange(2, GrabberLogSheet.getColNr('Day added'), GrabberLogSheet.getDataRange().getLastRow()-1, 1)
  
  /* Actually write the changes to the sheet */
  timeAdded.setValues(timeAddedCol)
  dayAdded.setValues(dayAddedCol)
}
