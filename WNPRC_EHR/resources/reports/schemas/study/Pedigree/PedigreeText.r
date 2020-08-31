##
#  Copyright (c) 2010-2017 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

options(echo=FALSE);
library(kinship2)
library(Rlabkey)
#library(stringr);

#print('Labkey.data:')
#str(labkey.data);
#warnings();

labkey.acceptSelfSignedCerts();


if ((length(labkey.data$id) == 0) | (is.na(labkey.data$dam) & is.na(labkey.data$sire))){
  png(filename="${imgout:myscatterplot}", width = 650, height = 150);
  plot(0, 0, type='n', xaxt='n', yaxt='n', bty='n', ann=FALSE  )
  title(main = "No pedigree data found for selected animal(s).", sub = NULL, xlab = NULL, ylab = NULL,
        line = NA, outer = FALSE)
} else
  {
  #this section queries labkey to obtain the pedigree data
  #you could replace it with a command that loads from TSV if you like
  allPed <- labkey.selectRows(
    baseUrl=labkey.url.base,
    #to run directly in R, uncomment this line.  otherwise providing a containerPath is not necessary
    folderPath=labkey.url.path,
    schemaName="study",
    queryName="Pedigree",
    colSelect=c('Id', 'Dam','Sire', 'Gender', 'Status', 'Display','BirthDate'),
    showHidden = TRUE,
    colNameOpt = 'fieldname',  #rname
    #showHidden = FALSE
  )
  # Be tolerant of query that doesn't include BirthDate column
  if(!"BirthDate" %in% colnames(allPed)) {
    allPed$BirthDate <- ''
  }
  if(!"birthdate" %in% colnames(labkey.data)) {
    labkey.data$birthdate <- ''
  }


  colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender', 'Status', 'Display','BirthDate')

  # Since the dataset is built from different sources, missing value is either NA or blank
  # which create a bug for the following functions.
  # We will change blank to NA
  # Temporary solution, write and read back the file, time consuming, maybe prohibitive in server
  # write.table(allPed, file="test.tsv", sep="\t")
  # allPed1=read.delim("test.tsv",sep="\t",header=TRUE,na.strings=c("","NA"))
  # Permanent solution: Assign "" as NA
  is.na(allPed$Id)<-which(allPed$Id=="")
  is.na(allPed$Dam)<-which(allPed$Dam=="")
  is.na(allPed$Sire)<-which(allPed$Sire=="")
  is.na(allPed$Gender)<-which(allPed$Gender=="")
  is.na(allPed$Status)<-which(allPed$Status=="")
  is.na(allPed$BirthDate)<-which(allPed$BirthDate=="")

  #this function adds missing parents to the pedigree
  #it is similar to add.Inds from kinship; however, we retain gender
  'addMissing' <- function(ped)
    {

    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)

    nsires <- match(ped[,"Sire"],ped[,"Id"]);# [Quoc] change ped,2 to ped,3
    nsires <- as.character(unique(ped[is.na(nsires),"Sire"]));
    nsires <- nsires[!is.na(nsires)];
    if(length(nsires)){
      ped <- rbind(ped, data.frame(Id=nsires, Dam=rep(NA, length(nsires)), Sire=rep(NA, length(nsires)), Gender=rep(1, length(nsires)), Status=rep(1, length(nsires)), Display=rep("", length(nsires)), BirthDate=rep("", length(nsires))));
    };
    #print(nsires);
    ndams <- match(ped[,"Dam"],ped[,"Id"]);# [Quoc] change ped,3 to ped,2
    ndams <- as.character(unique(ped[is.na(ndams),"Dam"]))
    ndams <- ndams[!is.na(ndams)];

    if(length(ndams)){
      ped <- rbind(ped, data.frame(Id=ndams, Dam=rep(NA, length(ndams)), Sire=rep(NA, length(ndams)), Gender=rep(2, length(ndams)), Status=rep(1, length(ndams)), Display=rep("", length(ndams)), BirthDate=rep("", length(ndams))));
    }

    names(ped) <- head
    return(ped)
  };


  'addMissingUnknown' <- function(ped)
    {

    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)

    nsires <- match(ped[,"Sire"],ped[,"Id"]);
    nsires <- as.character(unique(ped[is.na(nsires),"Sire"]));
    nsires <- nsires[!is.na(nsires)];
    if(length(nsires)){
      ped <- rbind(ped, data.frame(Id=nsires, Dam=rep(NA, length(nsires)), Sire=rep(NA, length(nsires)), Gender=rep(1, length(nsires)), Status=rep(1, length(nsires)), Display=rep("", length(nsires)), BirthDate=rep("", length(nsires))));

    };

    ndams <- match(ped[,"Dam"],ped[,"Id"]);
    ndams <- as.character(unique(ped[is.na(ndams),"Dam"]))
    ndams <- ndams[!is.na(ndams)];

    if(length(ndams)){
      ped <- rbind(ped,data.frame(Id=ndams, Dam=rep(NA, length(ndams)), Sire=rep(NA, length(ndams)), Gender=rep(2, length(ndams)), Status=rep(1, length(ndams)), Display=rep("", length(ndams)), BirthDate=rep("", length(ndams))));

    }

    names(ped) <- head
    return(ped)
  };


  #str(allPed)
  allPed <- addMissing(allPed);
  #print(allPed);

  #start the script

  #the dataframe labkey.data is supplied by labkey. it will contain one row per initial animal
  ped = data.frame(Id=labkey.data$id, Sire=labkey.data$sire, Dam=labkey.data$dam, Gender=labkey.data$gender, Status=labkey.data$status, Display=labkey.data$display, BirthDate=labkey.data$birthdate);

  #these will allow you to test the script
  #this will work
  #ped = data.frame(Id=c('r95061'), Dam=c('r84002'), Sire=c('rhao46'), Gender=c(2));

  #this throws an error with align=T but OK with align=F
  #ped = data.frame(Id=c('r95092'), Dam=c('rhad73'), Sire=c('rhao39'), Gender=c(1));

  origIds = as.character(ped$Id);

  #remove(labkey.data)



  gens = 5;

  #build backwards
  queryIds = factor(c(as.character(ped$Sire), as.character(ped$Dam)));
  queryIds <- queryIds[!is.na(queryIds)];
  queryIds <- unique(queryIds);

  for(i in 1:gens){

    if (length(queryIds) == 0){break};
    newRows <- subset(allPed, Id %in% queryIds);

    if (nrow(newRows)==0){break};

    queryIds = c(newRows$Sire, newRows$Dam);
    queryIds <- queryIds[!is.na(queryIds)];

    ped <- unique(rbind(newRows,ped));
  };

  ped$Gender <- as.integer(ped$Gender);
  ped$Status <- as.integer(ped$Status);


  #ped$Dam[is.na(ped$Sire)] <- NA;
  #ped$Sire[is.na(ped$Dam)] <- NA;
  #print(ped);

  #[Quoc: add missing after NA change]
  fixedPed <- addMissingUnknown(ped);
  #print(fixedPed);

  #once we get the initial pedigree working, I would prefer to explore other options
  #like adding colors.  for example, the index animals could be colored red
  for (j in 1:nrow(fixedPed)){
    if(fixedPed$Gender[j] == 2)  {
      fixedPed$sex[j] = 'female';
    }
    if(fixedPed$Gender[j] == 1){
      fixedPed$sex[j] = 'male';
    }
  }

  rows = nrow(fixedPed)

  if(rows>1){

    print(paste("Total Rows:", rows, sep=" "))
        

    printablePed <- cbind(id=fixedPed$Id, momid=fixedPed$Dam, dadid=fixedPed$Sire, sex=fixedPed$sex, BirthDate=fixedPed$BirthDate)
    printablePed <- printablePed[ order(printablePed[,2]), ]

    # ${tsvout:pedigreeOrderText.tsv}
    write.table(printablePed, file = "pedigreeOrderText.tsv", , sep = "\t", col.names = c("Id","Dam","Sire", "Sex","BirthDate" ),
                qmethod = "escape", row.names = FALSE)

    # ${fileout:pedigreeOrderFile.tsv}
    write.table(printablePed, file = "pedigreeOrderFile.tsv", sep = "\t", col.names = c("Id","Dam","Sire", "Sex","BirthDate" ),
                qmethod = "escape", row.names = FALSE)
  }
};