import {Query} from "@labkey/api";

export function getDropdownOptions(schemaName: string, queryName: string, colName: string) : Promise<any> {
    return new Promise((resolve, reject) => {
        Query.selectRows({
            schemaName: schemaName,
            queryName: queryName,
            columns: colName,
            // filterArray: [
            //     Filter.create()
            // ]
            success: function (results) {
                if (results && results.rows)
                {
                    resolve(results.rows);
                }
            }
        })
    })
}