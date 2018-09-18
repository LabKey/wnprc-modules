package com.github.jonathonrichardson.java2ts;

import com.github.jonathonrichardson.java2ts.annotation.AllowNull;
import com.github.jonathonrichardson.java2ts.annotation.SerializeToTS;
import com.github.jonathonrichardson.java2ts.type.Moment;
import com.github.jonathonrichardson.java2ts.type.TSBoolean;
import com.github.jonathonrichardson.java2ts.type.TSNumber;
import com.github.jonathonrichardson.java2ts.type.TSString;

import java.io.IOException;
import java.io.OutputStream;
import java.lang.reflect.Field;
import java.lang.reflect.ParameterizedType;
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
        this.addType(new TSNumber());
        this.addType(new TSBoolean());
    }

    public void write(OutputStream stream) throws IOException {
        NamespaceWriter writer = new NamespaceWriter(this, stream);
        writer.write();
    }

    public void addClass(Class clazz) {
        this.addType(new TSClass(clazz));
    }

    public void addEnum(Class<? extends Enum> clazz) {
        this.addType(new TSEnum(clazz));
    }

    public void addType(Type type) {
        for (Class clazz : type.getJavaClasses()) {
            classes_to_types.put(clazz, type);
        }

        types.put(type.getTypescriptTypeName(), type);
    }

    public class TSEnum implements Type {
        private Class<? extends Enum> enumClass;

        public TSEnum(Class<? extends Enum> enumClass) {
            this.enumClass = enumClass;
        }

        @Override
        public Set<Class> getJavaClasses() {
            Set<Class> classes = new HashSet<>();
            classes.add(this.enumClass);
            return classes;
        }

        @Override
        public String getCastString(String input) {
            return input + " as " + this.getTypescriptTypeName();
        }

        @Override
        public String getTypescriptTypeName() {
            return enumClass.getSimpleName();
        }

        public Set<String> getValues() {
            Set<String> values = new HashSet<>();

            for (Enum curEnum : this.enumClass.getEnumConstants()) {
                values.add(curEnum.name());
            }

            return values;
        }
    }

    public static class MemberMetadata {
        public boolean isList;
        public boolean allowNull;

        public MemberMetadata(boolean isList, boolean allowNull) {
            this.isList = isList;
            this.allowNull = allowNull;
        }
    }

    public class TSClass implements Type {
        private Class clazz;
        Map<String, Type> members = new HashMap<>();
        Map<String, MemberMetadata> memberMetaData = new HashMap<>();

        public TSClass(Class clazz) {
            this.clazz = clazz;

            System.out.println("Parsing class: " + clazz.getName());

            for (Field field : clazz.getFields()) {
                //System.out.println(String.format(
                //        "Class %s has field %s with type %s", clazz.getSimpleName(), field.getName(), field.getType().getName()
                //));
                String fieldName = field.getName();
                Type fieldType;

                Class fieldClass = field.getType();

                boolean isList = false;


                boolean allowNull = (field.getAnnotation(AllowNull.class) != null);


                if (field.getGenericType() instanceof ParameterizedType) {
                    ParameterizedType pType = (ParameterizedType) field.getGenericType();
                    java.lang.reflect.Type rawType = pType.getRawType();

                    try {
                        Class genericClass = TypeUtil.getClassFromType(rawType);

                        if (List.class.isAssignableFrom(genericClass)) {
                            isList = true;
                            fieldClass = TypeUtil.getClassFromType(pType.getActualTypeArguments()[0]);
                        }
                    } catch (ClassNotFoundException e) {
                        // We'll just continue and let it fail when it can't support the field type
                    }
                }


                if (!Namespace.this.classes_to_types.containsKey(fieldClass)) {
                    if (fieldClass.isEnum()) {
                        Namespace.this.addEnum((Class<? extends Enum>) fieldClass);
                    }
                    else if (!fieldClass.isPrimitive() && hasSerializeToTSAnnotation(fieldClass)) {
                        Namespace.this.addClass(fieldClass);
                    }
                    else {
                        throw new RuntimeException(String.format("Field type '%s' is not supported", fieldClass.getName()));
                    }
                }

                fieldType = Namespace.this.classes_to_types.get(fieldClass);

                this.members.put(fieldName, fieldType);
                this.memberMetaData.put(fieldName, new MemberMetadata(isList, allowNull));
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
                    "%s.fromJSON((%s as any) as {[key: string]: string})",
                    getTypescriptTypeName(),
                    input
            );
        }

        @Override
        public String getCloneString(String input) {
            return String.format(
                    "%s.clone()",
                    input
            );
        }

        @Override
        public String getTypescriptTypeName() {
            return clazz.getSimpleName();
        }
    }
}
