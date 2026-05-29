/*
 * Copyright (c) 2021-2026 Board of Regents of the University of Wisconsin System
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
import * as React from 'react';
import DropdownOptions from "../components/DropdownOptions";
import {useState} from "react";

export default {
    title: 'DropdownOptions',
    component: DropdownOptions,
};

export const ToStorybook = () => {
    const restraints = [{key: "option1"}, {key: "option2"}];

    const [restraint, setRestraint] = useState("initialvalue");

    return (
    <DropdownOptions
        options={restraints}
        initialvalue={restraint}
        value={setRestraint}
        name="dropdown"
        id="dropdown-id"
        classname="form-control"
        valuekey="key"
        displaykey="key"
        required={true}
    />
    )
};
