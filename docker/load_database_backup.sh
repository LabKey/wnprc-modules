#!/bin/bash 

#-------------------------------------------------------------------------------
# Read the named arguments (e.g., -f, -p) from the command line and replace the
# standard positional arguments with the non-named ones
#-------------------------------------------------------------------------------
args=()
while [[ $# -gt 0 ]]; do
    key="$1"
    case $key in
        -f|--file)     ## the path to the dump file on the local machine
            filepath="$2"
            shift
            shift
            ;;
        -p|--project)  ## the name of the docker-compose project
            export COMPOSE_PROJECT_NAME="$2"
            shift
            shift
            ;;
        -u|--username) ## the username for the EHR production server
            username="$2@"
            shift
            shift
            ;;
        --production)  ## flag indicating to run in "production" mode
            prod="true"
            shift
            ;;
        *) ## positional arguments
            args+=("$1")
            shift
            ;;
    esac
done
set -- "${args[@]}"

#-------------------------------------------------------------------------------
# Create a temporary folder just for this particular run (to clean up later)
#-------------------------------------------------------------------------------
tmpdir=$(mktemp -d /tmp/pg_restore.XXXXXXXX)
trap 'rm -rf $tmpdir' EXIT

#-------------------------------------------------------------------------------
# If the user did not provide a path to an existing dump file, secure copy the
# latest daily from the EHR production server's backup folder
#-------------------------------------------------------------------------------
if [[ -z $filepath ]]; then
    filename="labkey_$(date +'%Y%m%d')_0100.pg"
    scp ${username}ehr.primate.wisc.edu:/backups/labkey_backup/database/daily/${filename} $tmpdir || exit 1
    filepath="$tmpdir/$filename"
fi

#-------------------------------------------------------------------------------
# Take down the entire docker-compose project, including the network and volumes
# then build a new postgresql configuration using the specified one as a base. 
#-------------------------------------------------------------------------------
docker-compose down
if [[ ! -e .env ]]; then
    cp default.env .env
fi
if [[ .env =~ "PG_CONF_FILE=(.*)" ]]; then
    conf="${BASH_REMATCH[1]}"
else
    conf="./postgres/postgresql.conf"
fi
sed -e "s/^.*fsync *=.*$/fsync = off/" \
    -e "s/^.*synchronous_commit *=.*$/synchronous_commit = off/" \
    -e "s/^.*wal_level *=.*$/wal_level = minimal/" \
    -e "s/^.*full_page_writes *=.*$/full_page_writes = off/" \
    -e "s/^.*checkpoint_segments *=.*$/checkpoint_segments = 64/" \
    -e "s/^.*max_wal_senders *=.*$/max_wal_senders = 0/" \
    -e "s/^.*wal_keep_segments *=.*$/wal_keep_segments = 0/" \
    -e "s/^.*archive_mode *=.*$/archive_mode = off/" \
    -e "s/^.*autovacuum *=.*$/autovacuum = off/" \
    -e "s/^.*log_min_duration_statement *=.*$/log_min_duration_statement = -1/" \
    -e "s/^.*log_checkpoints *=.*$/log_checkpoints = off/" \
    -e "s/^.*log_connections *=.*$/log_connections = off/" \
    -e "s/^.*log_disconnections *=.*$/log_disconnections = off/" \
    -e "s/^.*log_duration *=.*$/log_duration = off/" \
    -e "s/^.*log_hostname *=.*$/log_hostname = off/" \
    -e "s/^.*log_lock_waits *=.*$/log_lock_waits = off/" \
    -e "s/^.*log_statement *=.*$/log_statement = 'none'/" \
    -e "s/^.*log_temp_files *=.*$/log_temp_files = -1/" \
    -e "s/^.*effective_cache_size *=.*$/effective_cache_size = 2GB/" \
    -e "s/^.*shared_buffers *=.*$/shared_buffers = 128MB/" \
    -e "s/^.*maintenance_work_mem *=.*$/maintenance_work_mem = 1GB/" \
    $conf > $tmpdir/pg_restore.conf
export PG_CONF_FILE=$tmpdir/pg_restore.conf
docker-compose up -d postgres
pgport=$(docker-compose port postgres 5432)

#-------------------------------------------------------------------------------
# Wait for the postgres instance to start accepting connections
#-------------------------------------------------------------------------------
echo -n 'Waiting for postgres to start ... '
docker-compose exec postgres /bin/bash -c 'count=0;while [ $count -lt 120 ]; do if psql -U postgres -c "\l" &>/dev/null; then sleep 3; break; fi; sleep 1; let count=count+1; done;' &>/dev/null
echo -e '\033[0;32mdone\033[0m'

#-------------------------------------------------------------------------------
# Drop and recreate the labkey database and the various roles that we use
#-------------------------------------------------------------------------------
echo -n 'Preparing database and roles ... '
docker-compose exec postgres psql -U postgres -c 'drop database if exists labkey;' &>/dev/null
docker-compose exec postgres psql -U postgres -c 'create database labkey; ' &>/dev/null
docker-compose exec postgres psql -U postgres -c 'drop role if exists labkey; create role labkey superuser; drop role if exists doconnor; create role doconnor superuser; drop role if exists oconnor; create role oconnor superuser; drop role if exists oconnorlab; create role oconnorlab superuser; drop role if exists sconnor; create role sconnor superuser; drop role if exists soconnorlab; create role soconnorlab superuser; drop role if exists soconnor_lab; create role soconnor_lab superuser;' &>/dev/null
echo -e '\033[0;32mdone\033[0m'

#-------------------------------------------------------------------------------
# Actually restore the database, using a background proc so we can track progress
#-------------------------------------------------------------------------------
echo -n "Restoring database from $filepath ...  0%"
pg_restore -l $filepath | egrep -v 'TABLE DATA (genotyping|audit|col_dump|oconnor) ' > $tmpdir/pg_restore.list
total=$(egrep -c '^[0-9]+;.*' $tmpdir/pg_restore.list)
trap 'kill -TERM $pg_restore_pid' TERM INT
pg_restore -h localhost -p "${pgport#*:}" -U postgres -d labkey -j 4 -L $tmpdir/pg_restore.list --verbose $filepath &>$tmpdir/pg_restore.log &
pg_restore_pid=$!
while kill -0 "$pg_restore_pid" &>/dev/null; do
    if [[ $total -ne 0 ]]; then
        count=$(egrep -c '(processing|finished) item' $tmpdir/pg_restore.log)
        perct=$(printf "%2d" $(( 100 * count / total )))
        echo -e -n "\b\b\b\033[0;33m${perct}%\033[0m"
    fi
    sleep 0.5
done
trap - TERM INT
echo -e -n "\b\b\b\033[0;32mdone\033[0m"
echo

#-------------------------------------------------------------------------------
# Run the scripts to clean up the instance for development purposes
#-------------------------------------------------------------------------------
if [[ -z $prod ]]; then
    echo -n "Preparing database for development ... "
    psql -h localhost -p "${pgport#*:}" -U postgres -d labkey &>/dev/null <<- XXX
        update prop.properties p set value = 'http://localhost:8080' where (select s.category from prop.propertysets s where s.set = p.set) = 'SiteConfig' and p.name = 'baseServerURL';
        update prop.properties p set value = FALSE where (select s.category from prop.propertysets s where s.set = p.set) = 'SiteConfig' and p.name = 'sslRequired';
        update prop.properties p set value = 'DevelopmentServer' where (select s.category from prop.propertysets s where s.set = p.set) = 'LookAndFeel' and p.name = 'systemShortName';
        update prop.properties p set value = 'EHR Development Server' where (select s.category from prop.propertysets s where s.set = p.set) = 'LookAndFeel' and p.name = 'systemDescription';
        update prop.properties p set value = 'Blue' where (select s.category from prop.propertysets s where s.set = p.set) = 'LookAndFeel' and p.name = 'themeName';
        update prop.properties p set value = 'UA-12818769-2' where (select s.category from prop.propertysets s where s.set = p.set) = 'analytics' and p.name = 'accountId';
        update prop.properties p set value = replace(Value, 'saimiri', 'colony-test') where (select s.category from prop.propertysets s where s.set = p.set) = 'wnprc.ehr.etl.config' and p.name = 'jdbcUrl';
        update prop.properties p set value = 0 where (select s.category from prop.propertysets s where s.set = p.set) = 'wnprc.ehr.etl.config' and p.name = 'runIntervalInMinutes';
        update prop.properties p set value = '/usr/bin/R' where (select s.category from prop.propertysets s where s.set = p.set) = 'UserPreferencesMap' and p.name = 'RReport.RExe';
        update prop.properties p set value = '/usr/bin/R' where (select s.category from prop.propertysets s where s.set = p.set) = 'ScriptEngineDefinition_R,r' and p.name = 'exePath';
        update prop.properties p set value = 'ldap://ldap.primate.wisc.edu' where (select s.category from prop.propertysets s where s.set = p.set) = 'LDAPAuthentication' and p.name = 'Servers';
        update ehr.module_properties p set stringvalue = 'test-ehr-do-not-reply@primate.wisc.edu' where p.prop_name = 'site_email';
        update exp.propertydescriptor set scale = 64 where name in ('FirstName', 'LastName', 'Phone', 'Mobile', 'Pager', 'IM') and propertyuri like '%:ExtensibleTable-core-Users.Folder-%' and scale = 0;
        update exp.propertydescriptor set scale = 255 where name in ('Description') and propertyuri like '%:ExtensibleTable-core-Users.Folder-%' and scale = 0;
        delete from ehr.notificationrecipients;
XXX
fi

#-------------------------------------------------------------------------------
# Tear down and re-start the docker-compose environment using the 'regular'
# postgresql configuration rather than the 'restore' one
#-------------------------------------------------------------------------------
docker-compose down
unset PG_CONF_FILE
docker-compose up -d postgres

