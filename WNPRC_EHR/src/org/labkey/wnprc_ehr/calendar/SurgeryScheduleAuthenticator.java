package org.labkey.wnprc_ehr.calendar;

import java.util.Set;

public class SurgeryScheduleAuthenticator extends AzureActiveDirectoryAuthenticator
{
    private static final String applicationId = "3815848f-0d79-48e6-8049-a236152fd97b";
    private static final String authority = "https://login.microsoftonline.com/2ca68321-0eda-4908-88b2-424a8cb4b0f9/";
    private static final String upn = "surgeries_primate@wisc.edu";
    private static final Set scopes = Set.of("offline_access", "User.Read", "Calendars.ReadWrite", "Calendars.ReadWrite.Shared");

    public SurgeryScheduleAuthenticator() {
        super(applicationId, authority, upn, scopes);
    }
}