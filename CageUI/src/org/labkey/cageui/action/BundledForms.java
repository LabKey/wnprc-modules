package org.labkey.cageui.action;

import java.util.ArrayList;
import java.util.Map;

public class BundledForms
{
    Map<String, Object> _ehrRoomsForm;
    AllHistoryForm _newAllHistoryForm;
    AllHistoryForm _prevAllHistoryForm;
    RoomHistoryForm _roomHistoryForm;
    ArrayList<CageModificationHistoryForm> _cageModificationHistoryForm;
    ArrayList<TemplateLayoutHistoryForm> _templateLayoutHistoryForm;
    ArrayList<LayoutHistoryForm> _layoutHistoryForm;
    ArrayList<CageHistoryForm> _cageHistoryForm;
    ArrayList<RacksForm> _newRacksForm;
    ArrayList<RacksForm> _prevRacksForm;
    CagesFormWithContext _newCagesForm;
    CagesFormWithContext _prevCagesForm;

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

    public RoomHistoryForm getRoomHistoryForm()
    {
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

    public ArrayList<CageHistoryForm> getCageHistoryForm()
    {
        return _cageHistoryForm;
    }

    public void setCageHistoryForm(ArrayList<CageHistoryForm> cageHistoryForm)
    {
        _cageHistoryForm = cageHistoryForm;
    }

    public ArrayList<RacksForm> getNewRacksForm()
    {
        return _newRacksForm;
    }

    public void setNewRacksForm(ArrayList<RacksForm> newRacksForm)
    {
        _newRacksForm = newRacksForm;
    }

    public ArrayList<RacksForm> getPrevRacksForm()
    {
        return _prevRacksForm;
    }

    public void setPrevRacksForm(ArrayList<RacksForm> prevRacksForm)
    {
        _prevRacksForm = prevRacksForm;
    }

    public CagesFormWithContext getNewCagesForm()
    {
        return _newCagesForm;
    }

    public void setNewCagesForm(CagesFormWithContext newCagesForm)
    {
        _newCagesForm = newCagesForm;
    }

    public CagesFormWithContext getPrevCagesForm()
    {
        return _prevCagesForm;
    }

    public void setPrevCagesForm(CagesFormWithContext prevCagesForm)
    {
        _prevCagesForm = prevCagesForm;
    }

    public Map<String, Object> getEhrRoomsForm()
    {
        return _ehrRoomsForm;
    }

    public void setEhrRoomsForm(Map<String, Object> ehrRoomsForm)
    {
        _ehrRoomsForm = ehrRoomsForm;
    }
}
