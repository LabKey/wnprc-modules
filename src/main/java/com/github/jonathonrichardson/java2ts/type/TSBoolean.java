package com.github.jonathonrichardson.java2ts.type;

import com.github.jonathonrichardson.java2ts.Type;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by Jon on 3/26/2017.
 */
public class TSBoolean implements Type {
    @Override
    public Set<Class> getJavaClasses() {
        Set<Class> classes = new HashSet<>();
        classes.add(boolean.class);
        classes.add(Boolean.class);
        return classes;
    }

    @Override
    public String getCastString(String input) {
        return String.format("(%s.toString().toLowerCase() === 'true') ? true : false", input);
    }

    @Override
    public String getTypescriptTypeName() {
        return "boolean";
    }
}
