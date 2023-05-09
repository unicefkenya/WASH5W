import { AdministrativeUnit } from "@modules/administrative-units/models/administrative-unit.model";
import { VisualisationVariable } from "@modules/visualisation-variables/models/visualisation-variable.model";
import moment from 'moment';

export interface MapState {
  administrativeUnit: AdministrativeUnit | null | undefined;
  visualisationVariable: VisualisationVariable | null | undefined;
  timeIntervalStart: moment.Moment | null | undefined;
  timeIntervalEnd: moment.Moment | null | undefined; 
}