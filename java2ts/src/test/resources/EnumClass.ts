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
/*
 * This file was generated from Java classes by java2ts:
 *
 *  - https://github.com/JonathonRichardson/java2ts
 *
 *  You should not edit this file!
 */
import moment = require("moment");
import Moment = moment.Moment;

export type SimpleEnum = "OPTION3" | "OPTION1" | "OPTION2";

export function getSimpleEnumValues(): SimpleEnum[] {
    return ["OPTION3", "OPTION1", "OPTION2"];
}

export class SimpleClassWithEnum {
    id: string;
    selectedOption: SimpleEnum;

    public clone(): SimpleClassWithEnum {
        let obj: SimpleClassWithEnum = new SimpleClassWithEnum();
        obj.id = this.id;
        obj.selectedOption = this.selectedOption;

        return obj;
    }

    static fromJSON(json: {[key: string]: any}): SimpleClassWithEnum {
        let obj: SimpleClassWithEnum = new SimpleClassWithEnum();
        obj.id = json['id'];
        obj.selectedOption = json['selectedOption'] as SimpleEnum;

        return obj;
    }
}