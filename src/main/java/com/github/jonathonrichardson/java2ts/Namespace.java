package com.github.jonathonrichardson.java2ts;

import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;
import com.github.jonathonrichardson.java2ts.type.Moment;
import com.github.jonathonrichardson.java2ts.type.TSString;

import java.lang.reflect.Field;
import java.util.*;

/**
 * Created by jon on 3/24/17.
 */
public class Namespace {
    public Map<Class, Type> classes_to_types = new HashMap<>();
    public Map<String, Type> types = new HashMap<>();

    public Namespace() {
        // Add the default types
        this.addType(new Moment());
        this.addType(new TSString());
    }

    public void addClass(Class clazz) {
        this.addType(new TSClass(clazz));
    }

    public void addType(Type type) {
        for (Class clazz : type.getJavaClasses()) {
            classes_to_types.put(clazz, type);
        }

        types.put(type.getTypescriptTypeName(), type);
    }

    public class TSClass implements Type {
        private Class clazz;
        Map<String, Type> members = new HashMap<>();

        public TSClass(Class clazz) {
            this.clazz = clazz;

            for (Field field : clazz.getFields()) {
                String fieldName = field.getName();
                Type fieldType;

                Class fieldClass = field.getType();
                if (!Namespace.this.classes_to_types.containsKey(fieldClass)) {
                    if (!fieldClass.isPrimitive() && hasSerializeToTSAnnotation(clazz)) {
                        Namespace.this.addClass(fieldClass);
                    }
                    else {
                        throw new RuntimeException(String.format("Field type '%s' is not supported", fieldClass.getName()));
                    }
                }

                fieldType = Namespace.this.classes_to_types.get(fieldClass);

                this.members.put(fieldName, fieldType);
            }
        }

        private boolean hasSerializeToTSAnnotation(Class clazz) {
            return (clazz.getAnnotation(SerializeToTS.class) != null);
        }

        @Override
        public Set<Class> getJavaClasses() {
            Set<Class> classes = new HashSet<>();
            classes.add(this.clazz);
            return classes;
        }

        @Override
        public String getCastString(String input) {
            return String.format(
                    "%s.fromJSON(%s as {[key: string]: string})",
                    getTypescriptTypeName(),
                    input
            );
        }

        @Override
        public String getTypescriptTypeName() {
            return clazz.getSimpleName();
        }
    }
}
