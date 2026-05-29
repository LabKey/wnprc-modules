/*
 * Copyright (c) 2018-2026 Board of Regents of the University of Wisconsin System
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
