package org.labkey.wnprc_ehr.dataentry.forms.FoodDeprives.FormSections;

import org.labkey.api.data.TableInfo;
import org.labkey.api.ehr.EHRService;
import org.labkey.api.query.FieldKey;
import org.labkey.api.view.template.ClientDependency;
import org.labkey.wnprc_ehr.dataentry.generics.sections.SimpleGridSection;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by fdnicolalde on 3/9/16.
 */
public class FoodDeprivesFormSections extends SimpleGridSection
{
    boolean _isRequest = false;
    private String formName = new String ();

    public FoodDeprivesFormSections(String parentFormName)
    {

        super("study", "foodDeprives", "Food Deprives", EHRService.FORM_SECTION_LOCATION.Body);
        this.addConfigSource("Task");
        setClientStoreClass("EHR.data.FoodDepriveClientStore");
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/data/FoodDepriveClientStore.js"));

        this.addConfigSource("Husbandry");
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddScheduledFoodDeprivesWindow.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddStartedFoodDeprivesWindow.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/UWBoxSelect.css"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));
        _showLocation = true;
        setTemplateMode(TEMPLATE_MODE.NONE);
        formName  = parentFormName;
    }

    public FoodDeprivesFormSections(boolean isRequest, EHRService.FORM_SECTION_LOCATION location)
    {
        super("study", "foodDeprives", "Food Deprives", location);
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddScheduledFoodDeprivesWindow.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/windows/AddStartedFoodDeprivesWindow.js"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/UWBoxSelect.css"));
        addClientDependency(ClientDependency.supplierFromPath("wnprc_ehr/ext4/components/buttons/husbandryButtons.js"));

        _isRequest = isRequest;
    }

    @Override
    public List<String> getTbarMoreActionButtons()
    {
        List<String> defaultButtons = super.getTbarMoreActionButtons();
        defaultButtons.add("REPEAT_SELECTED");

        return defaultButtons;
    }
    @Override
    public List<String> getTbarButtons()
    {
        List<String> defaultButtons = super.getTbarButtons();


        //List<FieldKey> listOfColumns = super.getFieldKeys();

        if (formName.contains("Start")){
            defaultButtons.add(0,"ADDDEPRIVES");
            defaultButtons.add(1,"ADDSTARTTIME");

        }
        if (formName.contains("Complete")){
            defaultButtons.add(0,"ADDSTARTEDDEPRIVES");
            defaultButtons.add(1,"ADDRESTORETIME");
            defaultButtons.remove("ADDRECORD");


        }


        defaultButtons.add(3,"REMOVERECORD");
        defaultButtons.remove("COPYFROMSECTION");
        defaultButtons.remove("TEMPLATES");
        defaultButtons.remove("DELETERECORD");

        return defaultButtons;
    }

    public List<String> getFieldNames()
    {
        if (formName.contains("Start")){
            List<String> gridColumns = new ArrayList<String>();
            gridColumns.add("Id/curLocation/location");
            gridColumns.add("Id");
            gridColumns.add("date");
            gridColumns.add("project");
            gridColumns.add("schedule");
            gridColumns.add("separated");
            gridColumns.add("remarks");
            gridColumns.add("assignedTo");
            gridColumns.add("protocolContact");
            gridColumns.add("depriveStartTime");
            gridColumns.add("depriveStartedBy");


            return gridColumns;
        }
        if (formName.contains("Complete")){
            List<String> gridColumns = new ArrayList<String>();
            gridColumns.add("Id/curLocation/location");
            gridColumns.add("Id");
            gridColumns.add("date");
            gridColumns.add("project");
            gridColumns.add("schedule");
            gridColumns.add("separated");
            gridColumns.add("remarks");
            gridColumns.add("assignedTo");
            gridColumns.add("protocolContact");
            gridColumns.add("restoredTime");
            gridColumns.add("foodRestoredBy");
            gridColumns.add("startedTaskId");

            return gridColumns;
        }
        return null;

        
    }

}
