import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataFormElementsValidationMessagesService {

  constructor() { }


  public getMessagePrefix(operatorId: number | null | undefined): string {

    if (operatorId) {
      switch (operatorId) {
        case 1: // Greater Than
          return `Value Should Be Greater Than `;
        case 2: // Greater Than Or Equal To
          return `Value Should Be Greater Than Or Equal To `;
        case 3: // Less Than
          return `Value Should Be Less Than `;
        case 4: // Less Than Or Equal To
          return `Value Should Be Less Than Or Equal To `;
        case 5: // Equal To
          return `Value Should Be Equal To `;
        case 6: // Not Equal To
          return `Value Should Not Be Equal To `;
        case 7: // Contains
          return `Value Should Contain `;
        case 8: // Does Not Contain
          return `Value Should Not Contain `;
        case 9: // Minimum Characters
          return `Value Should Have A Minimum Character Count Of `;
        case 10: // Maximum Characters
          return `Value Should Have A Maximum Character Count Of `;
        case 11: // Maximum MB Size
          return `File Should Have A Maximum MB Size Of  `;
        default:
          return "";
      }
    } else {
      return "";
    }

  }

}

