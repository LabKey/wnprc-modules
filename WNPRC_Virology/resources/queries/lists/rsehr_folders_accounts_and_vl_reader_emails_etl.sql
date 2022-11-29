SELECT

    m.account,
    m.Key,
    f.folder_name,
    f.emails,
    f.folder_path,
    f.folder_container_id

FROM wnprc_virology.folders_accounts_mappings m
JOIN wnprc_virology.folder_paths_with_readers  f
ON f.folder_name = m.folder_name

