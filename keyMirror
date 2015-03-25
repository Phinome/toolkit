/**
  * Create an object with values equal to its key names.
  *
  *
**/

"use strict";
var keyMirror = function(o) {

  if( '[object Object]' !== Object.prototype.toString.call(o) ) {
    throw new Error('keyMirror(...): Argument must be an object.');
  }
 
  var rec = {},
    key;
 
 for( key in o ) {
  if( !o.hasOwnProperty(key) ) {
    continue;
  }
  rec[key] = key;
 }
 
 return rec;
}

 module.exports = keyMirror;
