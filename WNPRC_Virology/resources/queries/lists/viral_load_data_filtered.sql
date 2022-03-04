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
       mp.account,
       mp.folder_name
FROM study.viral_loads vl
LEFT JOIN (
       SELECT  lists.folders_and_accounts_mappings.account,
               lists.folders_and_accounts_mappings.folder_name
       FROM lists.folders_and_accounts_mappings) mp
ON mp.account in vl.account