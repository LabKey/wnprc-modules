/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
	bq.*,
	cast(CASE
	  WHEN bq.species = 'Marmoset'
	    THEN round(bq.weight*0.15*60, 1)
	  ELSE
	    round(bq.weight*0.2*60, 1)
    END as numeric) AS MaxBlood,
	cast(CASE
	  WHEN bq.species = 'Marmoset'
	    THEN round((bq.weight*0.15*60) - bq.BloodLast30, 1)
	  ELSE
        round((bq.weight*0.2*60) - bq.BloodLast30, 1)
    END AS numeric) AS AvailBlood
FROM
(
	SELECT
	  b.*,
	  (select species from study.demographics d where d.id = b.id) as species,
	  (
	    CONVERT (
	    	(SELECT AVG(w.weight) AS _expr
	    	FROM study.weight w
		    WHERE w.id=b.id AND w.date=b.lastWeighDate
		    AND w.qcstate.publicdata = true
		   ), double )
	  ) AS weight
	FROM
	 	(
			 SELECT bi.*
			    ,timestampadd('SQL_TSI_DAY', -29, bi.date) as minDate
  			    ,timestampadd('SQL_TSI_DAY', 29, bi.date) as maxDate
	 		    ,( CONVERT(
                      (SELECT MAX(w.date) as _expr
                        FROM study.weight w
                        WHERE w.id = bi.id
                        --AND w.date <= bi.date
                        AND CAST(CAST(w.date AS DATE) AS TIMESTAMP) <= bi.date
                        AND w.qcstate.publicdata = true
                      ), timestamp )
                  ) AS lastWeighDate
	 		    , ( COALESCE (
	    			(SELECT SUM(coalesce(draws.quantity, 0)) AS _expr
	    		      FROM study."Blood Draws" draws
	    			  WHERE draws.id=bi.id
                          AND draws.date >= TIMESTAMPADD('SQL_TSI_DAY', -29, bi.date)
                          AND cast(draws.date as date) <= bi.date
                          AND (draws.qcstate.metadata.DraftData = true OR draws.qcstate.publicdata = true)
                          --when counting backwards, dont include this date
                          --AND (draws.date != bi.date and draws.qcstate.label != bi.status)
                     ), 0 )
	  		      ) AS BloodLast30
	 		    , ( COALESCE (
	    			(SELECT SUM(coalesce(draws.quantity, 0)) AS _expr
	    		      FROM study."Blood Draws" draws
	    			  WHERE draws.id=bi.id
                          AND draws.date <= TIMESTAMPADD('SQL_TSI_DAY', 29, bi.date)
                          AND cast(draws.date as date) >= bi.date
                          --AND draws.date BETWEEN bi.date AND TIMESTAMPADD('SQL_TSI_DAY', 29, bi.date)
                          AND (draws.qcstate.metadata.DraftData = true OR draws.qcstate.publicdata = true)
                          --when counting forwards, dont include this date
                          --AND (draws.date != bi.date and draws.qcstate.label != bi.status)
                     ), 0 )
	  		      ) AS BloodNext30
            from (
              SELECT
                  b.id,
                  --b.id.dataset.demographics.species as species,
                  cast(b.date as date) as date,
                  --b.lsid,
                  --b.qcstate,
                  b.qcstate.label as status,
                  SUM(coalesce(b.quantity, 0)) as quantity
              FROM study.blood b
	     	  WHERE cast(b.date as date) >= TIMESTAMPADD('SQL_TSI_DAY', -29, now())
	     	  AND (b.qcstate.metadata.DraftData = true OR b.qcstate.publicdata = true)
	     	  group by b.id, cast(b.date as date), b.qcstate.label

	     	  UNION ALL
              SELECT
                  b.id,
                  --b.id.dataset.demographics.species as species,
                  TIMESTAMPADD('SQL_TSI_DAY', 30, cast(cast(b.date as date) as timestamp)) as date,
                  --null as lsid,
                  --null as qcstate,
                  null as status,
                  0 as quantity
              FROM study.blood b
	     	  WHERE cast(b.date as date) >= TIMESTAMPADD('SQL_TSI_DAY', -29, now())
	     	  AND (b.qcstate.metadata.DraftData = true OR b.qcstate.publicdata = true)
	     	  GROUP BY b.id, cast(b.date as date)

              --add one row per animal, showing todays date
	     	  UNION ALL
              SELECT
                  b.id,
                  --b.species,
                  curdate() as date,
                  --null as lsid,
                  --null as qcstate,
                  null as status,
                  0 as quantity
              FROM study.demographics b
              --WHERE b.id.status.status = 'Alive'
              ) bi
	    	) b
	) bq

