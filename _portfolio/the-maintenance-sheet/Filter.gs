/*** The Filter
 *
 * Here all Grabber Log entries from the JSON data are filtered.
 * Filter functions are defined under the `filters' key below.
 *
 * IMPORTANT: The order in which the filter functions are applied cannot be guaranteed since these are JS object keys and therefore can be ran through randomly.
 */
GrabberLogEntryFilter = {
  /* Fetch the errors to ignore. */
  errorsToIgnoreData: (
                        function() {
                          return SpreadsheetApp
                                   .getActiveSpreadsheet()
                                   .getSheetByName(CONFIG.errorsToIgnoreSheetName)
                                   .getDataRange()
                                   .getValues()
                                   .slice(1)
                        }
                       )(),
  /* The apply filter function wraps filter applicance so that item validation is centralized. */
  applyFilter: function (filter, context, item) {
    if (this.isInvalidItem(context, item)) { return true; }
    return filter(context, item);
  },
  
  /* Apply all filters. */
  applyAllFilters: function (context, items) {
    for (var i = 0; i < items.length; i++) {
      var veto = false;
      for (var name in this.vetoFilters) {
        if (this.vetoFilters[name](context, items[i])) {
          veto = true;
          break;
        }
      }

      if (!veto) {
        for (var name in this.filters) {
          if (this.applyFilter(this.filters[name], context, items[i])) {
            delete items[i];
            break;
          }
        }
      }
        
      if (items[i] && this.applyFilter(this.duplicateFilter, context, items[i])) {
        delete items[i];
      }
    }
    
    return items.filter(function (val) {
      if (val === undefined) {
        return false;
      }
      return true;
    });
  },
  
  /* Check if an item is valid or not, and return `true' or `false' accordingly. */
  isInvalidItem: function (context, item) {
    /* Filter the item if it has no 'ID' defined. */
    if( !(FIELDMAP['ID'] in item && item[FIELDMAP['ID']])
    ){
      return true;
    }
      return false;
  },
  /*** Filter functions
   *
   * Here are filter functions are defined to be ran through in random order.
   *
   * Please add them as being functions that expect the parameters (context, item).
   * `context' refers to the sheet object, `item' to the currently processed item from the JSON data.
   */
  filters: {
    exceptions: function(context, item) {
      var deviation = Utils.calcDeviation(item);
      var itemId = item[FIELDMAP['ID']];
      switch(itemId) {
        case "5165": // Newssource A
          if (deviation >= 0.75 && deviation <= 1.25) {
            return true;
          } break;
        case "35278": // Newssource B
          if (item[FIELDMAP['GrabsLastDay']] <= 5 || item[FIELDMAP['# Days']] >= 10) {
            return true;
          } break;
        default: return false;
      }
      return false;
    },
    pdfEmptyMessages: function (context, item) {
      var description = item[FIELDMAP['Description']].trim();
      if (!(FIELDMAP['Template'] in item)) {
        return false;
      }
      var template = item[FIELDMAP['Template']].trim();

            
      if ( ( (description === 'Empty message found in newsitem') ||
             (description === 'Empty title found in newsitem') ||
             (description === 'Empty message + title found in newsitem')
           ) &&
           ( ['pdf-singlepage.xsl', 'pdf-multipage.xsl'].indexOf(template) !== -1 )
         ){
        return true;
      }
      return false;
    },
    connectivityErrors: function (context, item) {
      var description = item[FIELDMAP['Description']].toLowerCase();
      
      if (FILTERCONFIG.serverErrors
                        .some(function(descr) {
                          if (description.indexOf(descr.toLowerCase()) !== -1)
                            return true
                        })
      ){
        return true
      }
      return false
    },
    newsgroups: function (context, item) {
      var description = item[FIELDMAP['Description']].trim()
      
      if (description == 'Connecting to newsserver') {
        return true
      }
      return false
    },
    incidentals: function (context, item) {
      if ( (PRIOMAP[item[FIELDMAP['Prio']]] === 'C') &&
          ((parseInt(item[FIELDMAP['# Entries']]) <= 3) // ||
//           (parseInt(item[FIELDMAP['# Days']]) > 7))
      )){
        return true;
      }
      else if ( (PRIOMAP[item[FIELDMAP['Prio']]] === 'B') &&
               ((parseInt(item[FIELDMAP['# Entries']]) <= 3) // ||
//                (parseInt(item[FIELDMAP['# Days']]) > 7))
      )){
        return true;
      }
      else if ( (PRIOMAP[item[FIELDMAP['Prio']]] === 'A') &&
                ((parseInt(item[FIELDMAP['# Entries']]) <= 10) // ||
//                (parseInt(item[FIELDMAP['# Days']]) > 7))
      )){
        return true;
      }
      return false;
    },
    ignore: function (context, item) {
      var errorsToIgnoreData = GrabberLogEntryFilter.errorsToIgnoreData
      var itemId = parseInt(item[FIELDMAP['ID']])
      var itemDescription = item[FIELDMAP['Description']]
            
      for (var i = 0; i < errorsToIgnoreData.length; i++) {
        var ignoreId = parseInt(errorsToIgnoreData[i][IGNORE_SHEET_HEADER_ROW.indexOf('ID')])
        var ignoreDescription = errorsToIgnoreData[i][IGNORE_SHEET_HEADER_ROW.indexOf('Error')]
        var ignoredSinceUnixDts = new Date(errorsToIgnoreData[i][IGNORE_SHEET_HEADER_ROW.indexOf('Ignored since')]).getTime()
        var daysToIgnore = parseInt(errorsToIgnoreData[i][IGNORE_SHEET_HEADER_ROW.indexOf('See only every n-th day')])
        var daysToIgnoreInMillseconds = parseInt(daysToIgnore * (24 * 3600 * 1000))
        var nowUnixDts = (new Date()).getTime()
        
        var dayInCycle = Math.abs(
                                    parseInt(
                                      Math.ceil(
                                        (nowUnixDts - ignoredSinceUnixDts) / (24 * 3600 * 1000)
                                      )
                                    ) // using `ceil()' is corresponding to intuition when solely the date component (and not time) is considered
                                  )
        if (!ignoreId) {
          continue
        }
        /* DEBUG */
        if (itemId === 11956) {
          Logger.log(
            Utilities.formatString("itemId: %i, ignoreId: %i, itemDescription: %s, ignoreDescription: %s, dayInCycle: %i, daysToIgnore: %i", itemId, ignoreId, itemDescription, ignoreDescription, dayInCycle, daysToIgnore)
          )
        }
        /* END DEBUG */
        if (
          (itemId === ignoreId)                               &&
          (itemDescription.indexOf(ignoreDescription) !== -1) &&
          !(dayInCycle % daysToIgnore === 0)
        ){
          return true
        }
      }
      return false
    },
    noNewsitemsLongerThanHalfYear: function (context, item) {
      var itemId = item[FIELDMAP['ID']]
      var description = item[FIELDMAP['Description']].trim()
      
      var prefix = 'No newsitems since '
      if (description.indexOf(prefix) === -1) {
        return false
      }
      
      var dateParts = description
                        .substring(prefix.length)
                        .split('-')
      var now  = new Date()
      var date = new Date(
        String(now.getFullYear()).substring(0, 2) + dateParts[2],
        dateParts[1] - 1,
        dateParts[0]
      )
      
      var daysOld = (now.getTime() - date.getTime()) / (1000 * 3600 * 24)
      if (daysOld <= FILTERCONFIG.ignoreDeadNewssourcesOlderThanDays) {
        return true
      }
      return false
    },
    recentRecentlyTreated: function (context, item) {
      var itemId = parseInt(item[FIELDMAP['ID']])
      var rowIndexes = Utils.indexesOf(context.idCol, itemId)
      
      if (rowIndexes.length === 0) {
        return false
      }
      
      var dates = rowIndexes.map(
        function (index) {
          return context.sheetData[parseInt(index)][HEADER_ROW.indexOf('Treated')]
        })
      var mostRecentDate = dates.reduce(function (a, b) { return a > b ? a : b })
      var rowIndex = rowIndexes[dates.indexOf(mostRecentDate)]
      var row = context.sheetData[rowIndex]

      var itemStatus = row[HEADER_ROW.indexOf('Status')]
      if (itemStatus !== 'Incidental' && itemStatus !== 'Fixed') {
        return false
      }
      
      var now = new Date()
      var date = new Date(mostRecentDate)
      var daysToLookBack = FILTERCONFIG.ignoreIncidentalIfDaysOld[
        row[HEADER_ROW.indexOf('Prio')]
      ]
      if (((now.getTime() - date.getTime()) / 86400000) <= daysToLookBack) {
        return true
      }
      return false
    },
  },
  /* Veto Filters 'veto' the filtering process. That means they are the
     opposite of filters: if any decides not to filter, the item won't be.
  */
  vetoFilters: {
//    signficantDeviations: function (context, item) {
//      if (PRIOMAP[item[FIELDMAP['Prio']]] === 'B') {
//        return false;
//      }
//      var deviation = Utils.calcDeviation(item);
//      var importantMappingNewssources = [
//        "34137", // Newssource A
//        "35278", // Newssource B
//      ]
//      /* Newssources which have mapping identifiers defined have no reliable Deviation value. Therefore, these newssources need to be skipped here. */
//      if (importantMappingNewssources.indexOf(item[FIELDMAP['ID']]) !== -1) {
//        return false;
//      }
//      
//      if (deviation < 0.75 || deviation > 1.25) {
//        return true;
//      }
//      return false;
//    },

//    noNewsItems: function(context, item) {
//      var description = item[FIELDMAP['Description']].trim();
//      if (description.indexOf('No newsitems since') !== -1) {
//        return true;
//      }
//      return false;
//    }
  },
  /*** The Duplicate Filter
   *
   * After all filtering has been done, the duplicate filter is lastly applied.
   * It basically checks:
   *   1. Is the newssource of this item already present in the sheet? If so: filter.
   *   2. If not, check if it's most recent status is `Fixed' or `Incidental'. If it's not: filter.
   */
  duplicateFilter: function (context, item) {
    /* If the most recent occurrence of this item has any status other than Fixed|Incidental or has none, filter it. */
    var itemId = parseInt(item[FIELDMAP['ID']])
    
    /* Get the array of all indexes of rows in the sheet this item's newssource occurs in. */
    var rowIndexes = Utils.indexesOf(context.idCol, itemId)
    /* If the item is not yet present in the sheet, make sure to add it, i.e. don't filter. */
    if (rowIndexes.length === 0) {
      return false
    }
    
    /* Get the `Time added' column of all the occurrences of this newssource in the sheet, and store the row indexes. */
    var dates = rowIndexes.map(
      function (index) {
        return context.sheetData[parseInt(index)][HEADER_ROW.indexOf('Time added')]
      })
    /* Get the most recent occurring date and store its row index. */
    var mostRecentDate = dates.reduce(function (a, b) { return a > b ? a : b })
    var rowIndex = rowIndexes[dates.indexOf(mostRecentDate)]

    /* If the most recent status is not Fixed or Incidental: filter. */
    var itemStatus = context.sheetData[rowIndex][HEADER_ROW.indexOf('Status')]
    if (!(itemStatus === 'Fixed' || itemStatus === 'Incidental')) { 
      return true
    }

    /* THIS IS BROKEN AND REDUNDANT RIGHT NOW DUE TO THE EXISTENCE OF THE STRICTER recentIncidentals filter */
//    else {
//      /** Lookup all recent enough error messages occurring in the sheet and make sure the newly added item does not contain recently fixed errors */
//      var now = new Date()
//      var daysToLookBack = FILTERCONFIG.errorMessageIgnoreTime[
//        PRIOMAP[item[FIELDMAP['Prio']]]
//      ]
//      var recentRowIndexes = rowIndexes.map(function (index) {
//        var value = context.sheetData[index][HEADER_ROW.indexOf('Treated')]
//
//        if (((now.getTime() - (new Date(value)).getTime()) / 86400000) <= daysToLookBack) {
//          return index // filter it
//        } else {
//          return null
//        }
//      }).filter(function (value) {
//        if (value === null) {
//          return false
//        } else {
//          return true
//        }
//      })
//      
//      var recentErrors = recentRowIndexes.map(function (index) {
//        return context.sheetData[index][HEADER_ROW.indexOf('Description')].split('\n')
//      })
//      var recentErrors = Array.prototype.concat.apply([], recentErrors)
//      for (var i in recentErrors) {
//        if (itemId == 7800) { // DEBUG
//          Logger.log(recentErrors[i].trim())
//          Logger.log(item[FIELDMAP['Description']].trim())
//        }
//        if (recentErrors[i].trim().indexOf(item[FIELDMAP['Description']].trim()) !== -1) {
//          return true
//        }
//      }
//      /** End of this piece. */
//      return false // It should never come here.
//    }
//    return false
  }
}
