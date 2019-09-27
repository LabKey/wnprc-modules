const PrimateIDModule = (function () {
    const generatePrimateIds = function (notify) {
        // noinspection JSUnresolvedFunction
        return new Promise(function (resolve, reject) {
            const schema = "study";
            // @formatter:off
            const query = "select a.participantid"
                        +  " from (select d0.participantid participantid"
                        +          " from demographics d0"
                        +         " where (d0.calculated_status = 'Alive'"
                        +            " or exists(select null"
                        +                        " from demographics d1"
                        +                       " where d1.dam = d0.participantid)"
                        +            " or exists(select null"
                        +                        " from demographics d2"
                        +                       " where d2.sire = d0.participantid))) a"
                        +  " left outer join primateid.unique_ids b"
                        +    " on a.participantid = b.participantid"
                        + " where b.participantid is null"
            ;
            // @formatter:on
            notify("Counting study participants for id generation...");
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