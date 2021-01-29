select calendar_id,calendar_type,display_name,cast(null as varchar) as room,api_action,folder_id,show_by_default,default_bg_color,account_name
from wnprc.procedure_calendars
union all
select email,'Office365Resource',displayname,room,'FetchSurgeryProcedureOutlookEvents','rooms',show_by_default,default_bg_color,'ProcedureCalendar'
from wnprc.procedure_rooms