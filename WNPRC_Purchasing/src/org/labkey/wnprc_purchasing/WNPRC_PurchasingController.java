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
import org.json.JSONObject;
import org.labkey.api.action.ApiSimpleResponse;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.admin.notification.NotificationService;
import org.labkey.api.data.SimpleFilter;
import org.labkey.api.data.TableInfo;
import org.labkey.api.data.TableSelector;
import org.labkey.api.module.ModuleHtmlView;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.FieldKey;
import org.labkey.api.query.InvalidKeyException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateServiceException;
import org.labkey.api.query.ValidationException;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.SecurityManager;
import org.labkey.api.security.User;
import org.labkey.api.security.UserManager;
import org.labkey.api.security.permissions.AdminPermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.security.permissions.UpdatePermission;
import org.labkey.api.view.ActionURL;
import org.labkey.api.view.NavTree;
import org.labkey.api.view.Portal;
import org.labkey.api.view.WebPartFactory;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import javax.mail.MessagingException;
import java.io.IOException;
import java.math.BigDecimal;
import java.sql.SQLException;
import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;

public class WNPRC_PurchasingController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_PurchasingController.class);
    public static final String NAME = "wnprc_purchasing";

    public WNPRC_PurchasingController()
    {
        setActionResolver(_actionResolver);
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
    public class SubmitRequestAction extends MutatingApiAction<RequestForm>
    {
        @Override
        public Object execute(RequestForm requestForm, BindException errors) throws Exception
        {
            List<ValidationException> validationExceptions = WNPRC_PurchasingManager.get().submitRequestForm(getUser(), getContainer(), requestForm);

            if (validationExceptions.size() > 0)
            {
                throw new BatchValidationException(validationExceptions, null);
            }

            EmailTemplateForm emailTemplateForm = getValuesForEmailTemplate(requestForm);

            if (null != requestForm.getIsNewRequest() && requestForm.getIsNewRequest())
            {
                sendNewRequestEmailNotification(emailTemplateForm);
            }
            else
            {
                sendChangeRequestEmailNotification(emailTemplateForm);
            }
            ApiSimpleResponse response = new ApiSimpleResponse();
            response.put("success", true);
            response.put("requestId", requestForm.getRowId());

            return response;
        }

        private void sendChangeRequestEmailNotification(EmailTemplateForm emailTemplateForm) throws MessagingException, IOException, ValidationException
        {
            //request status change email notification
            if (emailTemplateForm.getRequestStatus().equalsIgnoreCase("Request Rejected") || emailTemplateForm.getRequestStatus().equalsIgnoreCase("Order Placed"))
            {
                RequestStatusChangeEmailTemplate requestEmailTemplate = new RequestStatusChangeEmailTemplate(emailTemplateForm);
                String emailSubject = requestEmailTemplate.renderSubject(getContainer());
                String emailBody = requestEmailTemplate.renderBody(getContainer());

                ActionURL requesterViewUrl = new ActionURL(WNPRC_PurchasingController.RequesterAction.class, getContainer());

                List<User> labEndUsers = SecurityManager.getUsersWithPermissions(getContainer(), Collections.singleton(InsertPermission.class));

                //send emails to lab end users
                for (User user : labEndUsers)
                {
                    if (!getContainer().hasPermission(user, AdminPermission.class))
                    {
                        NotificationService.get().sendMessageForRecipient(
                                getContainer(), UserManager.getUser(getUser().getUserId()), user,
                                emailSubject, emailBody,
                                requesterViewUrl, String.valueOf(emailTemplateForm.getRowId()), "Request status change");
                    }
                }
            }
        }

        private void sendNewRequestEmailNotification(EmailTemplateForm emailTemplateForm) throws MessagingException, IOException, ValidationException
        {
            NewRequestEmailTemplate requestEmailTemplate = new NewRequestEmailTemplate(emailTemplateForm);
            String emailSubject = requestEmailTemplate.renderSubject(getContainer());
            String emailBody = requestEmailTemplate.renderBody(getContainer());
            ActionURL detailsUrl = new ActionURL("query", "executeQuery", getContainer());
            detailsUrl.addParameter("schemaName", "ehr_purchasing");
            detailsUrl.addParameter("query.queryName", "purchasingRequestsOverviewForAdmins");
            detailsUrl.addParameter("query.viewName", "AllOpenRequests");
            detailsUrl.addParameter("query.requestNum~eq", emailTemplateForm.getRowId());

            if (emailTemplateForm.getTotalCost().compareTo(BigDecimal.valueOf(5000.0)) == 1)
            {
                //get purchase director user
            }
            else
            {
                //get folder admin users
                List<User> adminUsers = SecurityManager.getUsersWithPermissions(getContainer(), Collections.singleton(AdminPermission.class));

                //send emails to admin users
                for (User user : adminUsers)
                {
                    NotificationService.get().sendMessageForRecipient(
                            getContainer(), UserManager.getUser(getUser().getUserId()), user,
                            emailSubject, emailBody,
                            detailsUrl, String.valueOf(emailTemplateForm.getRowId()), "New request");
                }
            }
        }

        private EmailTemplateForm getValuesForEmailTemplate(RequestForm requestForm) throws QueryUpdateServiceException, InvalidKeyException, SQLException
        {
            TableInfo tableInfo = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_purchasing").getTable("purchasingRequestsOverview", null);
            SimpleFilter filter = new SimpleFilter(FieldKey.fromParts("rowId"), requestForm.getRowId());
            TableSelector tableSelector = new TableSelector(tableInfo, filter, null);

            EmailTemplateForm emailTemplateForm = new EmailTemplateForm();
            Map<String, Object> map = tableSelector.getMap();
            emailTemplateForm.setRowId((Integer) map.get("rowid"));
            emailTemplateForm.setVendor((String) map.get("vendor"));
            emailTemplateForm.setRequester(UserManager.getUser((Integer) map.get("requester")));
            emailTemplateForm.setRequestDate((Date) map.get("requestdate"));
            emailTemplateForm.setTotalCost((BigDecimal)map.get("totalcost"));
            emailTemplateForm.setRequestStatus((String)map.get("requeststatus"));
            if (null != map.get("orderdate"))
            {
                emailTemplateForm.setOrderDate((Date) map.get("orderdate"));
            }

            return emailTemplateForm;
        }
    }

    public class EmailTemplateForm
    {
        Integer _rowId;
        String _vendor;
        String _requestStatus;
        Date _requestDate;
        Date _orderDate;
        User _requester;
        BigDecimal _totalCost;

        DateFormat _dateFormat = new SimpleDateFormat("yyyy-MM-dd");
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
        Double _totalCost;
        String _qcStateLabel;
        Boolean _isNewRequest;

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

        public Double getTotalCost()
        {
            return _totalCost;
        }

        public void setTotalCost(Double totalCost)
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
    }

    @JsonIgnoreProperties(ignoreUnknown=true)
    public static class LineItem
    {
        String _item;
        Boolean _controlledSubstance;
        String _itemUnit;
        Number _quantity;
        Number _unitCost;

        public String getItem()
        {
            return _item;
        }

        public void setItem(String item)
        {
            _item = item;
        }

        public Boolean isControlledSubstance()
        {
            return _controlledSubstance;
        }

        public void setControlledSubstance(Boolean controlledSubstance)
        {
            _controlledSubstance = controlledSubstance;
        }

        public String getItemUnit()
        {
            return _itemUnit;
        }

        public void setItemUnit(String itemUnit)
        {
            _itemUnit = itemUnit;
        }

        public Boolean getControlledSubstance()
        {
            return _controlledSubstance;
        }

        public Number getQuantity()
        {
            return _quantity;
        }

        public void setQuantity(Number quantity)
        {
            _quantity = quantity;
        }

        public Number getUnitCost()
        {
            return _unitCost;
        }

        public void setUnitCost(Number unitCost)
        {
            _unitCost = unitCost;
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
