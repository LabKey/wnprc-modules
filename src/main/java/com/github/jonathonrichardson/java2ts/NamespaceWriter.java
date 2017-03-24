package com.github.jonathonrichardson.java2ts;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.Charset;
import java.util.List;

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

        writeLine(String.format("export class %s {", tsClass.getTypescriptTypeName()));


        for (String fieldName : tsClass.members.keySet()) {
            System.out.println("Found field: " + fieldName);
            writeLine(String.format(
                    "%s: %s;",
                    fieldName,
                    tsClass.members.get(fieldName).getTypescriptTypeName()
            ), 1);
        }

        writeLine("}");
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
