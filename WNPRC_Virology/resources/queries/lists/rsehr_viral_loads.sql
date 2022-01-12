SELECT
    v.subjectId AS participantId,
    v.date AS date,
    v.assayId AS assay,
    v.sampleType AS sample_type,
    AVG(v.viralLoadScientific) AS viral_load_average,
    v.sourceMaterial.type AS source_type,
    v.comment AS comment,
    v.run.exptNumber as experiment_number,
    GROUP_CONCAT(CAST(v.viralLoadScientific AS BIGINT ), ' ; ') AS viral_load_replicates,
    CASE WHEN (MIN(v.viralLoadScientific) = 0 AND MAX(v.viralLoadScientific) != 0) THEN ('Equoivical') END AS equivocal,
    MAX(v.RowId)as Key
FROM "/WNPRC/WNPRC_Units/Research_Services/Virology_Services/VL_DB/".assay.Viral_Loads.Viral_Load.Data v

-- join on QPCR_QC_list to only include results from qPCR runs that pass QC
         INNER JOIN "/WNPRC/WNPRC_Units/Research_Services/Virology_Services/VS_group_wiki/".lists.QPCR_QC_list q
                    ON CAST(q.Expt_nr AS integer) = CAST(v.run.exptNumber AS integer)

WHERE
    (q.QC_Pass = true OR v.viralLoadScientific = 0.0) AND v.subjectId NOT LIKE '%STD_%' AND v.subjectId NOT LIKE '%CTL%' AND v.subjectId NOT LIKE '%PosControl%' AND v.subjectId NOT LIKE '%NegControl%' AND v.subjectId NOT LIKE '%negative%'

-- groupBy viral load so these can be averaged
GROUP BY
    v.sourceMaterial.type, v.sampleType, v.subjectId, v.date, v.assayId, v.comment, v.run.exptNumber