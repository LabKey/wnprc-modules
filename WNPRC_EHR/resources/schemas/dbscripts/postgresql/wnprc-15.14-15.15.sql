UPDATE ehr.reports
SET queryname          = 'PregnancyInfo'
  , subjectidfieldname = 'Id'
  , jsonconfig         = '{"viewName":"pregnancies_all"}'
  , datefieldname      = NULL
WHERE reportname = 'pregnancies';