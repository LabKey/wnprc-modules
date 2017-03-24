package com.github.jonathonrichardson.java2ts;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

/**
 * Created by jon on 3/24/17.
 */
public interface Type {
    Set<Class> getJavaClasses();
    String getCastString(String input);
    String getTypescriptTypeName();

    default public List<String> getImports() {
        return new ArrayList<>();
    }
}
