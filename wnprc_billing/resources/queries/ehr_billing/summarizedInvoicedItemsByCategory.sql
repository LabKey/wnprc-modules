SELECT
	MAX(date) AS chargedate,
	category AS description,
	SUM(totalcost) AS totalcost,
	invoicenumber
FROM ehr_billing.invoiceditems
GROUP BY category, invoicenumber