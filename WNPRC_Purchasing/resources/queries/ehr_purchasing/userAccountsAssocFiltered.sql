SELECT *
FROM (

--    associate all accounts to the user if accessToAllAccounts flag is set to true
         SELECT a.rowid AS rowid,
                a.alias AS account,
                u.userId
         FROM ehr_billingLinked.aliases a,
              (SELECT ua.userId,
                      ua.account
               FROM ehr_purchasing.userAccountAssociations ua
               WHERE ua.accessToAllAccounts = true
                 AND ua.account IS NULL) u

         UNION

-- get accounts associated with user
         SELECT a.rowid    AS rowid,
                ua.account AS account,
                ua.userId
         FROM ehr_purchasing.userAccountAssociations ua
                  LEFT JOIN ehr_billingLinked.aliases a ON ua.account = a.alias
         WHERE ua.accessToAllAccounts IS NULL OR ua.accessToAllAccounts = false) userAndAccts

WHERE ISMEMBEROF(userAndAccts.userId) --only display accounts associated with the current user
