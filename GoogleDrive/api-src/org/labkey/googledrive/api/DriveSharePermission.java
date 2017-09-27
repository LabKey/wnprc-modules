package org.labkey.googledrive.api;

/**
 * Created by jon on 1/19/17.
 */
public enum DriveSharePermission {
    OWNER     ("owner"),
    WRITER    ("writer"),
    COMMENTER ("commenter"),
    READER    ("reader")
    ;

    String _value;

    DriveSharePermission(String value) {
        _value = value;
    }

    public String getValue() {
        return _value;
    }
}
