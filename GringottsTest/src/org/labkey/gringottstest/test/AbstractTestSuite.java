package org.labkey.gringottstest.test;

import com.google.common.reflect.TypeToken;
import org.json.JSONObject;
import org.labkey.api.data.Container;
import org.labkey.api.security.User;

import java.lang.reflect.Constructor;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by jon on 11/14/16.
 */
public abstract class AbstractTestSuite {
    private final User user;
    private final Container container;

    private final Class thisClass;

    public AbstractTestSuite(User user, Container container) {
        this.user = user;
        this.container = container;
        this.thisClass = this.getClass();
    }

    public User getUser() {
        return user;
    }

    public Container getContainer() {
        return container;
    }

    public JSONObject runTests() {
        JSONObject results = new JSONObject();
        JSONObject summary = new JSONObject();
        JSONObject details = new JSONObject();

        this.beforeAll(results);

        for (Test test : getTests()) {
            String name = test.getClass().getName();

            JSONObject testResult = new JSONObject();
            boolean passed = false;

            try {
                test.runTest();
                passed = true;
            }
            catch (AssertionError|Exception e) {
                testResult.put("error", e);
            }

            testResult.put("passed", passed);
            summary.put(name, passed);
            details.put(name, testResult);
        }

        this.afterAll(results);

        results.put("summary", summary);
        results.put("details", details);

        return results;
    }

    public void beforeAll(JSONObject results) {
        // Override for hooks
    }

    public void afterAll(JSONObject results) {
        // Override for hooks
    }

    public List<Test> getTests() {
        List<Test> tests = new ArrayList<>();

        for (Class clazz : thisClass.getDeclaredClasses()) {
            if (Test.class.isAssignableFrom(clazz) && !Modifier.isAbstract(clazz.getModifiers())) {
                try {
                    Constructor constructor = clazz.getConstructor(thisClass);
                    Test test = (Test) constructor.newInstance(this);
                    tests.add(test);
                }
                catch (NoSuchMethodException|InstantiationException|InvocationTargetException|IllegalAccessException e) {
                    throw new RuntimeException("Couldn't instantiate test for " + clazz.getCanonicalName());
                }
            }
        }

        return tests;
    }

    public abstract class Test {
        public Test() {}

        public User getUser() {
            return AbstractTestSuite.this.user;
        }

        public Container getContainer() {
            return AbstractTestSuite.this.container;
        }

        abstract void runTest() throws Exception;
    }
}
