package org.labkey.selfregistration;

import org.apache.log4j.Logger;
import org.junit.*;
import org.labkey.api.action.ApiResponse;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.exp.ChangePropertyDescriptorException;
import org.labkey.api.exp.property.Domain;
import org.labkey.api.exp.property.DomainProperty;
import org.labkey.api.gwt.client.model.PropertyValidatorType;
import org.labkey.api.issues.IssuesListDefService;
import org.labkey.api.module.AllowedDuringUpgrade;
import org.labkey.api.module.Module;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.security.Group;
import org.labkey.api.security.GroupManager;
import org.labkey.api.security.IgnoresTermsOfUse;
import org.labkey.api.security.InvalidGroupMembershipException;
import org.labkey.api.security.MutableSecurityPolicy;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.SecurityPolicyManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.ValidEmail;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.roles.RoleManager;
import org.labkey.api.security.roles.SubmitterRole;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.util.PageFlowUtil;
import org.labkey.api.view.JspView;
import org.labkey.api.view.NavTree;
import org.labkey.security.xml.GroupEnumType;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;
import org.labkey.api.query.UserSchema;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public class SelfRegistrationController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(SelfRegistrationController.class);
    public static final String NAME = "selfregistration";
    protected static final Logger _log = Logger.getLogger(SelfRegistrationController.class);

    public SelfRegistrationController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class BeginAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            return new JspView("/org/labkey/selfregistration/view/hello.jsp");
        }

        public NavTree appendNavTrail(NavTree root)
        {
            return root;
        }
    }

    public static class SelfRegistrationForm {

        private String assignedTo;
        private String title;
        private String priority;
        private String issueDefName;
        private String containerPath;
        private String firstname;
        private String lastname;
        private String email;
        private String institution;
        private String project;
        private String reason;
        private String hostname;

        public String getAssignedTo()
        {
            return assignedTo;
        }

        public void setAssignedTo(String assignedTo)
        {
            this.assignedTo = assignedTo;
        }

        public String getTitle()
        {
            return title;
        }

        public void setTitle(String title)
        {
            this.title = title;
        }

        public String getPriority()
        {
            return priority;
        }

        public void setPriority(String priority)
        {
            this.priority = priority;
        }

        public String getIssueDefName()
        {
            return issueDefName;
        }

        public void setIssueDefName(String issueDefName)
        {
            this.issueDefName = issueDefName;
        }

        public String getContainerPath()
        {
            return containerPath;
        }

        public void setContainerPath(String containerPath)
        {
            this.containerPath = containerPath;
        }

        public String getFirstname()
        {
            return firstname;
        }

        public void setFirstname(String firstname)
        {
            this.firstname = firstname;
        }

        public String getLastname()
        {
            return lastname;
        }

        public void setLastname(String lastname)
        {
            this.lastname = lastname;
        }

        public String getEmail()
        {
            return email;
        }

        public void setEmail(String email)
        {
            this.email = email;
        }

        public String getInstitution()
        {
            return institution;
        }

        public void setInstitution(String institution)
        {
            this.institution = institution;
        }

        public String getProject()
        {
            return project;
        }

        public void setProject(String project)
        {
            this.project = project;
        }

        public String getReason()
        {
            return reason;
        }

        public void setReason(String reason)
        {
            this.reason = reason;
        }

        public String getHostname()
        {
            return hostname;
        }

        public void setHostname(String hostname)
        {
            this.hostname = hostname;
        }
    }

    @IgnoresTermsOfUse
    @AllowedDuringUpgrade
    @RequiresPermission(InsertPermission.class)
    public static class UpdateSelfRegistrationListAction extends MutatingApiAction<SelfRegistrationForm>
    {
        public static final String _issueStatus = "open";
        public static final String _schemaPath = "issues";

        @Override
        public ApiResponse execute(SelfRegistrationForm form, BindException errors)
        {
            Container container = ContainerManager.getForPath(form.getContainerPath());
            User user = getViewContext().getUser();
            saveIssue(user, container, form);
            return new ApiSimpleResponse();
        }

        // takes the form data and inserts a new issue into the issue tracker (value of issueDefName)
        public static void saveIssue(User user, Container container, SelfRegistrationForm form)
        {
            String hostname = form.getHostname();

            Map<String, Object> row = new CaseInsensitiveHashMap<>();
            row.put("Title", form.getTitle());
            row.put("AssignedTo", form.getAssignedTo());
            row.put("Status", _issueStatus);
            row.put("firstname", form.getFirstname());
            row.put("lastname", form.getLastname());
            row.put("email", form.getEmail());
            row.put("institution", form.getInstitution());
            row.put("project", form.getProject());
            row.put("reason", form.getReason());
            row.put("priority", form.getPriority());

            // get issue table and insert the issue row
            UserSchema userSchema = QueryService.get().getUserSchema(user, container, _schemaPath);
            TableInfo table = userSchema.getTable(form.getIssueDefName());
            QueryService.get().getSelectSQL(table,null,null,null,100,0,false);
            QueryUpdateService qus = table.getUpdateService();

            BatchValidationException batchErrors = new BatchValidationException();
            List<Map<String, Object>> results;

            try
            {
                results = qus.insertRows(user, container, Collections.singletonList(row), batchErrors, null, null);
                if (!batchErrors.hasErrors())
                {
                    assert results.size() == 1;
                    //send in the list id
                    String id;
                    Map<String,Object> formresult = results.get(0);
                    id = formresult.get("IssueId").toString();

                    SelfRegistrationNotification t = new SelfRegistrationNotification(id,hostname);
                    t.sendManually(container,user);
                }
                else
                    throw batchErrors;
            } catch (Exception e)
            {
                _log.error(e.getMessage());
                throw new RuntimeException(e);
            }


        }

    }
    public static class TestCase extends Assert
    {
        private static final String adminUser = "admin_user_test@primate.wisc.edu";
        private static final String containerPath = "/PrivateTest";
        private static final String schemaName = "issues";
        private static final String issueTable = "userregistrations";

        // creates fields in issue tracker
        public static void createTextFields(Domain d, String[] fields, User user) throws ChangePropertyDescriptorException
        {
            String typeUri = d.getTypeURI();
            for (String field : fields){
                DomainProperty prop = d.addProperty();
                prop.setName(field);
                prop.setPropertyURI(typeUri + "#" + field);
                //to test different field types:
                //prop.setType(PropertyService.get().getType(c, PropertyType.MULTI_LINE.getXmlName()));
            }
            d.save(user);
        }

        @BeforeClass
        public static void setUp() throws ValidEmail.InvalidEmailException, ChangePropertyDescriptorException, SecurityManager.UserManagementException, InvalidGroupMembershipException
        {
            // create container
            Container rootContainer = ContainerManager.getRoot();
            Container container = ContainerManager.createContainer(rootContainer,"PrivateTest");
            Group group = GroupManager.getGroup(rootContainer, "Guests", GroupEnumType.SITE);
            if (null == group)
            {
                throw new ConfigurationException("Could not add group specified in startup properties GroupRoles: " + "Guest");
            }
            // give guest submit perms
            MutableSecurityPolicy policy = new MutableSecurityPolicy(container);
            RoleManager.getAllRoles();
            //what is the roleName for submitter?
            policy.addRoleAssignment(group, SubmitterRole.class);
            SecurityPolicyManager.savePolicy(policy);

            // ensure the issue module is enabled for this folder
            Module issueModule = ModuleLoader.getInstance().getModule("Issues");
            Set<Module> activeModules = container.getActiveModules();
            if (!activeModules.contains(issueModule))
            {
                Set<Module> newActiveModules = new HashSet<>();
                newActiveModules.addAll(activeModules);
                newActiveModules.add(issueModule);

                container.setActiveModules(newActiveModules);
            }

            // teamcity doesn't know about this user since it's an ephemeral DB, need to create an admin user and assign admin role.
            SecurityManager.NewUserStatus newUserStatus = SecurityManager.addUser(new ValidEmail(adminUser), null);
            User adminUser = newUserStatus.getUser();
            Group adminGroup = GroupManager.getGroup(rootContainer, "Administrators", GroupEnumType.SITE);
            SecurityManager.addMember(adminGroup, adminUser);

            // create issue tracker
            int issueDefId = IssuesListDefService.get().createIssueListDef(container, adminUser,"IssueDefinition","User Registrations", null,null);
            // The Domain object is the definition of the "table" that contains the custom fields.
            Domain d = IssuesListDefService.get().getDomainFromIssueDefId(issueDefId, container, adminUser);
            String[] fieldnames = {"firstname","lastname","email","institution","project","reason"};
            createTextFields(d,fieldnames,adminUser);

            SelfRegistrationForm f = new SelfRegistrationForm();
            f.setTitle("testtitle");
            f.setAssignedTo("0");
            f.setPriority("2");
            f.setFirstname("testfirstname");
            f.setLastname("testlastname");
            f.setEmail("testemail@email.com");
            f.setInstitution("testinstitution");
            f.setProject("testproject");
            f.setReason("testreason");
            f.setIssueDefName(issueTable);
            f.setContainerPath(containerPath);

            User guestUser = UserManager.getGuestUser();
            // create issue in issue tracker
            UpdateSelfRegistrationListAction.saveIssue(guestUser, container, f);

        }


        @Test
        public void testIssueWasCreated() throws Exception
        {
            //see if issue was created
            User us = UserManager.getUser(new ValidEmail(adminUser));
            Container container = ContainerManager.getForPath(containerPath);

            UserSchema userSchema = QueryService.get().getUserSchema(us, container, schemaName);
            TableInfo table = userSchema.getTable(issueTable);

            TableSelector ts = new TableSelector(table, PageFlowUtil.set("issueid","title","assignedto","firstname","lastname","email","institution","project","reason"),null,new Sort("-issueid"));
            Map<String, Object>[] mp = ts.getMapArray();
            ts.getRowCount();
            Map<String,Object> issue = mp[0];

            Assert.assertEquals("testfirstname",issue.get("firstname"));
            Assert.assertEquals("testlastname",issue.get("lastname"));
            Assert.assertEquals("testemail@email.com",issue.get("email"));
            Assert.assertEquals("testinstitution",issue.get("institution"));
            Assert.assertEquals("testproject",issue.get("project"));
            Assert.assertEquals("testreason",issue.get("reason"));
            Assert.assertEquals(0,issue.get("assignedto"));
            Assert.assertEquals("testtitle",issue.get("title"));

        }

        @AfterClass
        public static void cleanUp() throws ValidEmail.InvalidEmailException, SecurityManager.UserManagementException
        {
            //remove the container, not really needed in TeamCity, but good for local testing
            User adminuser = UserManager.getUser(new ValidEmail(adminUser));
            Container container = ContainerManager.getForPath(containerPath);
            ContainerManager.delete(container,UserManager.getUser(new ValidEmail(adminUser)));

            //also delete the admin user
            UserManager.deleteUser(adminuser.getUserId());
        }
    }

}