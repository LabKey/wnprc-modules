SELECT a.displayname, a.name, a.category, (SELECT MIN(b.displayname)
										                       FROM wnprc.procedure_names b
                                           WHERE a.category = b.category) AS firstCategoryItem
FROM wnprc.procedure_names a
ORDER BY a.category ASC, a.displayname ASC