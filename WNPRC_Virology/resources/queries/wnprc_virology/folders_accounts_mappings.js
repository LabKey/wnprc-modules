var LABKEY = require("labkey");
var console = require("console");

function beforeInsert(row){
  //throw 'test error'
  console.log('inserted')
}
function beforeUpdate(row){
  //throw 'test error'
  console.log('updated')
}
