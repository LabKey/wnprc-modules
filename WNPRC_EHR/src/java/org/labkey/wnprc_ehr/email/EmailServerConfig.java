package org.labkey.wnprc_ehr.email;

import org.apache.commons.lang3.NotImplementedException;
import org.apache.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.JSONObject;
import org.labkey.api.data.CompareType;
import org.labkey.api.data.Container;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.DuplicateKeyException;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.security.User;
import org.labkey.dbutils.api.SimpleQueryFactory;
import org.labkey.dbutils.api.SimpleQueryUpdater;
import org.labkey.dbutils.api.SimplerFilter;
import org.labkey.webutils.api.json.ConvertibleToJSON;
import org.labkey.wnprc_ehr.schemas.WNPRC_Schema;

import javax.mail.MessagingException;
import javax.mail.Session;
import javax.mail.Store;
import javax.mail.URLName;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.UUID;

/**
 * This class represents an email server from the wnprc.email_server table.  This instructs {@link EmailServer} how to
 * contact an email server to interact with messages.
 */
public class EmailServerConfig implements ConvertibleToJSON {
    private static Logger _log = Logger.getLogger(EmailServerConfig.class);
    private static final String SSL_FACTORY = "javax.net.ssl.SSLSocketFactory";

    // Primary Key, so should be final.
    public final String id;

    // Properties that get stored on the backend
    public String hostname;
    private Integer port;
    private boolean useSSL;
    private Protocol protocol;

    public enum Protocol {
        POP3 ("pop3") {
            @Override
            public int getDefaultPort(boolean useSSL) {
                return useSSL ? 995 : 110;
            }

            @Override
            public Properties getProperties(EmailServerConfig config) {
                Properties properties = new Properties();

                // Inherit from system
                properties.putAll(System.getProperties());

                // Now set some specific pop3 stuff
                properties.setProperty("mail.pop3.socketFactory.class",    SSL_FACTORY);
                properties.setProperty("mail.pop3.socketFactory.fallback", "false");
                properties.setProperty("mail.pop3.socketFactory.port",     String.valueOf(config.getPort()));
                properties.setProperty("mail.pop3.port",                   String.valueOf(config.getPort()));

                return properties;
            }
        },
        IMAP4 ("imap4") {
            @Override
            public int getDefaultPort(boolean useSSL) {
                return useSSL ? 993 : 143;
            }

            @Override
            public Properties getProperties(EmailServerConfig config) {
                throw new NotImplementedException("Email server properties not available for IMAP4");
            }
        }
        ;

        String protocolName;

        Protocol(String protocolName) {
            this.protocolName = protocolName;
        }

        abstract public int getDefaultPort(boolean useSSL);
        abstract public Properties getProperties(EmailServerConfig config);
    }

    /**
     * Generate a new {@link EmailServerConfig}.  This will not automatically save it to the database.  You'll need
     * to call {@link #save(User, Container)} to do that.
     *
     * @param host Hostname of the email server to connect to.
     * @param port Port of the email server to connect to.  Pass in null to use the default port. See {@link Protocol#getDefaultPort(boolean)}.
     * @param protocol {@link Protocol} to use to connect to the server with (IMAP4, POP3).
     * @param useSSL Whether or not to connect to the server using SSL.
     */
    public EmailServerConfig(String host, Integer port, Protocol protocol, boolean useSSL) {
        this(host, port, protocol, useSSL, null);
    }

    /**
     * This is a private constructor used by the {@link #createFromJSON(JSONObject)} (User, Container, String)} method to generate {@link EmailServerConfig}
     * objects.
     *
     * @param host Hostname of the email server to connect to.
     * @param port Port of the email server to connect to.  Pass in null to use the default port. See {@link Protocol#getDefaultPort(boolean)}.
     * @param protocol {@link Protocol} to use to connect to the server with (IMAP4, POP3).
     * @param useSSL Whether or not to connect to the server using SSL.
     * @param id The Primary key of the wnprc.email_server table.  This shouldn't matter much, since it's only seen by
     *           the machine.  Passing in null will have a UUID string generated for the value.
     */
    private EmailServerConfig(@NotNull String host, @Nullable Integer port, @NotNull Protocol protocol, boolean useSSL, @Nullable String id) {
        // If null is passed in, generate a new id.
        this.id = (id == null) ? UUID.randomUUID().toString() : id;

        // For the rest, just set the values.
        this.hostname = host;
        this.port     = port;
        this.useSSL   = useSSL;
        this.protocol = protocol;
    }

    /**
     * Loads a {@link EmailServerConfig} from the wnprc.email_server table with the given id from the given container.  If
     * there is no row with that id, it'll throw an {@link InvalidKeyException}.
     *
     * @param user {@link User} to run the query as.
     * @param container {@link Container} to look for the config row in.
     * @param id The id of the config you're looking for.
     * @return A {@link EmailServerConfig} representing that row.
     * @throws InvalidKeyException Thrown if the row doesn't exist in the database.
     */
    public static EmailServerConfig load(User user, Container container, String id) throws InvalidKeyException {
        SimplerFilter filter = new SimplerFilter("id", CompareType.EQUAL, id);
        List<JSONObject> results = WNPRC_Schema.selectRows(user, container, WNPRC_Schema.TABLE.EMAIL_SERVER, filter);

        if (results.size() == 0) {
            throw new InvalidKeyException("id didn't match any records");
        }
        else if (results.size() > 1) {
            throw new InvalidKeyException("id should only match exactly one record");
        }

        return EmailServerConfig.createFromJSON(results.get(0));
    }

    /**
     * Checks multiple values for null
     *
     * @param args Objects to check for null
     * @return TRUE if any of the values are null, FALSE if they are all non-null
     */
    private static boolean anyOfTheFollowingIsNull(Object... args) {
        for (Object arg : args) {
            if (arg == null) {
                return true;
            }
        }
        return false;
    }

    /**
     * Casts a properly formatted JSON object to an {@link EmailServerConfig}.  This JSONObject should
     * probably be the output from {@link SimpleQueryFactory#selectRows(String, String)}.
     *
     * @param config {@link JSONObject} that represents a config.
     * @return {@link EmailServerConfig} object.
     * @throws IllegalArgumentException If the JSONObject is malformed.
     */
    private static EmailServerConfig createFromJSON(JSONObject config) {
        String id          = config.getString("id");
        String hostname    = config.getString("hostname");
        String displayName = config.getString("display_name");
        Boolean useSSL     = config.getBoolean("use_ssl");

        if (anyOfTheFollowingIsNull(id, hostname, displayName, useSSL)) {
            throw new IllegalArgumentException("config object must contain id, hostname, display_name, and use_ssl keys");
        }

        // Check to make sure that if "port" exists, it is an integer
        if (config.containsKey("port") && config.get("port") != null && !(config.get("port") instanceof Integer)) {
            throw new IllegalArgumentException("port must be an integer");
        }

        // Grab the port, if there is one.
        Integer port = (config.containsKey("port") && config.get("port") != null) ? config.getInt("port") : null;

        // Try to find a matching protocol
        Protocol protocol = null;
        String protocolName = config.getString("protocol");
        for (Protocol curProtocol : Protocol.values()) {
            if (curProtocol.protocolName.equalsIgnoreCase(config.getString("protocol"))) {
                protocol = curProtocol;
            }
        }

        // Complain if the protocol isn't valid.
        if (protocol == null) {
            throw new IllegalArgumentException(String.format(
                    "'%s' is not a legal protocol name.",
                    protocolName
            ));
        }

        return new EmailServerConfig(hostname, port, protocol, useSSL.booleanValue(), id);
    }

    /**
     * Gets the port that <code>JavaMail</code> should connect to.  If the config has null for the port,
     * it will connect to the default port for that protocol (995 for pop3 with SSL, 110 for
     * pop3 without SSL, etc).
     *
     * <table>
     *     <thead>
     *         <th>Protocol</th>
     *         <th>SSL?</th>
     *         <th>Port</th>
     *     </thead>
     *     <tbody>
     *         <tr>
     *             <td>POP3</td>
     *             <td>&#x2714;</td> <!-- Yes -->
     *             <td>995</td>
     *         </tr>
     *         <tr>
     *             <td>POP3</td>
     *             <td>&#x2718;</td> <!-- No -->
     *             <td>110</td>
     *         </tr>
     *         <tr>
     *             <td>IMAP4</td>
     *             <td>&#x2714;</td> <!-- Yes -->
     *             <td>993</td>
     *         </tr>
     *         <tr>
     *             <td>IMAP4</td>
     *             <td>&#x2718;</td> <!-- No -->
     *             <td>143</td>
     *         </tr>
     *     </tbody>
     * </table>
     *
     * @return the port JavaMail should use to connect to the mail server.
     */
    public int getPort() {
        return (this.port == null) ? protocol.getDefaultPort(useSSL) : this.port;
    }

    /**
     * Creates a Store object and connects it.  If it fails to connect, it'll throw a messaging
     * exception.  Note that you are responsible for closing it ({@link Store#close()}).
     *
     * @param password Password to use to connect to the store.
     * @return A Store object that can be used to interact with the mail server.
     * @throws MessagingException Thrown if something is wrong with the config or the server is unreachable.
     */
    public Store getConnectedStore(String username, String password) throws MessagingException {
        URLName urlName = new URLName(protocol.protocolName, hostname, getPort(), null, username, password);
        Session session = Session.getInstance(protocol.getProperties(this), null);
        Store store = session.getStore(urlName);

        // Connect to the mail server
        store.connect();

        return store;
    }

    /**
     * Saves the current configuration to the database.
     *
     * @param user {@link User} to run the insert/update query as.
     * @param container {@link Container} to insert the config into.
     * @throws QueryUpdateServiceException Indicates an internal problem with the QueryUpdater service.
     * @throws SQLException Thrown if there was an error communicating with the SQL Server
     * @throws BatchValidationException Thrown if the Trigger scripts raised an error.
     * @throws DuplicateKeyException Indicates something wrong, since {@link SimpleQueryUpdater#upsert(Map[])} should
     *                               check for rows that already exist in the database and UPDATE them instead.
     * @throws InvalidKeyException Indicates something wrong, since {@link SimpleQueryUpdater#upsert(Map[])} should
     *                             check for rows that don't exist in the database and INSERT them instead.
     */
    public void save(User user, Container container) throws QueryUpdateServiceException, SQLException, BatchValidationException, DuplicateKeyException, InvalidKeyException {
        SimpleQueryUpdater queryUpdater = new SimpleQueryUpdater(user, container, WNPRC_Schema.NAME, WNPRC_Schema.TABLE.EMAIL_SERVER.getTableName());

        JSONObject json = this.toJSON();
        json.put("container", container.getEntityId().toString());

        queryUpdater.upsert(json);
    }

    /**
     * Returns a JSON representation of this object, almost suitable for inserting into the database.  You'll need to
     * add a container to insert it.
     *
     * @return A {@link JSONObject} representation of this object.
     */
    @Override
    public JSONObject toJSON() {
        JSONObject json = new JSONObject();

        json.put("id",       this.id);
        json.put("hostname", this.hostname);
        json.put("protocol", this.protocol.protocolName);
        json.put("port",     this.port);
        json.put("use_ssl",  this.useSSL);

        return json;
    }
}
