package org.labkey.wnprc_ehr.etl;

import org.labkey.api.di.columnTransform.ColumnTransform;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MgapParseIdTransform extends ColumnTransform
{
    //Potential Rhesus Macaque Id patterns to match against
    private static List<Pattern> _patternList = new ArrayList<>()
    {{
        add(Pattern.compile(".*(r[0-9]{5}).*", Pattern.CASE_INSENSITIVE));
        add(Pattern.compile(".*(rh[0-9]{4}).*", Pattern.CASE_INSENSITIVE));
        add(Pattern.compile(".*(rh-[0-9]{3}).*", Pattern.CASE_INSENSITIVE));
        add(Pattern.compile(".*(rh[a-z]{2}[0-9]{2}).*", Pattern.CASE_INSENSITIVE));

        //these are to handle legacy id patterns
        add(Pattern.compile(".*(rh-[a-z][0-9]{2}).*", Pattern.CASE_INSENSITIVE));
        add(Pattern.compile(".*(rh[0-9,a-z]{4}).*", Pattern.CASE_INSENSITIVE));
        //special naming for a rhesus/stump tail monkey from the 70s
        add(Pattern.compile(".*(sr-n[0-9]{2}).*", Pattern.CASE_INSENSITIVE));
    }};

    @Override
    protected Object doTransform(Object inputValue)
    {
        String parsedId = null;
        String originalId = (String) getInputValue();
        if (originalId != null && originalId.trim().length() > 0)
        {
            parsedId = originalId.replace("WNPRC-", "");

            for (Pattern idPattern : _patternList)
            {
                Matcher idMatcher = idPattern.matcher(parsedId);
                if (idMatcher.find())
                {
                    parsedId = idMatcher.group(1);
                    break;
                }
            }
        }

        return parsedId;
    }
}
