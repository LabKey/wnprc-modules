SELECT
    v.subjectId AS Id,
    v.date AS date,
    MAX(v.Run.runDate) as runDate,
    v.assayId AS assay,
    v.sampleType AS sample_type,
    -- cast as varchar to avoid floating point operation problems,
    -- seems like the floating point issues only appear on the destination table of an ETL?
    CAST(TRUNCATE(AVG(CAST(ROUND(v.viralLoadScientific, 3) as NUMERIC)),5) as VARCHAR) as viral_load_average,
    CASE WHEN (AVG(v.viralLoadScientific) <
        (SELECT
            llod
        FROM Site.{substitutePath moduleProperty('WNPRC_Virology', 'EHRViralLoadAssayDataPath')}.lists.assays_llod_enddates cxs
        WHERE assay_name = v.assayId AND MAX(v.Run.runDate) >= cxs.start_date AND MAX(v.Run.runDate) <= cxs.end_date ))
	    THEN ('Yes (< ' ||
        (SELECT
            cast(llod as varchar)
        FROM Site.{substitutePath moduleProperty('WNPRC_Virology', 'EHRViralLoadAssayDataPath')}.lists.assays_llod_enddates cxs
        WHERE assay_name = v.assayId AND MAX(v.Run.runDate) >= cxs.start_date AND MAX(v.Run.runDate) <= cxs.end_date ) || ')' )
	    ELSE 'No'
    END AS Below_LLOD,
    v.sourceMaterial.type AS source_type,
    v.comment AS comment,
    v.run.exptNumber as experiment_number,
    --adding RNA col on a DB from 20230524: 18,303 records versus 18274  before adding it
    --q.RNA_isolation_method as RNA_isolation_method,
    vsq.funding_string as account,
    --requires an explicit CAST into NUMERIC, as LabKey SQL does not check data types for function arguments
    GROUP_CONCAT(DISTINCT CAST(ROUND(v.viralLoadScientific, 3) as NUMERIC), ' ; ') as viral_load_replicates
    --COUNT(v.viralLoadScientific) AS replicate_count,
FROM Site.{substitutePath moduleProperty('WNPRC_Virology', 'EHRViralLoadAssayDataPath')}.assay.Viral_Loads.Viral_Load.Data v

-- join on QPCR_QC_list to only include results from qPCR runs that pass QC
INNER JOIN Site.{substitutePath moduleProperty('WNPRC_Virology', 'EHRViralLoadQCList')}.lists.QPCR_QC_list q
    ON CAST(q.Expt_nr AS integer) = CAST(v.run.exptNumber AS integer)

-- join on vl_sample_queue to pull in the account # (funding string) for filtering results out on rsehr
LEFT JOIN Site.{substitutePath moduleProperty('WNPRC_Virology', 'virologyEHRVLSampleQueueFolderPath')}.lists.vl_sample_queue vsq
    ON vsq.Id = v.subjectId AND vsq.Sample_date = v.date

WHERE
    (q.QC_Pass = true OR v.viralLoadScientific = 0.0) AND vsq.status.Status != '10-never submitted' AND v.subjectId NOT LIKE '%STD_%' AND v.subjectId NOT LIKE '%CTL%' AND v.subjectId NOT LIKE '%PosControl%' AND v.subjectId NOT LIKE '%NegControl%' AND v.subjectId NOT LIKE '%negative%'

-- groupBy viral load so these can be averaged
GROUP BY
    --v.sourceMaterial.type, v.sampleType, v.subjectId, v.date, v.assayId, v.comment, v.run.exptNumber, vsq.funding_string, q.RNA_isolation_method
    v.sourceMaterial.type, v.sampleType, v.subjectId, v.date, v.assayId, v.comment, v.run.exptNumber, vsq.funding_string
