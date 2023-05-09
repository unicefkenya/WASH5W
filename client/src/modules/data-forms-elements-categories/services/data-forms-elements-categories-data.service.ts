import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DATA_FORMS_ELEMENTS_CATEGORIES } from '../data/data-forms-elements-categories';
import { DataFormElementCategory } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataFormsElementsCategoriesDataService {

  constructor() { }

  /**
   * Retrieves all the Data Forms Elements Categories
   * @returns The Data Forms Elements Categories
   */
   public getDataFormsElementsCategories$(): Observable<DataFormElementCategory[]> {
    return of(DATA_FORMS_ELEMENTS_CATEGORIES);
  }


  /**
   * Retrieves the Data Form Element Category that has a particular identity
   * @param id The unique identifier of the Data Form Element Category
   * @returns The Data Form Element Category
   */   
  public getDataFormElementCategoryById$(id: number): Observable<DataFormElementCategory> {
    return this.getDataFormsElementsCategories$()
      .pipe(
        map(categories => categories.filter(i => i.id == id)),
        map(categories => categories[0]));
  }


}
