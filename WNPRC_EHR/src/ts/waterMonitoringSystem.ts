declare const Ext4: any;
declare const LABKEY: any;

import * as $ from 'jquery';
import * as URI from 'urijs';

import {saveRowsDirect} from "../query/helpers";
import {RowObj} from "../../src/org/labkey/wnprc_ehr/pages/typings/main";
import { ConfigProps } from "../typings/main";
import {ActionURL, Utils, Security, Filter} from "@labkey/api";
import { Command, CommandType } from "@labkey/api/dist/labkey/query/Rows";


export class waterMonitoringSystem
{

}