/* concatenate remarks and projects from the NecropsyAbstract dataset */
SELECT
    a.id as id,
    group_concat ( (a.remark || ' (' || coalesce(cast(a.project as varchar), 'no proj.') || ')' ), '; ') as remark
FROM study.NecropsyAbstract a
GROUP BY a.id