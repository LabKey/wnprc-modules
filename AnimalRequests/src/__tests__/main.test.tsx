/*
 * Copyright (c) 2020-2026 Board of Regents of the University of Wisconsin System
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
import {
    overrideAFieldValue
} from '../client/query/helpers'


it('overrideAFieldValue: should replace val1 with val2', () => {
    const initialValues = {};
    initialValues['val1'] = 0;
    initialValues['val2'] = 1;

    const expectedValues = {};
    expectedValues['val1'] = 1;
    expectedValues['val2'] = 1;

    expect(overrideAFieldValue(initialValues,'val2','val1')).toEqual(expectedValues);
});

//TODO check that we can get the right content using mock data object
