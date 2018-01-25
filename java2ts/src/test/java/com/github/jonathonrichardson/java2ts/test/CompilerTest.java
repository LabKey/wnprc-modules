package com.github.jonathonrichardson.java2ts.test;

/**
 * Created by jon on 3/24/17.
 */
import com.github.jonathonrichardson.java2ts.Compiler;
import com.github.jonathonrichardson.java2ts.Manifest;
import com.github.jonathonrichardson.java2ts.test.testclasses.*;
import org.apache.commons.io.IOUtils;
import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.charset.Charset;

import static org.junit.Assert.*;

public class CompilerTest {
    private void assertOutputMatches(String outputPath, Class... classes) throws IOException, ClassNotFoundException {
        Manifest manifest = new Manifest();

        for (Class clazz : classes) {
            manifest.fullyQualifiedClassNames.add(clazz.getCanonicalName());
        }

        Compiler compiler = new Compiler(manifest);

        InputStream inputStream = this.getClass().getResourceAsStream(outputPath);

        StringWriter writer = new StringWriter();
        IOUtils.copy(inputStream, writer);
        String fileContents = writer.toString().replaceAll("\\r\\n", "\n");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        compiler.compile(outputStream);

        String generatedContents = new String(outputStream.toByteArray(), Charset.forName("UTF-8")).replaceAll("\\r\\n", "\n");

        if (!generatedContents.equals(fileContents)) {
            System.out.println("Expected: ");
            System.out.println(fileContents);


            System.out.println("Generated: ");
            System.out.println(generatedContents);
        }


        assertEquals("Contents should match " + outputPath, fileContents, generatedContents);
    }

    @Test
    public void compileSimpleClass() throws IOException, ClassNotFoundException {
        assertOutputMatches("/SimpleClass.ts", SimpleClass.class);
    }

    @Test
    public void compileSimpleClassWithDate() throws IOException, ClassNotFoundException {
        assertOutputMatches("/SimpleClassWithDate.ts", SimpleClassWithDate.class);
    }

    @Test
    public void compileEmbeddedClass() throws IOException, ClassNotFoundException {
        assertOutputMatches("/EmbeddedClass.ts", EmbeddedClass.class);
    }

    @Test
    public void compileEnumClass() throws IOException, ClassNotFoundException {
        assertOutputMatches("/EnumClass.ts", SimpleClassWithEnum.class);
    }

    @Test
    public void compileBurritoClass() throws IOException, ClassNotFoundException {
        assertOutputMatches("/BurritoClass.ts", FullyLoadedBurritoClass.class);
    }


    @Test
    public void compileClassWithArray() throws IOException, ClassNotFoundException {
        assertOutputMatches("/SimpleClassWithArray.ts", SimpleClassWithArray.class);
    }
}

