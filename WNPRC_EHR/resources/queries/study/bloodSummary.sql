/*
 * Copyright (c) 2010-2013 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
 */
SELECT
	bq.lsid,
	bq.id,
	bq.date,
	bq.minDate,
-- 	bq.maxDate,
	bq.weight,
	bq.lastWeighDate,
	cast(bq.BloodLast30 as numeric) as BloodLast30,
    bq.BloodNext30,
    cast(round(bq.weight*species.max_draw_pct*species.blood_per_kg, 1) as numeric) AS MaxBlood,
    cast(round((bq.weight*species.max_draw_pct*species.blood_per_kg) - bq.BloodLast30, 1) AS numeric) AS AvailBlood,
    cast(round((bq.weight*species.max_draw_pct*species.blood_per_kg) - (bq.BloodLast30 + bq.BloodNext30), 1) AS numeric) AS BloodAvailNowPlusThirtyDays
FROM
(
	SELECT
	  b.*,
	  (d.species) as species,
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
--  			    ,timestampadd('SQL_TSI_DAY', 29, bi.date) as maxDate
	 		    , ( CONVERT(
                      (SELECT MAX(w.date) as _expr
                        FROM study.weight w
                        WHERE w.id = bi.id
                        --NOTE: we are doing this comparison such that it considers date only, not datetime
                        --AND w.date <= bi.date
                        AND CAST(CAST(w.date AS DATE) AS TIMESTAMP) <= bi.date
                        AND w.qcstate.publicdata = true
                      ), timestamp )
                  ) AS lastWeighDate
	 		    , ( COALESCE (
	    			(SELECT SUM(draws.quantity) AS _expr
	    		      FROM study."Blood Draws" draws
	    			  WHERE draws.id=bi.id
                          --AND draws.date BETWEEN TIMESTAMPADD('SQL_TSI_DAY', -30, bi.date) AND bi.date
                          AND (cast(draws.date as date) >= cast(TIMESTAMPADD('SQL_TSI_DAY', -29, bi.date) as date) AND cast(draws.date as date) <= cast(bi.date as date))
                          AND (draws.qcstate.metadata.DraftData = true OR draws.qcstate.publicdata = true)
                          --AND draws.qcstate.publicdata = true
                     ), 0 )
	  		      ) AS BloodLast30
 	 		    , ( COALESCE (
                     (SELECT SUM(coalesce(draws.quantity, 0)) AS _expr
                      FROM study."Blood Draws" draws
                      WHERE draws.id=bi.id
                        AND draws.date <= TIMESTAMPADD('SQL_TSI_DAY', 29, bi.date)
                        AND cast(draws.date as date) > bi.date
                        --AND draws.date BETWEEN bi.date AND TIMESTAMPADD('SQL_TSI_DAY', 29, bi.date)
                        AND (draws.qcstate.metadata.DraftData = true OR draws.qcstate.publicdata = true)
                     ), 0 )
                 ) AS BloodNext30
	     	FROM study.blood bi
	     	--WHERE (bi.qcstate.metadata.DraftData = true OR bi.qcstate.publicdata = true)
	    	) b
            JOIN study.demographics d ON d.id=b.id
	) bq

