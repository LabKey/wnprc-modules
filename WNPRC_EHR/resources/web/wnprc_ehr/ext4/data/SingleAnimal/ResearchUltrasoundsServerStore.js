Ext4.define('WNPRC.ext.data.ResearchUltrasoundsServerStore', {
    extend: 'EHR.data.DataEntryServerStore',
    alias: 'store.wnprc-researchultrasoundsserverstore',

    constructor: function(){
        this.callParent(arguments);
    },

    getCommands: function(records, forceUpdate, validateOnly) {
        let commands = this.callParent(arguments);

        //check if the restraints section has been filled out. if not, remove it so that it doesn't save a blank record
        //currently there is only a single animal form, so the looping below
        //is not really necessary, but could be in the future if a multi-animal
        //form is created for entering research ultrasounds
        if (commands.commands.length > 0 && commands.commands[0].queryName === "restraints") {
            //loop through in reverse order for both loops so that splicing out elements in the
            //array doesn't mess up the array indexing
            for (let i = commands.records.length - 1; i >= 0; i--) {
                for (let j = commands.records[i].length - 1; j >= 0; j--) {
                    if (!commands.records[i][j].data.restraintType) {
                        commands.records[i].splice(j, 1);
                    }
                }
                //if all records in the current array were removed, then also remove
                //the array itself, as well as the corresponding command
                if (commands.records[i].length === 0) {
                    commands.commands.splice(i, 1);
                    commands.records.splice(i, 1);
                }
            }
        }

        return commands;
    }
});