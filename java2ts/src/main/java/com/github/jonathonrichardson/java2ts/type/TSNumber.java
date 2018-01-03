package com.github.jonathonrichardson.java2ts.type;

import com.github.jonathonrichardson.java2ts.Type;

import java.util.HashSet;
import java.util.Set;

/**
 * Created by Jon on 3/26/2017.
 */
public class TSNumber implements Type {
    @Override
    public Set<Class> getJavaClasses() {
        Set<Class> classes = new HashSet<>();
        classes.add(short.class);
        classes.add(Short.class);
        classes.add(int.class);
        classes.add(Integer.class);
        classes.add(long.class);
        classes.add(Long.class);
        classes.add(float.class);
        classes.add(Float.class);
        classes.add(double.class);
        classes.add(Double.class);
        return classes;
    }

    @Override
    public String getCastString(String input) {
        return String.format("parseFloat(%s)", input);
    }

    @Override
    public String getTypescriptTypeName() {
        return "number";
    }
}
