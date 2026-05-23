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
export interface ContextProps {
  animalInfo: AnimalInfoProps;
  setAnimalInfoExternal: (animalInfo: AnimalInfoProps) => void;
  animalInfoState: AnimalInfoStates;
  setAnimalInfoStateExternal: (string) => void;
  updateAnimalInfoCacheExternal: (animalInfo: AnimalInfoProps) => void;
  animalInfoCache: object;
}

export interface AnimalInfoProps {
  Id: string;
  _labkeyurl_Id: string;
  calculated_status: string;
  _labkeyurl_calculated_status: string;
  gender: string;
  _labkeyurl_gender: string;
  dam: string;
  _labkeyurl_dam: string;
  birth: string;
  _labkeyurl_birth: string;
  age: string;
  avail:string
  sire: string;
  _labkeyurl_sire: string;
  hold: string;
  death: string;
  _labkeyurl_death: string;
  medical: string;
  _labkeyurl_medical: string;
  geographic_origin: string;
  _labkeyurl_geographic_origin: string;
}

export type AnimalInfoStates =
    | "waiting"
    | "loading"
    | "loading-unsuccess"
    | "loading-success";
