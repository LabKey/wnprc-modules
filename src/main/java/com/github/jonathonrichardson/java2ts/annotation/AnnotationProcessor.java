package com.github.jonathonrichardson.java2ts.annotation;

import javax.annotation.processing.*;
import javax.lang.model.SourceVersion;
import javax.lang.model.element.Element;
import javax.lang.model.element.ElementKind;
import javax.lang.model.element.TypeElement;
import javax.lang.model.util.Elements;
import javax.lang.model.util.Types;
import javax.tools.Diagnostic;
import java.util.HashSet;
import java.util.Set;

/**
 * Created by jon on 3/24/17.
 */
public class AnnotationProcessor extends AbstractProcessor {
    // Some utility classes
    private Types typeUtils;
    private Elements elementUtils;
    private Filer filer;
    private Messager messager;

    private Set<TypeElement> types = new HashSet<>();

    @Override
    public synchronized void init(ProcessingEnvironment env) {
        super.init(processingEnv);
        typeUtils = processingEnv.getTypeUtils();
        elementUtils = processingEnv.getElementUtils();
        filer = processingEnv.getFiler();
        messager = processingEnv.getMessager();
    }

    @Override
    public boolean process(Set<? extends TypeElement> annotations, RoundEnvironment roundEnv) {
        for (Element annotatedElement : roundEnv.getElementsAnnotatedWith(SerializeToTS.class)) {
            // Check to make sure it's a class
            if (annotatedElement.getKind() != ElementKind.CLASS) {
                types.add((TypeElement) annotatedElement);
            }
            else {
                messager.printMessage(Diagnostic.Kind.ERROR, String.format("%s is not a supported element kind for @%s", annotatedElement.getKind(), SerializeToTS.class.getSimpleName()));
                return true;
            }
        }

        if (isFinalPass(annotations)) {
            try {
                generateSource();
            } catch (ClassNotFoundException e) {
                messager.printMessage(Diagnostic.Kind.ERROR, String.format("Class not found: %s", e.toString()));
            }
        }

        // Claim these annotations as ours so they are not further processed
        return true;
    }

    @Override
    public SourceVersion getSupportedSourceVersion() {
        return SourceVersion.latestSupported();
    }

    @Override
    public Set<String> getSupportedAnnotationTypes() {
        Set<String> supportedTypes = new HashSet<>();

        supportedTypes.add(SerializeToTS.class.getCanonicalName());

        return supportedTypes;
    }

    /**
     * The annotation processor gets called in multiple rounds.  Each round processes the output of the previous round.
     * If a round produces no output, it still goes through one final round where it processes an empty set.  This
     * final round means we've processed everything.  We should no longer emit java code, in case that code would also
     * have the annotation, but we are free to do other things.
     *
     * This final round is when we'll generate a manifest for all the files we've seen.
     *
     * @param annotations
     * @return
     */
    public boolean isFinalPass(Set<? extends TypeElement> annotations) {
        return annotations.size() == 0;
    }

    public void generateSource() throws ClassNotFoundException {

    }
}
