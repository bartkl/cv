/*** Grabber Log Sheet object
 *
 * This is the main object which acts as a sort of API of the Grabber Log sheet by extending the native API `Sheet' object.
 */
var GrabberLogSheet = Object.create(SpreadsheetApp
                                      .getActiveSpreadsheet()
                                      .getSheetByName(CONFIG.grabberLogSheetName)
                                   );

/*** Build sheet rows from JSON data
 *
 * Takes the Grabber Log JSON data, does some checks and formatting and builds a set of rows (grid) compatible for writing to the sheet.
 */
GrabberLogSheet.buildRows = function (jsonItems) {
    /* Grouping by key. */
    var groups = {};
    for (var i = 0; i < jsonItems.length; i++) {
        var item = jsonItems[i];
        var key = parseInt(item[FIELDMAP['ID']]);
        if (key in groups === false) {
            groups[key] = [];
        }
        groups[key].push(item);
    }
    /* Aggregating to row. */

    var rows = [];
    
    for (var key in groups) {
        var row = [];
        var group = groups[key];
        for (var i = 0; i < HEADER_ROW.length; i++) {
            var colName = HEADER_ROW[i];
          if (colName === 'Time added') {
            row[i] = GrabberLogSheet.generateDtsToday(true);
          }
          else if (colName === 'Day added') {
            row[i] = GrabberLogSheet.generateDtsToday(false);
          }
          else if (META_COLUMNS.indexOf(colName) !== -1) {
            row[i] = '';
          }
          else if (['# Entries',
                    '# Days',
                    '# Links',
                    'MinDepth',
                    'GrabsLastWeek',
                    'AvgGrabsPerWeek',
                    'GrabsLastDay'].indexOf(colName) !== -1) {
            row[i] = Math.max.apply(this, group.map(function (item) {
              return item[FIELDMAP[colName]];
            }));
          }
          else if (colName === 'Deviation') {
            var deviations = group.map(function(item) {
              return Utils.round(item[FIELDMAP['GrabsLastWeek']] / item[FIELDMAP['AvgGrabsPerWeek']], 2); // TODO: Use this.calcDeviation!
            });
            row[i] = Math.max.apply(this, deviations);
          }
          else if (colName === 'Prio') {
            row[i] = PRIOMAP[group[0][FIELDMAP['Prio']]];
          }
          else if (colName === 'Description') {
//            var description = "";
            var descriptions = group.map(function(item) {
              return item[FIELDMAP['Description']].trim();
            });
            row[i] = Utils.arrGetUniqueValues(descriptions).join('\n');
          }
          else {
            row[i] = group[0][FIELDMAP[colName]];
          }
        }
      rows.push(row);
    }
  return rows;
}

/* Returns the sheet data values in plain array form, without the header row */
GrabberLogSheet.getSheetData = function () {
  var sheetData = this
                    .getDataRange()
                    .getValues();
  return sheetData.slice(1); // Skip header row
}

/* Returns the column nr (1-based) of the column identified by the supplied name */
GrabberLogSheet.getColNr = function (name) {
 return HEADER_ROW.indexOf(name) + 1;
}

/* Return the column (identified by supplied name) data values in plain array form, without the header row */
GrabberLogSheet.getCol = function (name) {
  return [].concat.apply([], this
                               .getRange(2, this.getColNr(name), this.getDataRange().getLastRow(), 1)
                               .getValues()
                        );
}

/* Imports the JSON data into the sheet. This is the entry point of the import process which handles everything. */
GrabberLogSheet.importJsonData = function (jsonData) {
  this.idCol = this.getCol('ID'); // UGLY
  this.sheetData = this.getSheetData(); // UGLY
  var filteredJsonData = GrabberLogEntryFilter.applyAllFilters(this, jsonData);
  var rows = GrabberLogSheet.buildRows(filteredJsonData);
  var lastRowPos = this.getDataRange().getLastRow();
  
  /* If any row remains after filtering, determine the grid to update in the sheet and write the values. */
  if(rows.length > 0) {
    var grid = this.getRange(lastRowPos + 1, 1, rows.length, rows[0].length); 
    grid.setValues(rows);
    SpreadsheetApp.flush();
  }
  return 0;
}

/* Returns string version of the current day datetimestamp, optionally with time included when `true' is passed. */
GrabberLogSheet.generateDtsToday = function (optIncludeTime) {
  var includeTime = optIncludeTime || false;
  
  var today = new Date();
  var dd = today.getDate();
  var MM = today.getMonth()+1; // January is 0!
  var yy = today.getYear();
  if (includeTime) {
    var HH = today.getHours();
    var mm = today.getMinutes();
    if(HH<10) {
      HH='0'+HH;
    }
    if(mm<10) {
      mm='0'+mm;
    }
  }
  
  if(dd<10) {
    dd='0'+dd;
  } 
  
  if(MM<10) {
    MM='0'+MM;
  }
 
  if (includeTime) {
    return dd + '/' + MM + '/' + yy + ' ' + HH + ':' + mm;
  }
  else {
    return dd + '/' + MM + '/' + yy;
  }
}

/* Returns Date object based on the inputted `datestring', which has to be of form YYYY-MM-dd. */
GrabberLogSheet.parseDate = function (datestring) {
  if (datestring.length !== 10) {
    return "invalid date";
  }
  var d = datestring.substr(0, 2);
  var m = datestring.substr(3, 2) - 1;
  var y = datestring.substr(6, 4);
  return new Date(y, m, d); 
}