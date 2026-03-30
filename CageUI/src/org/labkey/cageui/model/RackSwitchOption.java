/*
 *
 *  * Copyright (c) 2026 Board of Regents of the University of Wisconsin System
 *  *
 *  * Licensed under the Apache License, Version 2.0 (the "License");
 *  * you may not use this file except in compliance with the License.
 *  * You may obtain a copy of the License at
 *  *
 *  *     http://www.apache.org/licenses/LICENSE-2.0
 *  *
 *  * Unless required by applicable law or agreed to in writing, software
 *  * distributed under the License is distributed on an "AS IS" BASIS,
 *  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  * See the License for the specific language governing permissions and
 *  * limitations under the License.
 *
 */

package org.labkey.cageui.model;

public class RackSwitchOption {
    private Value value;
    private String label;

    // Default constructor
    public RackSwitchOption() {}

    // Constructor with parameters
    public RackSwitchOption(Value value, String label) {
        this.value = value;
        this.label = label;
    }

    // Getter and setter for value
    public Value getValue() {
        return value;
    }

    public void setValue(Value value) {
        this.value = value;
    }

    // Getter and setter for label
    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    // Inner class representing the Value object
    public static class Value {
        private String objectId;
        private int rackId;
        private int typeRowId;

        // Default constructor
        public Value() {}

        // Constructor with parameters
        public Value(String objectId, int rackId, int typeRowId) {
            this.objectId = objectId;
            this.rackId = rackId;
            this.typeRowId = typeRowId;
        }

        // Getters and setters
        public String getObjectId() {
            return objectId;
        }

        public void setObjectId(String objectId) {
            this.objectId = objectId;
        }

        public int getRackId() {
            return rackId;
        }

        public void setRackId(int rackId) {
            this.rackId = rackId;
        }

        public int getTypeRowId() {
            return typeRowId;
        }

        public void setTypeRowId(int typeRowId) {
            this.typeRowId = typeRowId;
        }
    }

}
