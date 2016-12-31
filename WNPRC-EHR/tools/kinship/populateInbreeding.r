##
#  Copyright (c) 2010-2011 LabKey Corporation
# 
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store inbreeding coefficients for all animals in the colony.  This data will be compared against
# the information currently stored in the DB and the minimal number of inserts/updates/deletes are then performed.  This script is designed
# to run as a daily cron job.

# When the script runs it outputs the log to /usr/local/labkey/kinship/inbreedingOut.txt.  This file is monitored by monit and an alert will be through
# if the timestamp does not change once per day.  This monitors whether the script is running, but does not directly monitor for errors.

options(echo=FALSE);
options(expressions = 1000);
library(pedigree)
library(Rlabkey)

#NOTE: to run directly in R instead of through labkey, uncomment this:
labkey.url.base = "https://ehr.primate.wisc.edu/"

#this section queries labkey to obtain the pedigree data
#you could replace it with a command that loads from TSV if you like
df <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
#NOTE: querying demographics will return a subset of all pedigree data
#comment that line and uncomment the line below to return the full table of pedigree data
#    queryName="Demographics",
    queryName="Pedigree",
    colSelect=c('Id', 'dam', 'sire'),
    showHidden = TRUE,
    colNameOpt = 'fieldname',  #rname
)

colnames(df)<-c("id", "dam", "sire")
df <-data.frame(id=df$id, dam=df$dam, sire=df$sire)


#this is an error-checking function in the pedigree package.  i do not know much about it
errors.ped(df)

#this is a function in the pedigree package designed to add missing parents to the dataframe
#see pedigree package documentation for more detail
df <- add.Inds(df);


#use an existing package to calculate inbreeding
ib = calcInbreeding(df);
colnames(df)<-c("id", "dam", "sire")


#we set date=now() as a timestamp
#the purpose of this is so we have a record when we save to the DB of when this was calculated.
date <- as.character( date() );
newRecords <- data.frame(Id=as.character(df$id), coefficient=ib, date=c(date), stringsAsFactors=FALSE);

#in the next sections we will compare the newly created dataframe to the data already in the DB
#the first time this script is run, the DB will be blank
#on subsequent runs, we perform these steps to minimize the amount of add/deletes against this data


#find old records first by querying labkey
#this can be replaced with a TSV load for testing if needed
oldRecords <- labkey.selectRows(
    baseUrl=labkey.url.base,
    folderPath="/WNPRC/EHR",
    schemaName="study",
    queryName="inbreeding",
    colSelect=c('lsid', 'Id', 'date', 'coefficient'),
    showHidden = TRUE,
    colNameOpt = 'fieldname'  #rname
)
#str(oldRecords);
#str(newRecords);

#first we find any cases where an Id existing in oldRecords, but not newRecords.  These need to be deleted
IdxToDelete <- setdiff(oldRecords$Id, newRecords$Id);
toDelete <- oldRecords[match(IdxToDelete, oldRecords$Id),]

#delete any animals present in the inbreeding table, but not the dataframe
print("To Delete: ")
length(toDelete$Id)

if(length(toDelete$Id)){
#during testing, i suggest just verifying that the script is working as expected
#without actually running the delete command

    del <- labkey.deleteRows(
        baseUrl=labkey.url.base,
        folderPath="/WNPRC/EHR",
        schemaName="study",
        queryName="inbreeding",
        toDelete=data.frame(lsid=toDelete$lsid)
    );
}


#next we find any cases where an Id exists in both oldRecords and newRecords, but the coefficient is different.
#These need to be updated

IdxToUpdate <- intersect(oldRecords$Id, newRecords$Id);
coefficient1 <- oldRecords[match(IdxToUpdate, oldRecords$Id),]
coefficient2 <- newRecords[match(IdxToUpdate, newRecords$Id),]

toGet <- (!is.na(coefficient1$coefficient) & is.na(coefficient2$coefficient)) | (is.na(coefficient1$coefficient) & !is.na(coefficient2$coefficient)) | (!is.na(coefficient1$coefficient) & !is.na(coefficient2$coefficient) & coefficient1$coefficient != coefficient2$coefficient)
toUpdate <- coefficient1[toGet,];

toUpdate$coefficient <- coefficient2$coefficient[toGet];

print("To Update: ")
length(toUpdate$Id)

if(length(toUpdate$Id)){
#during testing, i suggest just verifying that the script is working as expected
#without actually running the update command

    #change the date to reflect today's date
    toUpdate$date <- c( as.character( date() ) );

    update <- labkey.updateRows(
        baseUrl=labkey.url.base,
        folderPath="/WNPRC/EHR",
        schemaName="study",
        queryName="inbreeding",
        toUpdate=toUpdate
    );
}


#next we find any cases where an Id exists in newRecords, but not oldRecords.
#These need to be inserted


IdxToInsert <- setdiff(newRecords$Id, oldRecords$Id);
toInsert <- newRecords[match(IdxToInsert, newRecords$Id),]
#str(toInsert)

print("To Insert: ")
length(toInsert$Id)

if(length(toInsert$Id)){
#during testing, i suggest just verifying that the script is working as expected
#without actually running the insert command

    ins <- labkey.insertRows(
        baseUrl=labkey.url.base,
        folderPath="/WNPRC/EHR",
        schemaName="study",
        queryName="inbreeding",
        toInsert=toInsert
    );
}