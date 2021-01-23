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

import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;
import org.labkey.api.collections.CaseInsensitiveHashMap;
import org.labkey.api.data.Container;
import org.labkey.api.data.DbScope;
import org.labkey.api.data.TableInfo;
import org.labkey.api.exp.api.ExperimentService;
import org.labkey.api.exp.property.DomainUtil;
import org.labkey.api.gwt.client.model.GWTDomain;
import org.labkey.api.gwt.client.model.GWTPropertyDescriptor;
import org.labkey.api.module.ModuleLoader;
import org.labkey.api.query.BatchValidationException;
import org.labkey.api.query.QueryService;
import org.labkey.api.query.QueryUpdateService;
import org.labkey.api.query.UserSchema;
import org.labkey.api.query.ValidationException;
import org.labkey.api.reader.TabLoader;
import org.labkey.api.resource.FileResource;
import org.labkey.api.resource.Resource;
import org.labkey.api.security.User;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class WNPRC_PurchasingManager
{
    private static final WNPRC_PurchasingManager _instance = new WNPRC_PurchasingManager();
    private static final String INITIAL_DATA_FOLDER = "data/";

    private static final String DOMAIN_NAME = "EHR_Purchasing";
    private static final String PURCHASING_REQUEST_TABLE_NAME = "purchasingRequests";

    private WNPRC_PurchasingManager()
    {
        // prevent external construction with a private default constructor
    }

    public static WNPRC_PurchasingManager get()
    {
        return _instance;
    }

    public void addLineItemStatus(Container c, User user)
    {
        addData(c, user, "ehr_purchasing", "lineItemStatus", "lineItemStatus.tsv");
    }

    public void addItemUnits(Container c, User user)
    {
        addData(c, user, "ehr_purchasing", "itemUnits", "itemUnits.tsv");
    }

    public void addQCStatus(Container c, User user)
    {
        addData(c, user, "core", "QCState", "QCStatus.tsv");
    }

    private void addData(Container c, User user, String schemaName, String tableName, String fileName)
    {
        TableInfo table = QueryService.get().getUserSchema(user, c, schemaName).getTable(tableName);

        Resource resource = ModuleLoader.getInstance().getModule(WNPRC_PurchasingModule.class).getModuleResource(INITIAL_DATA_FOLDER + fileName);
        File dataFile = ((FileResource) resource).getFile();
        TabLoader tabLoader = new TabLoader(dataFile, true);
        List<Map<String, Object>> data = tabLoader.load();

        insertData(c, user, table, data);
    }

    public void insertData(Container c, User user, TableInfo table, List<Map<String, Object>> data)
    {
        BatchValidationException errors = new BatchValidationException();

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            if (table != null)
            {
                QueryUpdateService qus = table.getUpdateService();
                qus.insertRows(user, c, data, errors, null, null);
            }
            if (errors.hasErrors())
                throw errors;

            transaction.commit();
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }

    public void submitRequestForm(User user, Container container, WNPRC_PurchasingController.RequestForm requestForm)
    {
        UserSchema us = QueryService.get().getUserSchema(user, container, "ehr_purchasing");
        boolean isNewRequest = null == requestForm.getRowId();
        List<Map<String, Object>> insertedPurchasingReq = new ArrayList<>();

        Map<String, Object> row;

        //New vendor data
        List<Map<String, Object>> newVendorData = new ArrayList<>();
        if (requestForm.getHasNewVendor())
        {
            row = new CaseInsensitiveHashMap<>();
            row.put("vendorName", requestForm.getNewVendorName());
            row.put("streetAddress", requestForm.getNewVendorStreetAddress());
            row.put("city", requestForm.getNewVendorCity());
            row.put("state", requestForm.getNewVendorState());
            row.put("country", requestForm.getNewVendorCountry());
            row.put("zip", requestForm.getNewVendorZip());
            row.put("phoneNumber", requestForm.getNewVendorPhoneNumber());
            row.put("faxNumber", requestForm.getNewVendorFaxNumber());
            row.put("email", requestForm.getNewVendorEmail());
            row.put("url", requestForm.getNewVendorUrl());
            row.put("notes", requestForm.getNewVendorNotes());
            //TODO: set qc state - need to verify workflow with client
            newVendorData.add(row);
        }

        //Purchasing request data
        List<Map<String, Object>> purchasingRequestsData = new ArrayList<>();

        row = new CaseInsensitiveHashMap<>();
        if (null != requestForm.getRowId()) {
            row.put("rowId", requestForm.getRowId());
        }
        row.put("vendorId", requestForm.getVendor());
        row.put("account", requestForm.getAccount());
        row.put("otherAcctAndInves", requestForm.getAccountOther());
        row.put("shippingInfoId", requestForm.getShippingDestination());
        row.put("justification", requestForm.getPurpose());
        row.put("shippingAttentionTo", requestForm.getDeliveryAttentionTo());
        row.put("comments", requestForm.getComments());
        //TODO: update assignedTo
        row.put("assignedTo", null != requestForm.getAssignedTo() ? requestForm.getAssignedTo() : user.getUserId());
        row.put("qcState", requestForm.getQcState());
        row.put("creditCardOptionId", requestForm.getCreditCardOption());
        row.put("program", requestForm.getProgram());
        row.put("confirmationNum", requestForm.getConfirmNum());
        row.put("invoiceNum", requestForm.getInvoiceNum());
        purchasingRequestsData.add(row);

        // insert data
        BatchValidationException errors = new BatchValidationException();

        try (DbScope.Transaction transaction = ExperimentService.get().ensureTransaction())
        {
            TableInfo vendorTable = us.getTable("vendor");
            TableInfo purchasingRequestsTable = us.getTable("purchasingRequests");
            TableInfo lineItemsTable = us.getTable("lineItems");

            QueryUpdateService qus;

            if (vendorTable != null && newVendorData.size() > 0)
            {
                qus = vendorTable.getUpdateService();
                assert qus != null;
                List<Map<String, Object>> rowsInserted = qus.insertRows(user, container, newVendorData, errors, null, null);

                //set new vendor's id
                if (rowsInserted.size() == 1 && purchasingRequestsData.get(0).get("vendorId") == null) {
                    purchasingRequestsData.get(0).put("vendorId", rowsInserted.get(0).get("rowId"));
                }
            }

            if (purchasingRequestsTable != null)
            {
                qus = purchasingRequestsTable.getUpdateService();
                assert qus != null;
                if (isNewRequest)
                {
                    insertedPurchasingReq = qus.insertRows(user, container, purchasingRequestsData, errors, null, null);
                }
                else
                {
                    insertedPurchasingReq = qus.updateRows(user, container, purchasingRequestsData, null, null, null);
                }
                requestForm.setRowId((Integer) insertedPurchasingReq.get(0).get("rowId"));
            }

            //Line items data
            List<Map<String, Object>> newLineItemsData = new ArrayList<>();
            List<Map<String, Object>> updatedLineItemsData = new ArrayList<>();
            for (JSONObject lineItem : requestForm.getLineItems())
            {
                row = new CaseInsensitiveHashMap<>();
                row.put("requestRowId", insertedPurchasingReq.get(0).get("rowId"));
                row.put("item", lineItem.get("item"));
                row.put("itemUnitId", lineItem.get("itemUnit"));
                row.put("unitCost", lineItem.get("unitCost"));
                row.put("quantity", lineItem.get("quantity"));
                row.put("controlledSubstance", lineItem.get("controlledSubstance"));

                if(null != lineItem.get("rowId"))
                {
                    row.put("rowId", lineItem.get("rowId"));
                    updatedLineItemsData.add(row);
                }
                else
                {
                    newLineItemsData.add(row);
                }
            }

            if (lineItemsTable != null)
            {
                qus = lineItemsTable.getUpdateService();
                assert qus != null;

                if (newLineItemsData.size() > 0)
                {
                    qus.insertRows(user, container, newLineItemsData, errors, null, null);
                }
                if (updatedLineItemsData.size() > 0)
                {
                    qus.updateRows(user, container, updatedLineItemsData, null, null, null);
                }
            }

            if (errors.hasErrors())
                throw errors;

            transaction.commit();
        }
        catch (Exception e)
        {
            throw new RuntimeException(e);
        }
    }

    public void addExtensibleColumns(Container container, User user)
    {
        addPurchasingRequestsCols(container, user);
    }

    private void addPurchasingRequestsCols(Container container, User user)
    {
        GWTDomain<GWTPropertyDescriptor> domain = new GWTDomain<>();
        domain.setName(PURCHASING_REQUEST_TABLE_NAME);
        List<GWTPropertyDescriptor> extensibleCols = new ArrayList<>();

        GWTPropertyDescriptor otherAcctAndInves = new GWTPropertyDescriptor();
        otherAcctAndInves.setName("otherAcctAndInves");
        otherAcctAndInves.setRangeURI("string");
        otherAcctAndInves.setLabel("Other Acct and Investigator");
        otherAcctAndInves.setDescription("User will be required to fill out this column when 'Account to charge' is 'Other' on the Request Entry form");
        extensibleCols.add(otherAcctAndInves);

        GWTPropertyDescriptor ccOptionId = new GWTPropertyDescriptor();
        ccOptionId.setName("creditCardOptionId");
        ccOptionId.setRangeURI("int");
        extensibleCols.add(ccOptionId);

        GWTPropertyDescriptor program = new GWTPropertyDescriptor();
        program.setName("program");
        program.setRangeURI("string");
        program.setDefaultValue("4");
        extensibleCols.add(program);

        GWTPropertyDescriptor invoiceNum = new GWTPropertyDescriptor();
        invoiceNum.setName("invoiceNum");
        invoiceNum.setRangeURI("string");
        extensibleCols.add(invoiceNum);

        GWTPropertyDescriptor confirmNum = new GWTPropertyDescriptor();
        confirmNum.setName("confirmationNum");
        confirmNum.setRangeURI("string");
        extensibleCols.add(confirmNum);

        domain.setFields(extensibleCols);

        try {
            DomainUtil.createDomain(DOMAIN_NAME, domain, null, container, user, null, null);
        }
        catch (ValidationException ve) {
            throw new RuntimeException(ve.getMessage(), ve);
        }
    }
}