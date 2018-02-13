var console = require('console');
var PrimateID = new (require('primateid/primateid')).PrimateID.Sync();

console.log(PrimateID.Generate('WI'));

exports.init = function(EHR) {
    const TM = EHR.Server.TriggerManager;
    TM.registerHandlerForQuery(TM.Events.AFTER_INSERT, 'study', 'Birth', function(helper, errors, row) {
        console.log(PrimateID.Generate('WI'));
    });
};