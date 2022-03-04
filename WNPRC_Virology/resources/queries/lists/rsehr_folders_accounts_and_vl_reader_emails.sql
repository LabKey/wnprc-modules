SELECT

    m.account,
    f.folder_name,
    f.emails,
    f.folder_path,
    f.folder_container_id

FROM lists.folders_and_accounts_mappings m
JOIN wnprc_virology.folder_paths_with_readers  f
ON f.folder_name = m.folder_name

