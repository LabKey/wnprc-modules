import { Query } from '@labkey/api';

export function labkeyActionSelectWithPromise(
    options: Query.SelectRowsOptions
): Promise<any> {
  return new Promise((resolve, reject) => {
    options.success = (data) => {resolve(data)};
    options.failure = (data) => {reject(data)};
    Query.selectRows(options);
  });
}
