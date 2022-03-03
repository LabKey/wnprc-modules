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
       mp.client_name
FROM study.viral_loads vl
LEFT JOIN (
       SELECT  lists.mappings_for_clients.account,
               lists.mappings_for_clients.client_name
       FROM lists.mappings_for_clients) mp
ON mp.account in vl.account