import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DataFormElementType } from '../models/data-form-element-type.model';
import { map } from 'rxjs/operators';
import { DATA_FORMS_ELEMENTS_TYPES } from '../data/data-forms-elements-types';

@Injectable({
  providedIn: 'root'
})
export class DataFormsElementsTypesDataService {


  constructor() { }

  /**
   * Retrieves all the Data Forms Elements Types
   * @returns The Data Forms Elements Types
   */
  public getDataFormsElementsTypes$(): Observable<DataFormElementType[]> {
    return of(DATA_FORMS_ELEMENTS_TYPES);
  }


  /**
   * Retrieves the Data Form Element Type that has a particular identity
   * @param id The unique identifier of the Data Form Element Type
   * @returns The Data Form Element Type
   */   
  public getDataFormElementTypeById$(id: number): Observable<DataFormElementType> {
    return this.getDataFormsElementsTypes$()
      .pipe(
        map(types => types.filter(i => i.id == id)),
        map(types => types[0]));
  }


  /**
   * Retrieves the Data Forms Elements Types that are of a particular category
   * @returns The Data Forms Elements Types
   */  
  public getDataFormsElementsTypesByCategoryId$(categoryId: number): Observable<DataFormElementType[]> {
    return this.getDataFormsElementsTypes$()
      .pipe(map(types => types.filter(i => i.data.categoryId == categoryId)));
  }
}


