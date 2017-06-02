package com.github.jonathonrichardson.java2ts;

import org.apache.commons.io.IOUtils;
import org.jtwig.JtwigModel;
import org.jtwig.JtwigTemplate;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.*;

/**
 * Created by jon on 3/24/17.
 */
public class NamespaceWriter {
    Namespace namespace;
    OutputStream outputStream;

    NamespaceWriter(Namespace namespace, OutputStream outputStream) {
        this.namespace = namespace;
        this.outputStream = outputStream;
    }

    public void write() throws IOException {
        IOUtils.copy(
                getClass().getClassLoader().getResourceAsStream("header.ts"),
                this.outputStream
        );

        for (Type type : namespace.types.values()) {
            List<String> imports = type.getImports();

            if (imports.size() > 0) {
                for (String importString : imports) {
                    writeLine(importString);
                }
            }
        }

        for (Type type : namespace.types.values()) {
            if (type instanceof Namespace.TSClass) {
                writeClass((Namespace.TSClass) type);
            }
            else if (type instanceof Namespace.TSEnum) {
                writeEnum((Namespace.TSEnum) type);
            }

        }
    }

    private void writeEnum(Namespace.TSEnum tsEnum) throws IOException {
        writeLine("");

        JtwigTemplate template = JtwigTemplate.classpathTemplate("templates/enum.twig");

        JtwigModel model = JtwigModel.newModel();
        model.with("typeName", tsEnum.getTypescriptTypeName());
        model.with("values", tsEnum.getValues());

        template.render(model, outputStream);
    }

    private Type _wrapTypeInArray(final Type oldType) {
        return new Type() {
            @Override
            public Set<Class> getJavaClasses() {
                return oldType.getJavaClasses();
            }

            @Override
            public String getCastString(String input) {
                return String.format(
                        "(%s as any[]).map((val: any) => {return %s})",
                        input,
                        oldType.getCastString("val")
                );
            }

            @Override
            public String getTypescriptTypeName() {
                return oldType.getTypescriptTypeName() + "[]";
            }

            @Override
            public String getCloneString(String input) {
                return String.format(
                        "(%s).map((val) => { return %s; })",
                        input,
                        oldType.getCloneString("val")
                );
            }
        };
    }

    private Type _allowNullForType(final Type oldType) {
        return new Type() {
            @Override
            public Set<Class> getJavaClasses() {
                return oldType.getJavaClasses();
            }

            @Override
            public String getCastString(String input) {
                return String.format(
                        "(%s == null) ? null : ((val: any) => {return %s;})(%s)",
                        input,
                        oldType.getCastString("val"),
                        input
                );
            }

            @Override
            public String getTypescriptTypeName() {
                return oldType.getTypescriptTypeName() + " | null";
            }

            @Override
            public String getCloneString(String input) {
                return String.format(
                        "(%s == null) ? null : ((val: any) => {return %s;})(%s)",
                        input,
                        oldType.getCloneString("val"),
                        input
                );
            }
        };
    }

    private void writeClass(Namespace.TSClass tsClass) throws IOException {
        writeLine("");

        JtwigTemplate template = JtwigTemplate.classpathTemplate("templates/class.twig");
        JtwigModel model = JtwigModel.newModel();

        model.with("classType", tsClass.getTypescriptTypeName());


        List<Map<String, String>> fields = new ArrayList<>();
        for (String fieldName : tsClass.members.keySet()) {
            Type type = tsClass.members.get(fieldName);
            String accessString = String.format("json['%s']", fieldName);
            String memberAccessString = String.format("this.%s", fieldName);

            if (tsClass.memberMetaData.get(fieldName).isList) {
                type = _wrapTypeInArray(type);
            }


            if (tsClass.memberMetaData.get(fieldName).allowNull) {
                type = _allowNullForType(type);
            }

            Map<String, String> field = new HashMap<>();
            field.put("name", fieldName);
            field.put("castString", type.getCastString(accessString));
            field.put("cloneString", type.getCloneString(memberAccessString));
            field.put("type", type.getTypescriptTypeName());

            fields.add(field);
        }
        model.with("fields", fields);

        template.render(model, outputStream);
    }

    private void writeLine(String text) throws IOException {
        this.writeLine(text, 0);
    }

    private void writeLine(String text, int indent) throws IOException {
        Charset utf8 = Charset.forName("UTF-8");

        for (int i = 0; i < indent; i++) {
            outputStream.write("    ".getBytes(utf8));
        }

        outputStream.write((text + "\n").getBytes(utf8));
    }
}
