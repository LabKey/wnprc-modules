##
#  Copyright (c) 2012-2015 LabKey Corporation
#
#  Licensed under the Apache License, Version 2.0: http://www.apache.org/licenses/LICENSE-2.0
##

# This R script will calculate and store kinship coefficients (aka. relatedness) for all animals in the colony.  This is a large, sparse matrix.
# The matrix is converted into a very long 3-column dataframe (animal1, animal2, coefficient).  This dataframe is output to a TSV file,
# which is normally imported into ehr.kinship by java code in GeneticCalculationsImportTask


#options(echo=TRUE);
options(error = dump.frames);
library(methods);
library(kinship2);
library(getopt);
library(Matrix);

spec <- matrix(c(
#'containerPath', '-c', 1, "character",
#'baseUrl', '-b', 1, "character"
'inputFile', '-f', 1, "character"
), ncol=4, byrow=TRUE);
opts = getopt(spec, commandArgs(trailingOnly = TRUE));

allPed <- read.table(opts$inputFile, quote="\"");
colnames(allPed)<-c('Id', 'Dam', 'Sire', 'Gender', 'Species');

is.na(allPed$Id)<-which(allPed$Id=="")
is.na(allPed$Dam)<-which(allPed$Dam=="")
is.na(allPed$Sire)<-which(allPed$Sire=="")
is.na(allPed$Gender)<-which(allPed$Gender=="")

##### commented out after checking data
# duplicatedId=allPed$Id[duplicated(allPed$Id)]
# allPed[allPed$Id%in%duplicatedId,]# Check for duplication: passed
# Id.Dam=unique(allPed$Dam)
# allPed[(allPed$Id%in%Id.Dam)&(allPed$Gender!=2),]#Check for Dam that is not female
# Id.Sire=unique(allPed$Sire)
# allPed[(allPed$Id%in%Id.Sire)&(allPed$Gender!=1),]#Check for Sire that is not male:1 not passed

# this function adds missing parents to the pedigree
# it is similar to add.Inds from kinship; however, we retain gender
addMissing <- function(ped){
    if(ncol(ped)<4)stop("pedigree should have at least 4 columns")
    head <- names(ped)

    nsires <- match(ped[,3],ped[,1])# [Quoc] change ped,2 to ped,3
    nsires <- as.character(unique(ped[is.na(nsires),3]))
    nsires <- nsires[!is.na(nsires)]
    if(length(nsires)){
        ped <- rbind(ped, data.frame(Id=nsires, Dam=rep(NA, length(nsires)), Sire=rep(NA, length(nsires)), Gender=rep(1, length(nsires)), Species=rep("Unknown", length(nsires))));
    }

    ndams <- match(ped[,2],ped[,1])# [Quoc] change ped,3 to ped,2
    ndams <- as.character(unique(ped[is.na(ndams),2]))
    ndams <- ndams[!is.na(ndams)];

    if(length(ndams)){
        ped <- rbind(ped,data.frame(Id=ndams, Dam=rep(NA, length(ndams)), Sire=rep(NA, length(ndams)), Gender=rep(2, length(ndams)), Species=rep("Unknown", length(ndams))));
    }

    names(ped) <- head
    return(ped)
}

allPed <- addMissing(allPed)
gc()

# In order to reduce the max matrix size, calculate famids using makefamid, then analyze each group separately
# It resizes the biggest matrix from 12000^2 to 8200^2 thus reduces the memory used by half
fami=makefamid(id=allPed$Id,father.id=allPed$Sire,mother.id=allPed$Dam)
famid=unique(fami)
famid=famid[famid!=0]
gc()

newRecords=NULL
for (fam.no in famid){
    familytemp=allPed[fami==fam.no,]
    temp.kin=kinship(familytemp$Id,familytemp$Sire,familytemp$Dam)
    rownames(temp.kin) <- colnames(temp.kin) #add rownames to make matrix symmetric, which is required downstream
    sparse.kin=as(temp.kin,"dsTMatrix") #change kinship matrix to symmetric triplet sparse matrix

    # convert to a sparse matrix usng S4 object from Matrix library
    temp.tri=data.frame(Id=colnames(temp.kin)[sparse.kin@i+1],Id2=colnames(temp.kin)[sparse.kin@j+1],coefficient=sparse.kin@x,stringsAsFactors=FALSE)
    newRecords=rbind(newRecords,temp.tri)
}

# write TSV to disk
print("Output table:");
print(str(newRecords));
write.table(newRecords, file = "kinship.txt", append = FALSE,row.names=F,quote=F,sep="\t");