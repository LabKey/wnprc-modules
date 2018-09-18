package com.github.jonathonrichardson.java2ts.test.testclasses;

import com.github.jonathonrichardson.java2ts.annotation.AllowNull;
import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

/**
 * Created by Jon on 3/26/2017.
 */
@SerializeToTS
public class FullyLoadedBurritoClass {
    public boolean isYes;
    public Boolean isNo;

    public short short1;
    public Short short2;

    public int int1;
    public Integer int2;

    public long long1;
    public Long long2;

    public float float1;
    public Float float2;

    public double double1;
    public Double double2;

    public String string;

    public SimpleEnum enumValue;

    @AllowNull
    public SimpleEnum enumValueThatCouldBeNull;
}
