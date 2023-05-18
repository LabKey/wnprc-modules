SELECT
    assays_llod.rowid,
    assays_llod.assay_name,
    assays_llod.start_date,
    CASE WHEN (assays_llod.end_date is null) THEN now()
    ELSE assays_llod.end_date
    END as end_date,
    assays_llod.llod,
    assays_llod.container,
    assays_llod.createdby,
    assays_llod.created,
    assays_llod.modifiedby,
    assays_llod.modified
FROM wnprc_virology.assays_llod
