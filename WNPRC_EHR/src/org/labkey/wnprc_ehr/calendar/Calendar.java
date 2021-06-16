package org.labkey.wnprc_ehr.calendar;

import org.json.JSONObject;

import java.time.LocalDate;

public interface Calendar
{
    JSONObject getEventsAsJson(LocalDate startDate, LocalDate endDate) throws Exception;

    default String getTextColor(String backgroundColor) {
        int r, g, b;
        double hsp;
        int offset = 0;

        if (backgroundColor.startsWith("#")) {
            offset = 1;
        }

        r = Integer.parseInt(backgroundColor.substring(offset, offset + 2), 16);
        g = Integer.parseInt(backgroundColor.substring(offset + 2, offset + 4), 16);
        b = Integer.parseInt(backgroundColor.substring(offset + 4, offset + 6), 16);

        // HSP equation from http://alienryderflex.com/hsp.html
        hsp = Math.sqrt(
                0.299 * (r * r) +
                0.587 * (g * g) +
                0.114 * (b * b)
        );

        // Using the HSP value, determine whether the color is light or dark
        if (hsp>127.5) {

            return "#000000";
        }
        else {

            return "#FFFFFF";
        }
    }
}