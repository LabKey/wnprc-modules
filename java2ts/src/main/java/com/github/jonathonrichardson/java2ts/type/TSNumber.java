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
