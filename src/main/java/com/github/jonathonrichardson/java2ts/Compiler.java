package com.github.jonathonrichardson.java2ts;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Enumeration;
import java.util.HashMap;

/**
 * Created by jon on 3/24/17.
 */
public class Compiler {
    private Manifest manifest;
    private Namespace namespace = new Namespace();

    public Compiler(Manifest manifest) {
        this.manifest = manifest;
    }

    public CompilerOutput compile(OutputStream outputStream) throws ClassNotFoundException, IOException {
        CompilerOutput output = new CompilerOutput();
        output.outfiles = new HashMap<>();

        for (String className : this.manifest.fullyQualifiedClassNames) {
            Class clazz = this.getClass().getClassLoader().loadClass(className);
            this.namespace.addClass(clazz);
        }

        this.namespace.write(outputStream);

        return output;
    }

    public static void main() throws IOException, ClassNotFoundException {
        Manifest mainManifest = new Manifest();
        ObjectMapper mapper = new ObjectMapper();

        Enumeration<URL> manifests = Compiler.class.getClassLoader().getResources("/java2ts/manifest.json");
        while(manifests.hasMoreElements()) {
            Manifest curManifest = mapper.readValue(manifests.nextElement().openStream(), Manifest.class);
            mainManifest.fullyQualifiedClassNames.addAll(curManifest.fullyQualifiedClassNames);
        }

        Compiler compiler = new Compiler(mainManifest);

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        compiler.compile(buffer);

        Path outFilePath = Paths.get(System.getProperty("user.dir"), "GeneratedFromJava.ts");
        Files.write(outFilePath, buffer.toByteArray());
    }
}
