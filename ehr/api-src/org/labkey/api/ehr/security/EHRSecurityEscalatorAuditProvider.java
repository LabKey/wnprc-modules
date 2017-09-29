package org.labkey.api.ehr.security;

import org.labkey.api.audit.query.AbstractAuditDomainKind;
import org.labkey.dbutils.api.security.SecurityEscalationAuditProvider;

/**
 * @see SecurityEscalationAuditProvider
 */
public class EHRSecurityEscalatorAuditProvider extends SecurityEscalationAuditProvider {
    public static String EVENT_TYPE = EHRSecurityEscalationEvent.class.getName();
    public static String AUDIT_LOG_TITLE = "EHR Security Escalations";

    @Override
    public String getDescription() {
        return "This audits all uses of the EHR Security Escalation";
    }

    @Override
    public Class<? extends SecurityEscalationAuditProvider.SecurityEscalationEvent> getEventClass() {
        return EHRSecurityEscalationEvent.class;
    }

    @Override
    public String getEventType() {
        return EVENT_TYPE;
    }

    @Override
    public String getAuditLogTitle() {
        return AUDIT_LOG_TITLE;
    }

    @Override
    protected AbstractAuditDomainKind getDomainKind() {
        return new EHRSecurityEscalationDomain();
    }

    public static class EHRSecurityEscalationEvent extends SecurityEscalationEvent {
        @Override
        public String getEventType() {
            return EVENT_TYPE;
        }
    }

    public static class EHRSecurityEscalationDomain extends SecurityEscalationAuditDomainKind {
        public EHRSecurityEscalationDomain() {
            super(EVENT_TYPE);
        }

        @Override
        public String getDomainName() {
            return EHRSecurityEscalationDomain.class.getName();
        }
    }
}
