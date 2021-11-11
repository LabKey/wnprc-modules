select calendar_id,calendar_type,display_name,cast(null as varchar) as room,api_action,folder_id,show_by_default,cast(false as boolean) as requestable,cast(true as boolean) as ehr_managed,default_bg_color,account_name,requires_authorization,authorized_groups
from wnprc.procedure_calendars
union all
select email,'Office365Resource',displayname,room,'FetchSurgeryProcedureOutlookEvents',folder_id,show_by_default,requestable,ehr_managed,default_bg_color,'ProcedureCalendar',cast(false as boolean) as requires_authorization,cast(null as varchar) as authorized_groups
from wnprc.procedure_rooms