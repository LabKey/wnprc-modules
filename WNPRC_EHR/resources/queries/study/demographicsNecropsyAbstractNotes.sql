/* concatenate remarks and projects from the NecropsyAbstract dataset */
SELECT
    a.id as id,
    CASE
        /* covers the case where project is blank */
        WHEN ((group_concat(  (a.remark ||  a.project ) )) != '')
            THEN group_concat(  (a.remark ||  ' (' || a.project || ')' ) , chr(10)  )
        ELSE group_concat(  a.remark , chr(10)  )

        END as remark

FROM study.NecropsyAbstract a
GROUP BY a.id