package com.github.jonathonrichardson.java2ts.test.testclasses;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Jon on 4/3/2017.
 */
@SerializeToTS
public class SimpleClassWithArray {
    public List<String> texts = new ArrayList<>();
}
