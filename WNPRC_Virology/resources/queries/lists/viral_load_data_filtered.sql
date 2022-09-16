SELECT vl.Id,
       vl.date,
       vl.key,
       vl.assay,
       vl.sample_type,
       vl.viral_load_average,
       vl.viral_load_replicates,
       vl.equivocal,
       vl.source_type,
       vl.comment,
       vl.experiment_number,
       vl.rna_isolation_method,
       vl.account,
       mp.accounts,
       mp.folderName,
FROM study.viral_loads vl
LEFT JOIN (
       SELECT  lists."Create Folders".accounts,
               lists."Create Folders".folderName
       FROM lists."Create Folders") mp
--ON mp.accounts in vl.account
ON ';' || LOWER(mp.accounts) || ';' LIKE '%;' || LOWER(vl.account) || ';%'
--might be able to use a %like% here with semicolons around each account
--ON vl.account in any(unnest(string_to_array(mp.accounts, ';')))