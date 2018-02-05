#!/bin/bash

if [[ $# -lt 1 ]]; then
  echo "Usage: sync_from_svn.sh <starting-revision> [ending-revision]" 1>&2
  exit 1
fi

# shamelessly stolen from here: https://superuser.com/a/210141 (thanks, Gilles!)
pipe_if_not_empty () {
  head=$(dd bs=1 count=1 2>/dev/null; echo a)
  head=${head%a}
  if [ "x$head" != x"" ]; then
    { printf %s "$head"; cat; } | "$@"
  fi
}

# read any changes to the following paths in SVN (the WNPRC-specific modules in 15.2) and apply them to the folder name
# in the git repo structure (specified after the colon)
foldermap=("server/customModules/WNPRC_EHR:WNPRC_EHR"
           "externalModules/wnprcModules/Compliance:WNPRC_Compliance"
           "externalModules/wnprcModules/GoogleDrive:GoogleDrive"
           "externalModules/wnprcModules/dbutils:DBUtils"
           "externalModules/wnprcModules/webutils:WebUtils")

# pull specifically from our 15.2 branch in LabKey's SVN. will need changed if things ever move
repo="https://hedgehog.fhcrc.org/tor/stedi/branches/modules15.2/"

# set the start/end revisions based on the command line arguments
srcrev=$1
tgtrev=${2:-HEAD}

# loop through the folders and do the following:
#   1) generate the diff for the repo between the start/end revisions (or HEAD)
#   2) replace any instances of "src/org/..." with "src/java/org/..." (because the structure changed)
#   3) apply the diff to the git repo, using the folder name specified in the map
echo "Reading changes to $repo between $srcrev and $tgtrev..."
for i in "${foldermap[@]}"
do
    srcpath=${i%:*}
    tgtpath=${i#*:}
    echo "  * applying changes from '$srcpath' to '$tgtpath'"
    svn diff --diff-cmd diff --git "${repo}${srcpath}" -r "${srcrev}:${tgtrev}" \
    | pipe_if_not_empty sed 's/src\/org/src\/java\/org/g' \
    | pipe_if_not_empty git apply -p0 --directory="$tgtpath"
done

