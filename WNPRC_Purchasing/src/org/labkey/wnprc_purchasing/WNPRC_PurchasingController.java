/*
 * Copyright (c) 2020 LabKey Corporation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.labkey.wnprc_purchasing;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.json.old.JSONArray;
import org.json.old.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.ReadOnlyApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.admin.notification.NotificationService;
import org.labkey.api.data.ColumnInfo;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.data.Filter;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.Sort;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.ModuleHtmlView;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.MemberType;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.RoleAssignment;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.util.ConfigurationException;
import org.labkey.api.util.DateUtil;
import org.labkey.api.util.MailHelper;
import org.labkey.api.util.emailTemplate.EmailTemplateService;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.Portal;
import org.labkey.api.view.WebPartFactory;
import org.labkey.wnprc_purchasing.security.WNPRC_PurchasingDirectorRole;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import java.io.IOException;
import java.math.BigDecimal;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class WNPRC_PurchasingController extends SpringActionController
{
    private static final Logger _log = LogManager.getLogger(WNPRC_PurchasingController.class);
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_PurchasingController.class);
    public static final String NAME = "wnprc_purchasing";
    public static final Double ADDITIONAL_REVIEW_AMT = 5000.0; // additional review is required for requests >= $5000
    private static final String FOLDER_ADMIN_ROLE = "Folder Administrator";

    public WNPRC_PurchasingController()
    {
        setActionResolver(_actionResolver);
    }

    @NotNull
    private List<User> getFolderAdmins()
    {
        List<RoleAssignment> folderAdminGroups = getContainer().getPolicy().getAssignments().stream().filter(roleAssignment -> roleAssignment.getRole().getName().equals(FOLDER_ADMIN_ROLE)).collect(Collectors.toList());
        List<User> folderAdmins = new ArrayList<>();
        for (RoleAssignment folderAdmin : folderAdminGroups)
        {
            int userId = folderAdmin.getUserId();
            //handle individual users assigned to folder admin role
            if (null == SecurityManager.getGroup(userId))
            {
                folderAdmins.add(UserManager.getUser(userId));
            }
            //handle groups assigned to folder admin role
            else
            {
                Set<User> activeUsers = SecurityManager.getAllGroupMembers(SecurityManager.getGroup(userId), MemberType.ACTIVE_USERS);
                folderAdmins.addAll(activeUsers);
            }

        }

        return folderAdmins;
    }

    @RequiresPermission(InsertPermission.class)
    public class RequesterAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            WebPartFactory factory = Portal.getPortalPartCaseInsensitive("WNPRC Purchasing Requester");
            Portal.WebPart part = factory.createWebPart();
            getPageConfig().setTitle("Purchasing Requester");
            return Portal.getWebPartViewSafe(factory, getViewContext(), part);
        }

        public void addNavTrail(NavTree root) { }
    }

    @RequiresPermission(AdminPermission.class)
    public class PurchaseAdminAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            WebPartFactory factory = Portal.getPortalPartCaseInsensitive("WNPRC Purchasing Admin");
            getPageConfig().setTitle("Purchasing Admin");
            Portal.WebPart part = factory.createWebPart();
            return Portal.getWebPartViewSafe(factory, getViewContext(), part);
        }

        public void addNavTrail(NavTree root) { }
    }

    @RequiresPermission(UpdatePermission.class)
    public class PurchaseReceiverAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            WebPartFactory factory = Portal.getPortalPartCaseInsensitive("WNPRC Purchasing Receiver");
            getPageConfig().setTitle("Purchasing Receiver");
            Portal.WebPart part = factory.createWebPart();
            return Portal.getWebPartViewSafe(factory, getViewContext(), part);
        }

        public void addNavTrail(NavTree root) { }
    }

    @RequiresPermission(ReadPermission.class)
    public class PurchasingRequestAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            ModuleHtmlView view = ModuleHtmlView.get(ModuleLoader.getInstance().getModule("WNPRC_Purchasing"), ModuleHtmlView.getGeneratedViewPath("RequestEntry"));
            getPageConfig().setTitle("Purchasing Request Entry Form");

            return view;
        }

        public void addNavTrail(NavTree root) { }
    }

    @RequiresPermission(InsertPermission.class)
    public class GetFolderAdminsAction extends ReadOnlyApiAction
    {
        @Override
        public Object execute(Object o, BindException errors) throws Exception
        {
            Map<String, Object> resultProperties = new HashMap<>();
            List<User> folderAdmins = getFolderAdmins(); //this doesn't include site admins
            JSONArray results = new JSONArray();

            for (User user : folderAdmins)
            {
                JSONObject json = new JSONObject();
                json.put("userId", user.getUserId());
                json.put("displayName", user.getDisplayName(getUser()));
                results.put(json);
            }

            resultProperties.put("success", true);
            resultProperties.put("results", results);
            return new ApiSimpleResponse(resultProperties);
        }
    }

    @RequiresPermission(InsertPermission.class)
    public class SubmitRequestAction extends MutatingApiAction<RequestForm>
    {
        @Override
        public Object execute(RequestForm requestForm, BindException errors) throws Exception
        {
            //get old line items to compare the difference with new incoming changes
            List<LineItem> oldLineItems = null;
            if (requestForm.getRowId() != null)
            {
                TableInfo tableInfo = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_purchasing").getTable("lineItems", null);
                Filter filter = new SimpleFilter(FieldKey.fromString("requestRowId"), requestForm.getRowId());
                TableSelector tableSelector = new TableSelector(tableInfo, filter, new Sort("rowId"));
                oldLineItems = tableSelector.getArrayList(LineItem.class);
            }

            //get old status to compare the difference with new status change
            String oldStatusVal = "";
            if (requestForm.getRowId() != null)
            {
                TableInfo tableInfo = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_purchasing").getTable("purchasingRequests", null);
                Filter filter = new SimpleFilter(FieldKey.fromString("rowId"), requestForm.getRowId());
                Set<FieldKey> columns = new HashSet<>();
                columns.add(FieldKey.fromString("rowId"));
                columns.add(FieldKey.fromString("qcState/Label"));
                final Map<FieldKey, ColumnInfo> colMap = QueryService.get().getColumns(tableInfo, columns);
                TableSelector tableSelector = new TableSelector(tableInfo, colMap.values(), filter, null);
                oldStatusVal = String.valueOf(tableSelector.getMap().get(colMap.get(FieldKey.fromString("qcState/Label")).getAlias()));
            }

            List<ValidationException> validationExceptions = WNPRC_PurchasingManager.get().submitRequestForm(getUser(), getContainer(), requestForm);

            if (validationExceptions.size() > 0)
            {
                throw new BatchValidationException(validationExceptions, null);
            }

            //email notification
            EmailTemplateForm emailTemplateForm = getValuesForEmailTemplate(requestForm);

            try
            {
                //if its a new request or a reorder
                if ((null != requestForm.getIsNewRequest() && requestForm.getIsNewRequest()) ||
                        (null != requestForm.getIsReorder() && requestForm.getIsReorder()))
                {
                    sendNewRequestEmailNotification(emailTemplateForm);
                }
                else
                {
                    sendRequestChangeEmailNotification(oldStatusVal, emailTemplateForm, requestForm, oldLineItems);
                }
            }
            catch (ConfigurationException | MessagingException | IOException | ValidationException e)
            {
                _log.error("Error sending purchasing email notification for request # " + requestForm.getRowId(), e);
            }

            ApiSimpleResponse response = new ApiSimpleResponse();
            response.put("success", true);
            response.put("requestId", requestForm.getRowId());

            return response;
        }

        private void sendRequestChangeEmailNotification(String oldStatus, EmailTemplateForm emailTemplateForm, RequestForm requestForm, @Nullable List<LineItem> oldLineItems) throws MessagingException, IOException, ValidationException
        {
            List<User> usersWithInsertPerm = SecurityManager.getUsersWithPermissions(getContainer(), Collections.singleton(InsertPermission.class));

            //get the lab end user who originated the request
            List <User> labEndUsers = usersWithInsertPerm.stream().filter(u -> u.getUserId() == emailTemplateForm.getRequester().getUserId()).collect(Collectors.toList());
            User endUser = labEndUsers.size() == 1 ? labEndUsers.get(0) : null;

            //request status change email notification
            if ((StringUtils.isBlank(oldStatus) || !emailTemplateForm.getRequestStatus().equalsIgnoreCase(oldStatus))
                    && (emailTemplateForm.getRequestStatus().equalsIgnoreCase("Request Rejected") ||
                        emailTemplateForm.getRequestStatus().equalsIgnoreCase("Order Placed") ||
                        emailTemplateForm.getRequestStatus().equalsIgnoreCase("Request Approved"))
               )
            {
                RequestStatusChangeEmailTemplate requestEmailTemplate = EmailTemplateService.get().getEmailTemplate(RequestStatusChangeEmailTemplate.class);
                requestEmailTemplate.setNotificationBean(emailTemplateForm);
                String emailSubject = requestEmailTemplate.renderSubject(getContainer());
                String emailBody = requestEmailTemplate.renderBody(getContainer());

                //request over 5k is approved or rejected - send notif to purchase admins
                if (emailTemplateForm.getTotalCost().compareTo(BigDecimal.valueOf(ADDITIONAL_REVIEW_AMT)) >= 0 &&
                        (emailTemplateForm.getRequestStatus().equalsIgnoreCase("Request Rejected") ||
                        emailTemplateForm.getRequestStatus().equalsIgnoreCase("Request Approved")))
                {
                    //get purchasing dir userId
                    Map<Integer, String> purchasingDirUserIds = getPurchasingDirectorUserIds();

                    //get folder admin users
                    List<User> adminUsers = getFolderAdmins();

                    //send emails to admins minus purchasing director
                    for (User user : adminUsers)
                    {
                        if (!purchasingDirUserIds.containsKey(user.getUserId()))
                        {
                            NotificationService.get().sendMessageForRecipient(
                                    getContainer(), UserManager.getUser(getUser().getUserId()), user,
                                    emailSubject, emailBody,
                                    getDataEntryFormUrl(emailTemplateForm.getRowId(), new ActionURL(WNPRC_PurchasingController.PurchaseAdminAction.class, getContainer())),
                                    String.valueOf(emailTemplateForm.getRowId()), "Request approved or rejected status");
                        }
                    }
                }
                else
                {
                    //send email to the lab end user who originated the request
                    if (endUser != null)
                    {
                        NotificationService.get().sendMessageForRecipient(
                                getContainer(), UserManager.getUser(getUser().getUserId()), endUser,
                                emailSubject, emailBody,
                                getDataEntryFormUrl(emailTemplateForm.getRowId(),  new ActionURL(WNPRC_PurchasingController.RequesterAction.class, getContainer())),
                                String.valueOf(emailTemplateForm.getRowId()), "Request status change");
                    }
                }
            }
            //identify line item changes

            //get updated line items from the db
            TableInfo tableInfo = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_purchasing").getTable("lineItems", null);
            SimpleFilter filter = new SimpleFilter(FieldKey.fromString("requestRowId"), requestForm.getRowId());
            TableSelector tableSelector = new TableSelector(tableInfo, filter, new Sort("rowId"));
            List<LineItem> updatedLineItems = tableSelector.getArrayList(LineItem.class);

            //deleted rows
            List<LineItem> removed = oldLineItems.stream().filter(o1 -> updatedLineItems.stream().noneMatch(o2 -> o2.getRowId() == o1.getRowId())).collect(Collectors.toList());

            List<LineItem> quantityChange = updatedLineItems.stream().filter(o1 -> oldLineItems.stream().noneMatch(o2 -> o1.getRowId() == o2.getRowId()
                                                                                    && o2.getQuantity() == o1.getQuantity())).collect(Collectors.toList());

            boolean fullQuantityReceived = updatedLineItems.stream().filter(o2 -> o2.getQuantityReceived() >= o2.getQuantity()).count() == updatedLineItems.size();

            if (removed.size() > 0 || quantityChange.size() > 0 || fullQuantityReceived)
            {
                LineItemChangeEmailTemplate lineItemChangeEmailTemplate = EmailTemplateService.get().getEmailTemplate(LineItemChangeEmailTemplate.class);
                lineItemChangeEmailTemplate.setUpdatedLineItemsList(updatedLineItems);
                lineItemChangeEmailTemplate.setOldLineItemsList(oldLineItems);
                lineItemChangeEmailTemplate.setDeletedLineItemFlag(removed.size() > 0);
                lineItemChangeEmailTemplate.setFullQuantityReceivedFlag(fullQuantityReceived);
                lineItemChangeEmailTemplate.setNotificationBean(emailTemplateForm);
                String emailSubject = lineItemChangeEmailTemplate.renderSubject(getContainer());
                String emailBody = lineItemChangeEmailTemplate.renderHtmlBody(getContainer()).toString();

                //send email to lab end user who originated the request
                if (endUser != null)
                {
                        MailHelper.MultipartMessage message = MailHelper.createMultipartMessage();
                        lineItemChangeEmailTemplate.renderSenderToMessage(message, getContainer());
                        message.setEncodedHtmlContent(emailBody);
                        message.setSubject(emailSubject);

                        try
                        {
                            message.setRecipient(Message.RecipientType.TO, new InternetAddress(endUser.getEmail()));
                            MailHelper.send(message, getUser(), getContainer());
                        }
                        catch (AddressException e)
                        {
                            _log.error("Error sending line item update message to " + endUser.getEmail() , e);
                            throw new MessagingException(e.getMessage(), e);
                        }
                }
            }
        }

        private Map<Integer, String> getPurchasingDirectorUserIds()
        {
            Map<Integer, String> purchasingDirUserIds = new HashMap<>();
            for (RoleAssignment roleAssignment : getContainer().getPolicy().getAssignments())
            {
                if (roleAssignment.getRole().getName().equals(WNPRC_PurchasingDirectorRole.PURCHASING_DIRECTOR_ROLE_NAME))
                {
                    purchasingDirUserIds.put(roleAssignment.getUserId(), roleAssignment.getRole().getName());
                }
            }
            return purchasingDirUserIds;
        }

        private void sendNewRequestEmailNotification(EmailTemplateForm emailTemplateForm) throws MessagingException, IOException, ValidationException
        {
            NewRequestEmailTemplate requestEmailTemplate = EmailTemplateService.get().getEmailTemplate(NewRequestEmailTemplate.class);
            requestEmailTemplate.setNotificationBean(emailTemplateForm);
            String emailSubject = requestEmailTemplate.renderSubject(getContainer());
            String emailBody = requestEmailTemplate.renderBody(getContainer());

            List<User> folderAdmins = getFolderAdmins();

            //send emails to all folder admins, which includes purchasing director for purchases >= $5000
            if (emailTemplateForm.getTotalCost().compareTo(BigDecimal.valueOf(ADDITIONAL_REVIEW_AMT)) >= 0)
            {
                for (User user : folderAdmins)
                {
                    NotificationService.get().sendMessageForRecipient(
                            getContainer(), UserManager.getUser(getUser().getUserId()), user,
                            emailSubject, emailBody,
                            getDataEntryFormUrl(emailTemplateForm.getRowId(),  new ActionURL(WNPRC_PurchasingController.PurchaseAdminAction.class, getContainer())),
                            String.valueOf(emailTemplateForm.getRowId()), "New request over $5000");
                }
            }
            //send emails to all folder admins minus the purchasing director for purchases < $5000
            else
            {
                //get purchasing dir userId
                Map<Integer, String> purchasingDirUserIds = getPurchasingDirectorUserIds();

                for (User user : folderAdmins)
                {
                    if (!purchasingDirUserIds.containsKey(user.getUserId()))
                    {
                        NotificationService.get().sendMessageForRecipient(
                                getContainer(), UserManager.getUser(getUser().getUserId()), user,
                                emailSubject, emailBody,
                                getDataEntryFormUrl(emailTemplateForm.getRowId(), new ActionURL(WNPRC_PurchasingController.PurchaseAdminAction.class, getContainer())),
                                String.valueOf(emailTemplateForm.getRowId()), "New request");
                    }
                }
            }
        }

        private ActionURL getDataEntryFormUrl(Integer requestId, ActionURL returnUrl)
        {
            ActionURL linkUrl = new ActionURL(WNPRC_PurchasingController.PurchasingRequestAction.class, getContainer());
            linkUrl.addParameter("requestRowId", requestId);
            linkUrl.addParameter("returnUrl", returnUrl.getPath());
            return linkUrl;
        }

        private EmailTemplateForm getValuesForEmailTemplate(RequestForm requestForm)
        {
            TableInfo tableInfo = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_purchasing").getTable("purchasingRequestsOverviewForEmailTemplate", null);
            SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("requestNum"), requestForm.getRowId());
            TableSelector tableSelector = new TableSelector(tableInfo, filter, null);
            EmailTemplateForm emailTemplateForm = new EmailTemplateForm();
            Map<String, Object> map = tableSelector.getMap();
            emailTemplateForm.setRowId((Integer) map.get("requestNum"));
            emailTemplateForm.setVendor((String) map.get("vendor"));
            emailTemplateForm.setRequester(UserManager.getUser((Integer) map.get("requester")));
            emailTemplateForm.setRequestDate((Date) map.get("requestdate"));
            emailTemplateForm.setTotalCost((BigDecimal)map.get("totalcost"));
            emailTemplateForm.setRequestStatus((String)map.get("requeststatus"));
            emailTemplateForm.setRejectReason((String)map.get("rejectReason"));
            if (null != map.get("orderdate"))
            {
                emailTemplateForm.setOrderDate((Date) map.get("orderdate"));
            }

            return emailTemplateForm;
        }
    }

    @JsonIgnoreProperties(ignoreUnknown=true)
    public static class LineItem
    {
        @JsonProperty("rowId")
        int _rowId;

        @JsonProperty("requestRowId")
        int _requestRowId;

        @JsonProperty("item")
        String _item;

        @JsonProperty("itemUnit")
        int _itemUnitId;

        @JsonProperty("controlledSubstance")
        boolean _controlledSubstance;

        @JsonProperty("quantity")
        int _quantity;

        @JsonProperty("quantityReceived")
        int _quantityReceived;

        @JsonProperty("unitCost")
        double _unitCost;

        DecimalFormat _dollarFormat = new DecimalFormat("$#,##0.00");

        @Override
        public boolean equals(Object o) {
            if (this == o) return true;
            if (o == null || getClass() != o.getClass()) return false;

            LineItem that = (LineItem) o;
            return  this.getRowId() == that.getRowId() &&
                    this.getRequestRowId() == that.getRequestRowId() &&
                    this.getItem().equals(that.getItem()) &&
                    this.getItemUnitId() == that.getItemUnitId()&&
                    this.getControlledSubstance() == that.getControlledSubstance() &&
                    this.getQuantity() == that.getQuantity() &&
                    this.getQuantityReceived() == that.getQuantityReceived() &&
                    this.getUnitCost() == that.getUnitCost();
        }

        public int getRowId()
        {
            return _rowId;
        }

        public void setRowId(int rowId)
        {
            _rowId = rowId;
        }

        public int getRequestRowId()
        {
            return _requestRowId;
        }

        public void setRequestRowId(int requestRowId)
        {
            _requestRowId = requestRowId;
        }

        public String getItem()
        {
            return _item;
        }

        public void setItem(String item)
        {
            _item = item;
        }

        public int getItemUnitId()
        {
            return _itemUnitId;
        }

        public void setItemUnitId(int itemUnitId)
        {
            _itemUnitId = itemUnitId;
        }

        public boolean getControlledSubstance()
        {
            return _controlledSubstance;
        }

        public void setControlledSubstance(boolean controlledSubstance)
        {
            _controlledSubstance = controlledSubstance;
        }

        public int getQuantity()
        {
            return _quantity;
        }

        public void setQuantity(int quantity)
        {
            _quantity = quantity;
        }

        public int getQuantityReceived()
        {
            return _quantityReceived;
        }

        public void setQuantityReceived(int quantityReceived)
        {
            _quantityReceived = quantityReceived;
        }

        public double getUnitCost()
        {
            return _unitCost;
        }

        public String getFormattedUnitCost()
        {
            return _dollarFormat.format(getUnitCost());
        }

        public void setUnitCost(double unitCost)
        {
            _unitCost = unitCost;
        }
    }

    public class EmailTemplateForm
    {
        Integer _rowId;
        String _vendor;
        String _requestStatus;
        String _rejectReason;
        Date _requestDate;
        Date _orderDate;
        User _requester;
        BigDecimal _totalCost;

        DateFormat _dateFormat = new SimpleDateFormat(DateUtil.getDateFormatString(ContainerManager.getRoot()));
        DecimalFormat _dollarFormat = new DecimalFormat("$#,##0.00");

        public Integer getRowId()
        {
            return _rowId;
        }

        public void setRowId(Integer rowId)
        {
            this._rowId = rowId;
        }

        public String getVendor()
        {
            return _vendor;
        }

        public void setVendor(String vendor)
        {
            this._vendor = vendor;
        }

        public String getRequestStatus()
        {
            return _requestStatus;
        }

        public void setRequestStatus(String requestStatus)
        {
            this._requestStatus = requestStatus;
        }

        public String getRejectReason()
        {
            return _rejectReason;
        }

        public void setRejectReason(String rejectReason)
        {
            _rejectReason = rejectReason;
        }

        public String getRequestDate()
        {
            return _dateFormat.format(_requestDate);
        }

        public void setRequestDate(Date requestDate)
        {
            this._requestDate = requestDate;
        }

        public String getOrderDate()
        {
            return _dateFormat.format(_orderDate);
        }

        public void setOrderDate(Date orderDate)
        {
            this._orderDate = orderDate;
        }

        public String getRequesterFriendlyName()
        {
            return _requester.getFriendlyName();
        }

        public User getRequester()
        {
            return _requester;
        }

        public void setRequester(User requester)
        {
            this._requester = requester;
        }

        public BigDecimal getTotalCost()
        {
            return _totalCost;
        }

        public String getFormattedTotalCost()
        {
            return _dollarFormat.format(_totalCost);
        }

        public void setTotalCost(BigDecimal totalCost)
        {
            this._totalCost = totalCost;
        }
    }

    public static class RequestForm
    {
        List<JSONObject> _lineItems;
        List<Integer> _lineItemsToDelete;
        Integer _rowId;
        Integer _account;
        String _accountOther;
        Integer _vendor;
        String _purpose;
        Integer _shippingDestination;
        String _shippingAttentionTo;
        String _comments;
        Integer _qcState;
        String _rejectReason;
        Integer _assignedTo;
        Integer _paymentOption;
        String _program;
        String _confirmNum;
        String _invoiceNum;
        Date _orderDate;
        Date _cardPostDate;
        Boolean _hasNewVendor;
        String _newVendorName;
        String _newVendorStreetAddress;
        String _newVendorCity;
        String _newVendorState;
        String _newVendorCountry;
        String _newVendorZip;
        String _newVendorPhoneNumber;
        String _newVendorFaxNumber;
        String _newVendorEmail;
        String _newVendorUrl;
        String _newVendorNotes;
        BigDecimal _totalCost;
        String _qcStateLabel;
        Boolean _isNewRequest;
        Boolean _isReorder;

        public List<JSONObject> getLineItems()
        {
            return _lineItems;
        }

        public void setLineItems(List<JSONObject> lineItems)
        {
            _lineItems = lineItems;
        }

        public List<Integer> getLineItemsToDelete()
        {
            return _lineItemsToDelete;
        }

        public void setLineItemsToDelete(List<Integer> lineItemsToDelete)
        {
            _lineItemsToDelete = lineItemsToDelete;
        }

        public Integer getRowId()
        {
            return _rowId;
        }

        public void setRowId(Integer rowId)
        {
            _rowId = rowId;
        }

        public Integer getAccount()
        {
            return _account;
        }

        public void setAccount(Integer account)
        {
            _account = account;
        }

        public String getAccountOther()
        {
            return _accountOther;
        }

        public void setAccountOther(String accountOther)
        {
            _accountOther = accountOther;
        }

        public Integer getVendor()
        {
            return _vendor;
        }

        public void setVendor(Integer vendor)
        {
            _vendor = vendor;
        }

        public String getPurpose()
        {
            return _purpose;
        }

        public void setPurpose(String purpose)
        {
            _purpose = purpose;
        }

        public Integer getShippingDestination()
        {
            return _shippingDestination;
        }

        public void setShippingDestination(Integer shippingDestination)
        {
            _shippingDestination = shippingDestination;
        }

        public String getShippingAttentionTo()
        {
            return _shippingAttentionTo;
        }

        public void setShippingAttentionTo(String shippingAttentionTo)
        {
            _shippingAttentionTo = shippingAttentionTo;
        }

        public String getComments()
        {
            return _comments;
        }

        public void setComments(String comments)
        {
            _comments = comments;
        }

        public Integer getQcState()
        {
            return _qcState;
        }

        public void setQcState(Integer qcState)
        {
            _qcState = qcState;
        }

        public String getRejectReason()
        {
            return _rejectReason;
        }

        public void setRejectReason(String rejectReason)
        {
            _rejectReason = rejectReason;
        }

        public Integer getAssignedTo()
        {
            return _assignedTo;
        }

        public void setAssignedTo(Integer assignedTo)
        {
            _assignedTo = assignedTo;
        }

        public Integer getPaymentOption()
        {
            return _paymentOption;
        }

        public void setPaymentOption(Integer paymentOption)
        {
            _paymentOption = paymentOption;
        }

        public String getProgram()
        {
            return _program;
        }

        public void setProgram(String program)
        {
            _program = program;
        }

        public String getConfirmNum()
        {
            return _confirmNum;
        }

        public void setConfirmNum(String confirmNum)
        {
            _confirmNum = confirmNum;
        }

        public String getInvoiceNum()
        {
            return _invoiceNum;
        }

        public void setInvoiceNum(String invoiceNum)
        {
            _invoiceNum = invoiceNum;
        }

        public Date getOrderDate()
        {
            return _orderDate;
        }

        public void setOrderDate(Date orderDate)
        {
            _orderDate = orderDate;
        }

        public Date getCardPostDate()
        {
            return _cardPostDate;
        }

        public void setCardPostDate(Date cardPostDate)
        {
            _cardPostDate = cardPostDate;
        }

        public Boolean getHasNewVendor()
        {
            return _hasNewVendor;
        }

        public void setHasNewVendor(Boolean hasNewVendor)
        {
            _hasNewVendor = hasNewVendor;
        }

        public String getNewVendorName()
        {
            return _newVendorName;
        }

        public void setNewVendorName(String newVendorName)
        {
            _newVendorName = newVendorName;
        }

        public String getNewVendorStreetAddress()
        {
            return _newVendorStreetAddress;
        }

        public void setNewVendorStreetAddress(String newVendorStreetAddress)
        {
            _newVendorStreetAddress = newVendorStreetAddress;
        }

        public String getNewVendorCity()
        {
            return _newVendorCity;
        }

        public void setNewVendorCity(String newVendorCity)
        {
            _newVendorCity = newVendorCity;
        }

        public String getNewVendorState()
        {
            return _newVendorState;
        }

        public void setNewVendorState(String newVendorState)
        {
            _newVendorState = newVendorState;
        }

        public String getNewVendorCountry()
        {
            return _newVendorCountry;
        }

        public void setNewVendorCountry(String newVendorCountry)
        {
            _newVendorCountry = newVendorCountry;
        }

        public String getNewVendorZip()
        {
            return _newVendorZip;
        }

        public void setNewVendorZip(String newVendorZip)
        {
            _newVendorZip = newVendorZip;
        }

        public String getNewVendorPhoneNumber()
        {
            return _newVendorPhoneNumber;
        }

        public void setNewVendorPhoneNumber(String newVendorPhoneNumber)
        {
            _newVendorPhoneNumber = newVendorPhoneNumber;
        }

        public String getNewVendorFaxNumber()
        {
            return _newVendorFaxNumber;
        }

        public void setNewVendorFaxNumber(String newVendorFaxNumber)
        {
            _newVendorFaxNumber = newVendorFaxNumber;
        }

        public String getNewVendorEmail()
        {
            return _newVendorEmail;
        }

        public void setNewVendorEmail(String newVendorEmail)
        {
            _newVendorEmail = newVendorEmail;
        }

        public String getNewVendorUrl()
        {
            return _newVendorUrl;
        }

        public void setNewVendorUrl(String newVendorUrl)
        {
            _newVendorUrl = newVendorUrl;
        }

        public String getNewVendorNotes()
        {
            return _newVendorNotes;
        }

        public void setNewVendorNotes(String newVendorNotes)
        {
            _newVendorNotes = newVendorNotes;
        }

        public BigDecimal getTotalCost()
        {
            return _totalCost;
        }

        public void setTotalCost(BigDecimal totalCost)
        {
            _totalCost = totalCost;
        }

        public String getQcStateLabel()
        {
            return _qcStateLabel;
        }

        public void setQcStateLabel(String qcStateLabel)
        {
            _qcStateLabel = qcStateLabel;
        }

        public Boolean getIsNewRequest()
        {
            return _isNewRequest;
        }

        public void setIsNewRequest(Boolean newRequest)
        {
            _isNewRequest = newRequest;
        }

        public Boolean getIsReorder()
        {
            return _isReorder;
        }

        public void setIsReorder(Boolean reorder)
        {
            _isReorder = reorder;
        }
    }

    public static class NewVendor
    {
        String _vendorName;
        String _streetAddress;
        String _city;
        String _state;
        String _country;
        String _zip;
        String _phoneNumber;
        String _faxNumber;
        String _email;
        String _url;
        String _notes;

        public String getVendorName()
        {
            return _vendorName;
        }

        public void setVendorName(String vendorName)
        {
            _vendorName = vendorName;
        }

        public String getStreetAddress()
        {
            return _streetAddress;
        }

        public void setStreetAddress(String streetAddress)
        {
            _streetAddress = streetAddress;
        }

        public String getCity()
        {
            return _city;
        }

        public void setCity(String city)
        {
            _city = city;
        }

        public String getState()
        {
            return _state;
        }

        public void setState(String state)
        {
            _state = state;
        }

        public String getCountry()
        {
            return _country;
        }

        public void setCountry(String country)
        {
            _country = country;
        }

        public String getZip()
        {
            return _zip;
        }

        public void setZip(String zip)
        {
            _zip = zip;
        }

        public String getPhoneNumber()
        {
            return _phoneNumber;
        }

        public void setPhoneNumber(String phoneNumber)
        {
            _phoneNumber = phoneNumber;
        }

        public String getFaxNumber()
        {
            return _faxNumber;
        }

        public void setFaxNumber(String faxNumber)
        {
            _faxNumber = faxNumber;
        }

        public String getEmail()
        {
            return _email;
        }

        public void setEmail(String email)
        {
            _email = email;
        }

        public String getUrl()
        {
            return _url;
        }

        public void setUrl(String url)
        {
            _url = url;
        }

        public String getNotes()
        {
            return _notes;
        }

        public void setNotes(String notes)
        {
            _notes = notes;
        }
    }
}
