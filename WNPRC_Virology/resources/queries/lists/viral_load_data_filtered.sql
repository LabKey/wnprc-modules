SELECT vl.Id,
       vl.date,
       vl.key,
       vl.assay,
       vl.sample_type,
       vl.viral_load_average,
       vl.viral_load_replicates,
       vl.source_type,
       vl.comment,
       vl.experiment_number,
       vl.rna_isolation_method,
       vl.account,
       mp.account as mpaccount,
       mp.folder_name
FROM study.viral_loads vl
LEFT JOIN (
       SELECT  wnprc_virology.folders_accounts_mappings.account,
               wnprc_virology.folders_accounts_mappings.folder_name
       FROM wnprc_virology.folders_accounts_mappings) mp
ON mp.account = vl.account
--ON ';' || LOWER(mp.accounts) || ';' LIKE '%;' || LOWER(vl.account.alias) || ';%'
--might be able to use a %like% here with semicolons around each account
--ON vl.account in any(unnest(string_to_array(mp.accounts, ';')))