SELECT

    unnest(string_to_array(m.accounts, ';')) as account,
    m.Key,
    f.folder_name,
    f.emails,
    f.folder_path,
    f.folder_container_id

FROM lists."Create Folders" m
JOIN wnprc_virology.folder_paths_with_readers  f
ON f.folder_name = m.folderName

