package com.github.jonathonrichardson.java2ts.test;

/**
 * Created by jon on 3/24/17.
 */
import com.github.jonathonrichardson.java2ts.Compiler;
import com.github.jonathonrichardson.java2ts.Manifest;
import com.github.jonathonrichardson.java2ts.test.testclasses.Test1;
import org.apache.commons.io.IOUtils;
import org.junit.Test;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.nio.charset.Charset;

import static org.junit.Assert.*;

public class CompilerTest {
    @Test
    public void testSomeLibraryMethod() throws IOException, ClassNotFoundException {
        Manifest manifest = new Manifest();
        manifest.fullyQualifiedClassNames.add(Test1.class.getCanonicalName());

        Compiler compiler = new Compiler(manifest);

        InputStream inputStream = this.getClass().getResourceAsStream("/Test1.ts");

        StringWriter writer = new StringWriter();
        IOUtils.copy(inputStream, writer);
        String fileContents = writer.toString();

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        compiler.compile(outputStream);

        String generatedContents = new String(outputStream.toByteArray(), Charset.forName("UTF-8"));


        System.out.println("Expected: ");
        System.out.println(fileContents);


        System.out.println("Generated: ");
        System.out.println(generatedContents);

        assertEquals("Contents should match for File1", fileContents, generatedContents);
    }
}

