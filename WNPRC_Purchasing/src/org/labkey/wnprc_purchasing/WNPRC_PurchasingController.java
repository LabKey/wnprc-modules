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

import com.fasterxml.jackson.annotation.JsonInclude;
import org.labkey.api.action.MutatingApiAction;
import org.labkey.api.action.SimpleViewAction;
import org.labkey.api.action.SpringActionController;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.api.DataType;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.module.ModuleHtmlView;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.security.RequiresPermission;
import org.labkey.api.security.permissions.InsertPermission;
import org.labkey.api.security.permissions.ReadPermission;
import org.labkey.api.view.NavTree;
import org.springframework.validation.BindException;
import org.springframework.web.servlet.ModelAndView;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class WNPRC_PurchasingController extends SpringActionController
{
    private static final DefaultActionResolver _actionResolver = new DefaultActionResolver(WNPRC_PurchasingController.class);
    public static final String NAME = "wnprc_purchasing";

    public WNPRC_PurchasingController()
    {
        setActionResolver(_actionResolver);
    }

    @RequiresPermission(ReadPermission.class)
    public class PurchasingRequestAction extends SimpleViewAction
    {
        public ModelAndView getView(Object o, BindException errors)
        {
            return ModuleHtmlView.get(ModuleLoader.getInstance().getModule("WNPRC_Purchasing"), ModuleHtmlView.getGeneratedViewPath("RequestEntry"));
        }

        public void addNavTrail(NavTree root) { }
    }

    @RequiresPermission(InsertPermission.class)
    public class SubmitRequestAction extends MutatingApiAction<RequestForm>
    {
        @Override
        public Object execute(RequestForm requestForm, BindException errors) throws Exception
        {
            BatchValidationException validationErrors = new BatchValidationException();
            UserSchema us = QueryService.get().getUserSchema(getUser(), getContainer(), "ehr_purchasing");
            TableInfo ti = us.getTable("purchasingRequests");
            String requestId = UUID.randomUUID().toString().toUpperCase();
            List<Map<String, Object>> rows = new ArrayList<>();

             Map<String, Object> row = new CaseInsensitiveHashMap<>();
             row.put("requestId", requestId);
             row.put("vendorId", requestForm.getVendor());
             row.put("account", requestForm.getAccount());
             row.put("shippingInfo", requestForm.getShippingDestination());
             row.put("justification", requestForm.getPurpose());
             row.put("shippingAttentionTo", requestForm.getDeliveryAttentionTo());
             row.put("comments", requestForm.getComments());
             row.put("assignedTo", getUser().getUserId()); //TODO : change, this will be set to purchasing admin
             rows.add(row);
             WNPRC_PurchasingManager.get().insertData(getContainer(), getUser(), ti, rows);


            return success();
        }
    }

    public static class RequestForm
    {
        Object[] _lineItems;
        Integer _account;
        String _accountOther;
        Integer _vendor;
        String _purpose;
        Integer _shippingDestination;
        String _deliveryAttentionTo;
        String _comments;
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

        public Object[] getLineItems()
        {
            return _lineItems;
        }

        public void setLineItems(Object[] lineItems)
        {
            _lineItems = lineItems;
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

        public String getDeliveryAttentionTo()
        {
            return _deliveryAttentionTo;
        }

        public void setDeliveryAttentionTo(String deliveryAttentionTo)
        {
            _deliveryAttentionTo = deliveryAttentionTo;
        }

        public String getComments()
        {
            return _comments;
        }

        public void setComments(String comments)
        {
            _comments = comments;
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
    }

    public class LineItem
    {
        String _item;
        Boolean _controlledSubstance;
        String _itemUnit;
        Double _quantity;
        Double _unitPrice;

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

        public Double getQuantity()
        {
            return _quantity;
        }

        public void setQuantity(Double quantity)
        {
            _quantity = quantity;
        }

        public Double getUnitPrice()
        {
            return _unitPrice;
        }

        public void setUnitPrice(Double unitPrice)
        {
            _unitPrice = unitPrice;
        }
    }

    public class NewVendor
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
