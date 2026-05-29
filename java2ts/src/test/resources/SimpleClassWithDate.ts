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

export class SimpleClassWithDate {
    nullableStartDate: Moment | null;
    value: string;
    startDate: Moment;

    public clone(): SimpleClassWithDate {
        let obj: SimpleClassWithDate = new SimpleClassWithDate();
        obj.nullableStartDate = (this.nullableStartDate == null) ? null : ((val: any) => {return val.clone();})(this.nullableStartDate);
        obj.value = this.value;
        obj.startDate = this.startDate.clone();

        return obj;
    }

    static fromJSON(json: {[key: string]: any}): SimpleClassWithDate {
        let obj: SimpleClassWithDate = new SimpleClassWithDate();
        obj.nullableStartDate = (json['nullableStartDate'] == null) ? null : ((val: any) => {return moment(val);})(json['nullableStartDate']);
        obj.value = json['value'];
        obj.startDate = moment(json['startDate']);

        return obj;
    }
}