SELECT

    m.id,
    m.client_name,
    f.emails

FROM lists.mappings_for_clients m
JOIN wnprc_virology.folder_paths_with_readers  f
ON f.folder_name = m.client_name

