/* Main configuration */
CONFIG = {
  grabberLogSheetName: 'Grabber Log',
  errorsToIgnoreSheetName: 'Ignore',
  grabberLogDataUrl: 'https://somehost/grabberloglist_json',
  timeZone: 'Europe/Amsterdam'
}

/* Users. Necessary for automatic tagging in case of status allocation */
USER = {
  'alice@somehost': {
    tag: 'Alice',
    email: 'alice@somehost'
  },
  'bob@somehost': {
    tag: 'Bob',
    email: 'bob@somehost'
  }
}

/* Statuses that are considered valid in the Grabber Log sheet */
STATUS = [
  'Incidental',
  'Fixed',
  'Broken',
  'Down',
  'Unscheduled',
  'Controle',
  'Controle A',
  'Controle B',
]

/* Column names in Grabber Log sheet */
HEADER_ROW = [
  'Day added',
  'Prio',
  'ID',
  'Name',
  'Description',
  'Template',
  '# Entries',
  '# Days',
  '# Links',
  'MinDepth',
  'GrabsLastWeek',
  'AvgGrabsPerWeek',
  'GrabsLastDay',
  'Deviation',
  'Time added',
  'Status',
  'Developer',
  'Treated',
  'Verified',
  'Comments'
]

/* Here the portion of Non-TMS data columns are specified. This can be useful when for instance you want to protect the data, but keep these columns modifiable/writable */
META_COLUMNS = [
  'Added',
  'Status',
  'Developer',
  'Treated',
  'Verified',
  'Comments'
]

/* Column names in Ignore sheet */
IGNORE_SHEET_HEADER_ROW = [
  'ID',
  'Name',
  'Error',
  'Ignored since',
  'See only every n-th day',
  'Ignored by'
]

/* Mapping between fields in the TMS Grabber Log JSON, and the column names in the Grabber Log sheet */
FIELDMAP = {
  'ID': 'NewsSourceID',
  'Name': 'NewsSourceName',
  'Prio': 'NewsSourcePriority',
  'Description': 'Description',
  'Template': 'Xsl',
  '# Entries': 'NumberOfEntries',
  '# Days': 'NumberOfDays',
  '# Links': 'NumberOfNewsSourceLinks',
  'MinDepth': 'MinDepth',
  'GrabsLastWeek': 'NewsItemsLastWeek',
  'AvgGrabsPerWeek': 'AverageNewsItemsPerWeek',
  'GrabsLastDay': 'NewsItemsLastDay',
  'Ignored': 'CanBeIgnored'
}

/* Mapping between numeric and alphabetic codings for newssource priority */
PRIOMAP = {
  '1': 'A',
  '2': 'B',
  '3': 'C'
}

/* Filters configuration */
FILTERCONFIG = {
  ignoreDeadNewssourcesOlderThanDays: 185, // in days
  serverErrors: [
    "[sql]",
    " ConnectFailure",
    " SendFailure",
    " ReceiveFailure",
    " NameResolutionFailure",
    " 500 ",
    " 501 ",
    " 502 ",
    " 503 ",
    " 504 ",
    " 505 ",
    " 506 ", 
    " 507 ",
    " 511 "
  ],
  ignoreIncidentalIfDaysOld: { // in days
    'A': 2,
    'B': 4,
    'C': 7
  },
  errorMessageIgnoreTime: { // in days
    'A': 2,
    'B': 4,
    'C': 7
  }
}
