package org.labkey.wnprc_ehr.security;

import org.labkey.api.data.Container;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.security.SecurityEscalationAuditProvider;
import org.labkey.dbutils.api.security.SecurityEscalator;

/**
 * A class to bypass the security checks made by study datasets.  To use, call
 * {@link EHRSecurityEscalator#beginEscalation(User, Container, String)} in a resource try block:
 *
 * <code>
 *      try (EHRSecurityEscalator escalator = EHRSecurityEscalator.beginEscalation()) {
 *          // insert/update rows here...
 *      }
 * </code>
 *
 * @see SecurityEscalator for more information about use cases.
 */
public class EHRSecurityEscalator extends SecurityEscalator {
    // The ThreadLocal means each thread will have their own copy of this variable, and so it is essentially a "thread-wide"
    // global.
    private static final ThreadLocal<Integer> escalationStackLevel = new ThreadLocal<>();

    /**
     * Creates a new {@link EHRSecurityEscalator}.  This is private to force the use of the static method {@link #beginEscalation(User, Container, String)},
     * which is a little more readable in client code.
     *
     * @see SecurityEscalator#SecurityEscalator(User, Container, String)
     */
    private EHRSecurityEscalator(User user, Container container, String comment) {
        super(user, container, comment);
    }

    /**
     * Provides the escalation level tracker to the parent Security Escalator.
     *
     * @return A {@link ThreadLocal<Integer>} to track the escalation level.
     */
    @Override
    protected ThreadLocal<Integer> getEscalationLevelTracker() {
        return escalationStackLevel;
    }

    /**
     * Returns a new {@link SecurityEscalationAuditProvider.SecurityEscalationEvent} that will be filled out and
     * submitted by {@link SecurityEscalator}.
     *
     * @return A blank new {@link SecurityEscalationAuditProvider.SecurityEscalationEvent}.
     */
    @Override
    protected SecurityEscalationAuditProvider.SecurityEscalationEvent getNewSecurityEvent() {
        return new EHRSecurityEscalatorAuditProvider.EHRSecurityEscalationEvent();
    }

    /**
     * Used in a try-with-resources block, this escalates calls to QueryUpdateService for Study tables within the
     * block.
     *
     * @param user The user being escalated.  This is used for auditing purposes.
     * @param container The container in which the user is being escalated.  This is for auditing purposes, but note
     *                  that the user will be escalated across <strong>ALL</strong> containers, not just the one
     *                  specified here.
     * @param comment A useful comment explaining why the user needed to be escalated, or rather, what the code is doing
     *                during the escalation.  For example: "Updating
     * @return
     */
    public static SecurityEscalator beginEscalation(User user, Container container, String comment) {
        SecurityEscalator securityEscalator = new EHRSecurityEscalator(user, container, comment);

        return securityEscalator;
    }

    /**
     * Checks if the current thread is currently escalated.
     *
     * @return True if the current thread is escalated and so security checks should be ignored.
     * @see "EHRSecurityManager#hasPermission()"
     */
    public static boolean isEscalated() {
        Integer escalationLevel = escalationStackLevel.get();

        escalationLevel = (escalationLevel == null) ? 0 : escalationLevel.intValue();

        return escalationLevel > 0;
    }
}
