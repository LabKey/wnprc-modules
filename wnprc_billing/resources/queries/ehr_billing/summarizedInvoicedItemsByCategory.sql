SELECT
	MAX(date) AS date,
	category as comment,
	SUM(totalcost) AS totalcost,
	invoicenumber
FROM ehr_billing.invoiceditems
GROUP BY category, invoicenumber