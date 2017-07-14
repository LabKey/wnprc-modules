package org.labkey.dbutils.api.service;

import com.google.common.collect.Lists;
import org.jetbrains.annotations.NotNull;
import org.labkey.api.data.Container;
import org.labkey.api.data.ContainerManager;
import org.labkey.api.module.Module;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Created by Jon on 3/21/2017.
 */
public class ContainerHelper {
    private static String DBUTILS_PROJECT = "_dbutils";
    private static String PRIVATE_CONTAINER = "_Private";
    private static String MODULES_CONTAINER = "_modules";

    public static Container ensureContainerExists(@NotNull String path) {
        // Strip leading slashes
        path = path.replaceAll("^/+", "");

        // Generate a queue of all pieces
        List<String> pieces = new ArrayList<>();
        for (String piece : path.split("/")) {
            pieces.add(piece);
        }
        Lists.reverse(pieces);

        // Create a container stack.
        List<Container> containerStack = new ArrayList<>();
        containerStack.add(ContainerManager.getRoot());

        while(pieces.size() > 0) {
            Container lastContainer = containerStack.get(containerStack.size() - 1);
            String nextPiece = pieces.remove(pieces.size() - 1);

            // Get the next container, creating it if it doesn't exist
            Container nextContainer = ContainerManager.ensureContainer(lastContainer, nextPiece);

            // Push the new container onto our stack
            containerStack.add(nextContainer);
        }

        return containerStack.get(containerStack.size() - 1);
    }

    private static String _pathJoin(List<String> elements) {
        return "/" + String.join("/", elements);
    }

    private static Container getDbUtilsContainer() {
        return ContainerManager.ensureContainer(ContainerManager.getRoot(), DBUTILS_PROJECT);
    }

    public static Container getPrivateContainer() {
        return ContainerManager.ensureContainer(getDbUtilsContainer(), PRIVATE_CONTAINER);
    }

    private static Container getPrivateModulesContainer() {
        return ContainerManager.ensureContainer(getPrivateContainer(), MODULES_CONTAINER);
    }

    public static Container getPrivateContainerForModule(Module module) {
        Container container = ContainerManager.ensureContainer(getPrivateModulesContainer(), module.getName().toLowerCase());

        // Ensure
        Set<Module> activeModules = container.getActiveModules();
        if (!activeModules.contains(module)) {
            Set<Module> newModules = new HashSet<>();
            newModules.addAll(container.getActiveModules());
            newModules.add(module);

            container.setActiveModules(newModules);
        }

        return container;
    }

    public static Set<Container> getAllContainersWithModule(Module module) {
        return getAllContainers().stream()
                .filter(container -> container.getActiveModules().contains(module))
                .collect(Collectors.toSet());
    }

    public static Set<Container> getAllContainers() {
        Set<Container> containers = new HashSet<>();

        Container root = ContainerManager.getRoot();
        containers.addAll(_getChildContainers(root));

        return containers;
    }

    private static Set<Container> _getChildContainers(Container parentContainer) {
        Set<Container> containers = new HashSet<>();

        for (Container container : parentContainer.getChildren()) {
            containers.add(container);
            containers.addAll(_getChildContainers(container));
        }

        return containers;
    }

}
