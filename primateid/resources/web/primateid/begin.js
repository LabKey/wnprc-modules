const PrimateIDModule = (function () {
    const generatePrimateIds = function (notify) {
        // noinspection JSUnresolvedFunction
        return new Promise(function (resolve, reject) {
            const schema = "study";
            const query = "select a.participantid"
                        +  " from ("
                        +         "select d0.participantid participantid"
                        +          " from demographics d0"
                        +         " where d0.status = 'alive'"
                        +         " union "
                        +         "select d1.dam participantid"
                        +          " from demographics d1"
                        +         " where d1.status = 'alive'"
                        +           " and d1.dam is not null"
                        +         " union "
                        +         "select d2.sire participantid"
                        +          " from demographics d2"
                        +         " where d2.status = 'alive'"
                        +           " and d2.sire is not null"
                        +   ") a"
                        +  " left outer join primateid.unique_ids b"
                        +    " on a.participantid = b.participantid"
                        + " where b.participantid is null"
            ;
            notify("Counting study participants for id generation...");
            // get the count from the query
            LABKEY.Query.executeSql({
                schemaName: schema, sql: "select count(*) rowcount from (" + query + ")",
                success: function (count_data) {
                    const count = count_data.rows[0]['rowcount'];
                    if (count === 0) {
                        resolve();
                        return;
                    }
                    notify("Generating PrimateIDs for " + count + " records...");
                    LABKEY.Query.executeSql({
                        schemaName: schema, sql: query,
                        success: function (select_data) {
                            // noinspection JSUnresolvedFunction
                            const prefix = LABKEY.getModuleProperty('primateid', 'PrimateIdPrefix');
                            const runner = new PrimateID.Async();
                            // noinspection JSUnresolvedVariable
                            Promise.all(select_data.rows.map(function () {
                                return runner.Generate(prefix);
                            })).then(function (primateid_data) {
                                notify("Saving PrimateIDs to database...");
                                // noinspection JSUnresolvedFunction
                                LABKEY.Query.insertRows({
                                    schemaName: 'primateid', queryName: 'unique_ids',
                                    rows: primateid_data.map(function (v, i) {
                                        return {
                                            participantid: select_data.rows[i]['participantid'],
                                            primateid: v
                                        }
                                    }),
                                    success: resolve,
                                    failure: reject
                                });
                            }).catch(reject);
                        },
                        failure: reject
                    });
                },
                failure: reject
            })
        });
    };

    return {
        generate: generatePrimateIds
    };
})();