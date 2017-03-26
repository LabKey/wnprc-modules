package com.github.jonathonrichardson.java2ts;

import org.jtwig.JtwigModel;
import org.jtwig.JtwigTemplate;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        }
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

            Map<String, String> field = new HashMap<>();
            field.put("name", fieldName);
            field.put("castString", type.getCastString(accessString));
            field.put("type", type.getTypescriptTypeName());

            fields.add(field);

            System.out.println("Found field: " + fieldName);
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
