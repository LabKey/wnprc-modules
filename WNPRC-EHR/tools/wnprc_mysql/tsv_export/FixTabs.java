/*
 * Copyright (c) 2009-2015 LabKey Corporation
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
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class FixTabs
{
    public static void main(String[] args)
        throws IOException
    {
        Pattern datePattern = Pattern.compile("(\\d\\d\\d\\d)-(\\d\\d)-(\\d\\d)");
        Pattern timePattern = Pattern.compile("(\\d?\\d\\d):(\\d\\d):(\\d\\d)");
        BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
        PrintStream out = new PrintStream(System.out, false, "UTF-8");
        String line = null; String nextLine = null;
        nextLine = reader.readLine();
        int lineNo = 0;
        while (null != nextLine)
        {
            line = nextLine;
            nextLine = reader.readLine();
            ++lineNo;

            // join multi-line values
            while ((null != nextLine) && ("\\".equals(nextLine)))
            {
                String joinLine = reader.readLine();
                if (null == joinLine)
                    break;
                line = line + "\\r" + joinLine;
                nextLine = reader.readLine();
                ++lineNo;
            }

            // remove null characters
            line = line.replaceAll("\\\\0", "");

            // fix bad dates. replace with '0001-01-01'.
            Matcher dateMatcher = datePattern.matcher(line);
            StringBuffer sb = new StringBuffer(line.length());
            while (dateMatcher.find())
            {
                boolean badYear = "0000".equals(dateMatcher.group(1));
                boolean badMonth = "00".equals(dateMatcher.group(2));
                boolean badDay = "00".equals(dateMatcher.group(3));
                String replaceString = dateMatcher.group();
                if (badYear || badMonth || badDay)
                {
                    replaceString =
                        (badYear  ? "0001" : dateMatcher.group(1)) + "-" +
                        (badMonth ?   "01" : dateMatcher.group(2)) + "-" +
                        (badDay   ?   "01" : dateMatcher.group(3));
                    System.err.println("Fixed bad date: " + dateMatcher.group() + " line " + lineNo);
                }
                dateMatcher.appendReplacement(sb, replaceString);
            }
            dateMatcher.appendTail(sb);

            // fix bad times. replace with '00:00:00'
            Matcher timeMatcher = timePattern.matcher(sb);
            StringBuffer fixedLine = new StringBuffer(sb.length());
            while (timeMatcher.find())
            {
                String match = timeMatcher.group();
                if ((Integer.parseInt(timeMatcher.group(1)) > 23) || (Integer.parseInt(timeMatcher.group(2)) > 59) || (Integer.parseInt(timeMatcher.group(3)) > 59))
                {
                    timeMatcher.appendReplacement(fixedLine, "00:00:00");
                    System.err.println("Fixed bad time: " + timeMatcher.group() + " line " + lineNo);
                }
                else {
                    timeMatcher.appendReplacement(fixedLine, match);
                }
            }
            timeMatcher.appendTail(fixedLine);

            out.print(fixedLine);
            out.print("\n");
        }
    }
}
