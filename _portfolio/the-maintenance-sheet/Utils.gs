/*** Utility class
 *
 * Useful helper functions should be combined here.
 */
var Utils = {
  /* Like the native `indexOf', only it returns not just the first found index, but all. */
  indexesOf: function (arr, val) {
    var indexes = [], i;
    for (i = 0; i < arr.length; i++)
        if (arr[i] === val)
            indexes.push(i);
    return indexes;
  },
  /* Given an array, return an array containing just the distinct values occurring in the original array. */
  arrGetUniqueValues: function(arr) {
    var u = {}, a = [];
    for(var i = 0, l = arr.length; i < l; ++i){
      if(u.hasOwnProperty(arr[i])) {
        continue;
      }
      a.push(arr[i]);
      u[arr[i]] = 1;
    }
    return a;
  },
  /* Round the inputted number `value' to `decimalCount' digits. */
  round: function(value, decimalCount) {
    var m = Math.pow(10, decimalCount);
    return Math.round(m * value) / m;
  },
  /* Calculates the deviation of a newssource item. */
  calcDeviation: function (item) {
//    if ( ([FIELDMAP['GrabsLastWeek'], FIELDMAP['AvgGrabsPerWeek']].indexOf(item) !== -1) &&
//         (item[FIELDMAP['AvgGrabsPerWeek']])
//    ){
      return this.round(parseFloat(item[FIELDMAP['GrabsLastWeek']]) / item[FIELDMAP['AvgGrabsPerWeek']], 2);
//    } else {
//      return undefined;
//    }
  },
  /* Given the inputted date object, it returns a string representation of it in the form 'dd/MM/yy'. */
  dateToString: function (date) {
    var dd = date.getDate()
    var MM = date.getMonth()+1 // January is 0!
    var yy = date.getYear()

    if(dd<10) {
      dd='0'+dd
    } 
    
    if(MM<10) {
      MM='0'+MM
    }
    return dd + '/' + MM + '/' + yy
  }
}