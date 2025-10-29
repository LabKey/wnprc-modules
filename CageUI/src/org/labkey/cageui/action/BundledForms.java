package org.labkey.cageui.action;

import java.util.ArrayList;

public class BundledForms
{
    AllHistoryForm _newAllHistoryForm;
    AllHistoryForm _prevAllHistoryForm;
    RoomHistoryForm _roomHistoryForm;
    ArrayList<CageModificationHistoryForm> _cageModificationHistoryForm;
    ArrayList<TemplateLayoutHistoryForm> _templateLayoutHistoryForm;
    ArrayList<LayoutHistoryForm> _layoutHistoryForm;

    public AllHistoryForm getNewAllHistoryForm()
    {
        return _newAllHistoryForm;
    }

    public void setNewAllHistoryForm(AllHistoryForm allHistoryForm)
    {
        _newAllHistoryForm = allHistoryForm;
    }

    public AllHistoryForm getPrevAllHistoryForm()
    {
        return _prevAllHistoryForm;
    }

    public void setPrevAllHistoryForm(AllHistoryForm allHistoryForm)
    {
        _prevAllHistoryForm = allHistoryForm;
    }

    public RoomHistoryForm getRoomHistoryForm(){
        return _roomHistoryForm;
    }

    public void setRoomHistoryForm(RoomHistoryForm roomHistoryForm)
    {
        _roomHistoryForm = roomHistoryForm;
    }

    public ArrayList<CageModificationHistoryForm> getCageModificationHistoryForm()
    {
        return _cageModificationHistoryForm;
    }

    public void setCageModificationHistoryForm(ArrayList<CageModificationHistoryForm> cageModificationHistoryForm)
    {
        _cageModificationHistoryForm = cageModificationHistoryForm;
    }

    public ArrayList<TemplateLayoutHistoryForm> getTemplateLayoutHistoryForm()
    {
        return _templateLayoutHistoryForm;
    }

    public void setTemplateLayoutHistoryForm(ArrayList<TemplateLayoutHistoryForm> templateLayoutHistoryForm)
    {
        _templateLayoutHistoryForm = templateLayoutHistoryForm;
    }

    public ArrayList<LayoutHistoryForm> getLayoutHistoryForm()
    {
        return _layoutHistoryForm;
    }

    public void setLayoutHistoryForm(ArrayList<LayoutHistoryForm> layoutHistoryForm)
    {
        _layoutHistoryForm = layoutHistoryForm;
    }
}
