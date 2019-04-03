SELECT
	MAX(summarizedInvoiceItems.date) AS date,
	summarizedInvoiceItems.category AS comment,
	SUM(summarizedInvoiceItems.totalcostdirect) AS totalcost,
	summarizedInvoiceItems.invoicenumber
FROM (
				SELECT
					date,
					(CASE WHEN category like '%Misc. Fees%' AND chargeId.departmentCode IS NULL THEN category
								WHEN category like '%Misc. Fees%' AND chargeId.departmentCode IS NOT NULL THEN chargeId.departmentCode
								ELSE category END) AS category,
					totalcostdirect,
					invoiceNumber
				FROM
				ehr_billing.invoiceditems
		) summarizedInvoiceItems
GROUP BY
		 summarizedInvoiceItems.category,
		 summarizedInvoiceItems.invoicenumber