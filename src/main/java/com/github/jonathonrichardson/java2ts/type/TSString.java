package com.github.jonathonrichardson.java2ts.type;

import com.github.jonathonrichardson.java2ts.Type;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by jon on 3/24/17.
 */
public class TSString implements Type {
    @Override
    public Set<Class> getJavaClasses() {
        Set<Class> classes = new HashSet<>();

        classes.add(String.class);

        return classes;
    }

    @Override
    public String getCastString(String input) {
        return input;
    }

    @Override
    public String getTypescriptTypeName() {
        return "string";
    }
}
