SELECT
    v.subjectId AS Id,
    v.date AS date,
    MAX(v.Run.runDate) as runDate,
    v.assayId AS assay,
    v.sampleType AS sample_type,
    CASE WHEN (AVG(v.viralLoadScientific) <
        (SELECT
            assays_llod_enddates.llod
        FROM lists.assays_llod_enddates
        WHERE assay_name = v.assayId AND MAX(v.Run.runDate) >= lists.assays_llod_enddates.start_date AND MAX(v.Run.runDate) <= lists.assays_llod_enddates.end_date ))
	    THEN ('< ' ||
	        (SELECT
	            CAST(assays_llod_enddates.llod as VARCHAR)
	        FROM lists.assays_llod_enddates
	        WHERE assay_name = v.assayId AND MAX(v.Run.runDate) >= lists.assays_llod_enddates.start_date AND MAX(v.Run.runDate) <= lists.assays_llod_enddates.end_date ))
	    ELSE CAST (AVG(v.viralLoadScientific) as VARCHAR)
    END AS viral_load_average,
    v.sourceMaterial.type AS source_type,
    v.comment AS comment,
    v.run.exptNumber as experiment_number,
    vsq.funding_string as account,
    GROUP_CONCAT(DISTINCT CAST(v.viralLoadScientific AS BIGINT ), ' ; ') AS viral_load_replicates,
FROM Site.{substitutePath moduleProperty('WNPRC_Virology', 'EHRViralLoadAssayDataContainerPath')}.assay.Viral_Loads."LC480 Viral Load Test".Data v

-- join on QPCR_QC_list to only include results from qPCR runs that pass QC
INNER JOIN Site.{substitutePath moduleProperty('WNPRC_Virology', 'EHRViralLoadQCList')}.lists.QPCR_QC_list q
    ON CAST(q.Expt_nr AS integer) = CAST(v.run.exptNumber AS integer)

-- join on vl_sample_queue to pull in the account # (funding string) for filtering results out on rsehr
LEFT JOIN Site.{substitutePath moduleProperty('WNPRC_Virology', 'virologyEHRVLSampleQueueFolderPath')}.lists.vl_sample_queue vsq
    ON vsq.Id = v.subjectId AND vsq.Sample_date = v.date

WHERE
    (q.QC_Pass = true OR v.viralLoadScientific = 0.0) AND v.subjectId NOT LIKE '%STD_%' AND v.subjectId NOT LIKE '%CTL%' AND v.subjectId NOT LIKE '%PosControl%' AND v.subjectId NOT LIKE '%NegControl%' AND v.subjectId NOT LIKE '%negative%'

-- groupBy viral load so these can be averaged
GROUP BY
    v.sourceMaterial.type, v.sampleType, v.subjectId, v.date, v.assayId, v.comment, v.run.exptNumber, vsq.funding_string
