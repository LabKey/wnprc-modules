package com.github.jonathonrichardson.java2ts;

import java.io.OutputStream;
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

    public CompilerOutput compile(OutputStream outputStream) throws ClassNotFoundException {
        CompilerOutput output = new CompilerOutput();
        output.outfiles = new HashMap<>();

        for (String className : this.manifest.fullyQualifiedClassNames) {
            Class clazz = this.getClass().getClassLoader().loadClass(className);
            this.namespace.addClass(clazz);
        }

        return output;
    }
}
