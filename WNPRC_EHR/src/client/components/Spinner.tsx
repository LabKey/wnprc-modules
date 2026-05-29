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
import * as React from "react";
import { ActionURL } from "@labkey/api";

/**
 * Shows labkey loading spinner next to some text.
 */
const Spinner: React.FunctionComponent<any> = (props) => {
  const { text } = props;
  return (
    <div>
      <img src={ActionURL.getContextPath() + `/_images/ajax-loading.gif`} />{" "}
      {text}
    </div>
  );
};

export default Spinner;
