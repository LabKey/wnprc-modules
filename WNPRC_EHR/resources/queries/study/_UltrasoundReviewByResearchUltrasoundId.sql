PARAMETERS ( PARENT_RECORD_ID VARCHAR )
SELECT
  ur.date,
  ur.head,
  ur.falx,
  ur.thalamus,
  ur.lateral_ventricles,
  ur.choroid_plexus,
  ur.eye,
  ur.profile,
  ur.four_chamber_heart,
  ur.diaphragm,
  ur.stomach,
  ur.bowel,
  ur.bladder,
  ur.findings,
  ur.placenta_notes,
  ur.remarks,
  ur.completed
FROM ultrasound_review ur
WHERE ur.ultrasound_id = PARENT_RECORD_ID