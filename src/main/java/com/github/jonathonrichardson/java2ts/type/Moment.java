package com.github.jonathonrichardson.java2ts.type;

import com.github.jonathonrichardson.java2ts.Type;

import java.util.*;


/**
 * Created by jon on 3/24/17.
 */
public class Moment implements Type {
    @Override
    public Set<Class> getJavaClasses() {
        Set<Class> classes = new HashSet<>();

        classes.add(Date.class);

        return classes;
    }

    @Override
    public String getCastString(String input) {
        return String.format(
                "moment(%s)",
                input
        );
    }

    @Override
    public String getTypescriptTypeName() {
        return "Moment";
    }

    @Override
    public List<String> getImports() {
        return Arrays.asList(
                "import moment = require(\"moment\");",
                "import Moment = moment.Moment;"
        );
    }
}
