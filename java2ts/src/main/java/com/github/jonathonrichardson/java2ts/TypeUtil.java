package com.github.jonathonrichardson.java2ts;

import java.lang.reflect.*;

/**
 * Created by Jon on 4/3/2017.
 */
public class TypeUtil {
    private enum PREFIX {
        CLASS ("class "),
        INTERFACE ("interface ")
        ;

        String startText;

        PREFIX(String text) {
            this.startText = text;
        }

        String getPrefix() {
            return this.startText;
        }
    }

    public static Class<?> getClassFromType(java.lang.reflect.Type type) throws ClassNotFoundException {
        String className = getClassName(type);

        if (className == null || className.isEmpty()) {
            return null;
        }

        return Class.forName(className);
    }

    private static String getClassName(java.lang.reflect.Type type) {
        if (type == null) {
            return "";
        }

        String className = type.toString();

        for (PREFIX prefix : PREFIX.values()) {
            if (className.startsWith(prefix.getPrefix())) {
                className = className.substring(prefix.getPrefix().length());
            }
        }

        return className;
    }
}
