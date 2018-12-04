SELECT
  t.project,
  cast(t.project.title as varchar(200)) as title,
  t.projectContact,
  t.protocol
FROM wnprc_billing_public.publicInvoicedItems t
WHERE t.project is not null
GROUP BY t.project, t.project.title, t.protocol, t.projectContact