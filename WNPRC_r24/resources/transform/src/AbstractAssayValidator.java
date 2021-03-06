/*
 * Copyright (c) 2016-2018 LabKey Corporation
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

import java.io.*;
import java.util.*;

/**
 * User: klum
 * Date: May 29, 2009
 */
public abstract class AbstractAssayValidator
{
    private String _email;
    private String _password;
    private File _errorFile;
    private Map<String, String> _runProperties = new HashMap<>();
    private Map<String, String> _transformFile = new HashMap<>();
    private List<String> _errors = new ArrayList<>();
    private String _host;
    private  String ERROR_FILE = "c:\\temp\\Labkey\\error.txt";

    public enum Props {
        assayId,                // the assay id from the run properties field
        runComments,            // run properties comments
        containerPath,
        assayType,              // assay definition name : general, nab, elispot etc.
        assayName,              // assay instance name
        userName,               // user email
        workingDir,             // temp directory that the script will be executed from
        protocolId,             // protocol row id
        protocolLsid,
        protocolDescription,
        runDataFile,
        runDataUploadedFile,
        errorsFile,
        transformedRunPropertiesFile,
    }

    public String getEmail() {
        return _email;
    }

    public String getPassword() {
        return _password;
    }

    public File getErrorFile() {
        return _errorFile;
    }

    public void setErrorFile(File errorFile) {
        _errorFile = errorFile;
    }

    public Map<String, String> getRunProperties() {
        return _runProperties;
    }

    public String getRunProperty(String prop) {
        return getRunProperties().get(prop);
    }

    public String getRunProperty(Props prop) {
        return getRunProperty(prop.name());
    }

    public File getWorkingDir() {
        return new File(getRunProperty(Props.workingDir));
    }

    public List<String> getErrors() {
        return _errors;
    }

    public void setEmail(String email) {
        _email = email;
    }

    public void setPassword(String password) {
        _password = password;
    }

    public void setHost(String host) {
        _host = host;
    }

    public String getHost() {
        return _host;
    }

    public Map<String, String> getTransformFile() {
        return _transformFile;
    }

    protected void writeError(String message, String prop) throws IOException
    {
        if (_errorFile == null)
            setErrorFile(new File(ERROR_FILE));

        if (_errorFile != null)
        {
            _errors.add(message);

            StringBuilder sb = new StringBuilder();
            sb.append("error\t");
            sb.append(prop);
            sb.append('\t');
            sb.append(message);
            sb.append('\n');

            try (PrintWriter pw = new PrintWriter(new BufferedWriter(new FileWriter(_errorFile, true))))
            {
                pw.write(sb.toString().replaceAll("\\\\", "\\\\\\\\"));
            }
        }
        else
            throw new RuntimeException("Errors file does not exist");
    }

    protected void parseRunProperties(File runProperties)
    {
        try (BufferedReader br = new BufferedReader(new FileReader(runProperties)))
        {
            String l;
            while ((l = br.readLine()) != null)
            {
                //System.out.println(l);
                String[] parts = l.split("\t");
                _runProperties.put(parts[0], parts[1]);


                if (Props.runDataFile.name().equals(parts[0]) && parts.length >= 4)
                {
                    _transformFile.put(parts[1], parts[3]);
                }
            }
            if (_runProperties.containsKey(Props.errorsFile.name()))
                setErrorFile(new File(_runProperties.get(Props.errorsFile.name())));
        }
        catch (IOException e)
        {
            throw new RuntimeException(e);
        }
    }

    private int _runErrorLevel = 0;

    protected void setMaxSeverity(int level)
    {
        // 0:NONE, 1:WARN, 2:ERROR
        int value = 0;

        // Don't display warnings if severityLevel set to ERROR
        if(level == 2)
        {
            value = 2;
        }
        else if(!"ERROR".equals(getRunProperty("severityLevel")) && level > _runErrorLevel)
        {
            value = level;
        }

        _runErrorLevel = value;
    }

    protected void writeWarnings() throws IOException
    {
        if(_runErrorLevel > 0)
        {
            try (PrintWriter fileConn = new PrintWriter(new BufferedWriter(new FileWriter(new File(getRunProperty(Props.transformedRunPropertiesFile))))))
            {
                if (_runErrorLevel == 1)
                {
                    fileConn.append("maximumSeverity\tWARN");
                }
                else
                {
                    fileConn.append("maximumSeverity\tERROR");
                }
            }

            // This file gets read and displayed directly as warnings or errors, depending on maximumSeverity level.
            try (PrintWriter errors = new PrintWriter(new BufferedWriter(new FileWriter(new File(getWorkingDir(), "errors.html")))))
            {
                errors.println("Inline warning from Java transform.<br><a href=\"http://www.labkey.test\">Warning link</a>");
            }

            // These two files are just to verify files are available to be downloaded and reviewed
            try (PrintWriter errors = new PrintWriter(new BufferedWriter(new FileWriter(new File(getWorkingDir(), "test1.txt")))))
            {
                errors.println("This is test file 1 (Java).");
            }
            try (PrintWriter errors = new PrintWriter(new BufferedWriter(new FileWriter(new File(getWorkingDir(), "test2.tsv")))))
            {
                errors.println("This is test file 2 (Java).");
            }

            // System output should appear in import
            System.out.println("System.out warning");
            System.err.println("System.err warning");
        }
    }
    /**
     * Parse the tab-delimitted input data file
     */
    protected List<Map<String, String>> parseRunData(File data)
    {
        BufferedReader br = null;
        Map<Integer, String> columnMap = new LinkedHashMap<>();
        List<Map<String, String>> dataMap = new ArrayList<>();

        try {
            br = new BufferedReader(new FileReader(data));
            String l;
            boolean isHeader = true;
            while ((l = br.readLine()) != null)
            {
                if (isHeader)
                {
                    int i=0;
                    for (String col : l.split("\t"))
                        columnMap.put(i++, col.toLowerCase());
                    isHeader = false;
                }
                dataMap.add(parseDataRow(l, columnMap));
            }
            return dataMap;
        }
        catch (Exception e)
        {
            throw new RuntimeException(e.getMessage());
        }
        finally
        {
            if (br != null)
                try {br.close();} catch(IOException ioe) {}
        }
    }

    protected Map<String, String> parseDataRow(String row, Map<Integer, String> columnMap)
    {
        Map<String, String> props = new LinkedHashMap<>();
        int i=0;
        for (String col : row.split("\t"))
        {
            props.put(columnMap.get(i), col);
            i++;
        }
        return props;
    }
}
