package com.github.jonathonrichardson.java2ts.test.testclasses;

import com.github.jonathonrichardson.java2ts.annotation.AllowNull;

import java.util.Date;

/**
 * Created by Jon on 3/26/2017.
 */
public class SimpleClassWithDate {
    public String value;
    public Date startDate;
    @AllowNull
    public Date nullableStartDate;
}
