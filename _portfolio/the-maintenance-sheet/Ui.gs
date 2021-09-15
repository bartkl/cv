/*** User Interface object
 *
 * All user interface functionality (regarding the sheet) should be defined here.
 */
var Ui = {
  /* Autofills `Developer' and `Treated' columns in case the `Status' column is modified. */
  tagRow: function (e) {
    
    var colName = HEADER_ROW[e.range.getColumn()-1];
    if (colName !== 'Status') {
      return false;
    }
    var values = Array.prototype.concat.apply([], e.range.getValues());
    for (var i = 0; i < values.length; i++) {
      if (STATUS.indexOf(values[i]) === -1) {
        if (values[i] === '') {
          e.range.offset(0, Math.abs(GrabberLogSheet.getColNr('Status') - GrabberLogSheet.getColNr('Developer'))).clearContent();
          e.range.offset(0, Math.abs(GrabberLogSheet.getColNr('Status') - GrabberLogSheet.getColNr('Treated'))).clearContent();
//          this.setGridColor(e, '#000', 1, HEADER_ROW.indexOf('Ignored') + 1);
          return true;
        } else {
          return false;
        }
      }
    }
    
    var today = GrabberLogSheet.generateDtsToday(true);
    var developerCol = e.range.offset(0, Math.abs(GrabberLogSheet.getColNr('Status') - GrabberLogSheet.getColNr('Developer')));

    var vals = newFilledArray(
      e.range.getNumRows(),
      [USER[Session.getActiveUser().getEmail()].tag]
    );
    
    developerCol.setValues(vals);

    var treatedCol = e.range.offset(0, Math.abs(GrabberLogSheet.getColNr('Status') - GrabberLogSheet.getColNr('Treated')));
    var vals = newFilledArray(
      e.range.getNumRows(),
      [today]
    );
    
    treatedCol.setValues(vals);
//    this.setGridColor(e, '#ccc', 1, HEADER_ROW.indexOf('Ignored') + 1);

    
  },
  /* Autofills `Ignore since' and `Ignored by' columns in case a (ID, Name, Error) tuple is pasted. */
  tagIgnoreRow: function (e) {
    var sheet = e.range.getSheet()
    var values = e.range.getValues()
    /* This function is only called when the sheet title of the event matches that of the `Ignore' sheet, so this check is not necessary here. */

    if (
      (e.range.getColumn() == IGNORE_SHEET_HEADER_ROW.indexOf('ID')+1) &&
      (values[0].length == 3)
    ){
      /* AUTOFILL:
        * `Ignore since': now
        * `Ignored by': current Google Drive user
        But only if the edit is the a pasted error 3-tuple: (ID, Name, Error).
      */
      for (var i = 0; i < values.length; i++) {
        /* Bear in mind that at this point we can safely assume the range is three columns wide, starting at the `ID' column. */
        var row = values[i]
        if (!row[0]) {
          /* Skip rows with an invalid `ID' value. */
          return false
        }
        
        /* Autofill */
        var currentRowNr = e.range.getRow()+i
        var ignoredSinceColNr = IGNORE_SHEET_HEADER_ROW.indexOf('Ignored since')+1
        var ignoredByColNr = IGNORE_SHEET_HEADER_ROW.indexOf('Ignored by')+1
        
        sheet.getRange(currentRowNr, ignoredSinceColNr).setValue(Utils.dateToString(new Date()))
        sheet.getRange(currentRowNr, ignoredByColNr).setValue(USER[Session.getActiveUser().getEmail()].tag)
      }
    }
  },
  /* DEPRECATED. As it seems, this is no longer called anywhere */
  setGridColor: function (e, color, optStartNr, optEndNr) {
    var color = color || '#000';
    var startNr = optStartNr || 1;
    var endNr = optEndNr || e.range.getColumnIndex() + 1;
    e.range.getSheet().getRange(e.range.getRowIndex(), startNr, e.range.getNumRows(), endNr).setFontColor(color);
  }
}

/* Helper function to build an array of certain length containing a single distinct value */
function newFilledArray(len, val) {
  var rv = new Array(len);
  while (--len >= 0) {
    rv[len] = val;
  }
  return rv;
}