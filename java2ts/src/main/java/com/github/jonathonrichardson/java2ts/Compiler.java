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
import java.util.HashSet;
import java.util.Set;

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

        Set<String> classesToCompile = new HashSet<>();
        classesToCompile.addAll(this.manifest.fullyQualifiedClassNames);

        for (String className : classesToCompile) {
            Class clazz = this.getClass().getClassLoader().loadClass(className);
            this.namespace.addClass(clazz);
        }

        this.namespace.write(outputStream);

        return output;
    }

    public static void main(String[] args) {
        Manifest mainManifest = new Manifest();
        ObjectMapper mapper = new ObjectMapper();

        try {
            //System.out.println("Gathering manifests");

            Enumeration<URL> manifests = Thread.currentThread().getContextClassLoader().getResources("java2ts/manifest.json");
            while (manifests.hasMoreElements()) {
                URL manifestURL = manifests.nextElement();
                System.out.println(String.format(
                        "Reading manifest: %s",
                        manifestURL.toString()
                ));

                Manifest curManifest = mapper.readValue(manifestURL.openStream(), Manifest.class);
                //System.out.println(String.format(
                //        "Manifest has %s lines",
                //        curManifest.fullyQualifiedClassNames.size()
                //));
                mainManifest.fullyQualifiedClassNames.addAll(curManifest.fullyQualifiedClassNames);
            }

            Compiler compiler = new Compiler(mainManifest);

            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            compiler.compile(buffer);

            Path outFilePath = Paths.get(System.getProperty("user.dir"), "GeneratedFromJava.ts");
            if (args.length > 0) {
                outFilePath = Paths.get(args[0]);
            }

            Files.write(outFilePath, buffer.toByteArray());
        }
        catch (IOException|ClassNotFoundException e) {
            throw new RuntimeException(e);
        }
    }
}
