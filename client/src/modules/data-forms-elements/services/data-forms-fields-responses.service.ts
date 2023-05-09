import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { DataFormFieldResponse } from '../models/data-form-field-response.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { RelevancyRule } from '../models/relevancy-rule.model';
import { ValidationRule } from '../models/validation-rule.model';
import { DataFormElement } from '../models';

const LOG_PREFIX: string = "[Data Forms Fields Responses Service]";
const HEADERS = { 'Content-Type': 'application/json' };

@Injectable({
    providedIn: 'root'
})
export class DataFormsFieldsResponsesService {

    // Holds previously submitted responses
    private responsesSubject$ = new BehaviorSubject<DataFormFieldResponse[]>([]);
    readonly responses$ = this.responsesSubject$.asObservable();

    // Broadcasts notifications whenever a Data Form Field Response object is Changed
    public responseUpdated$: Subject<DataFormFieldResponse> = new Subject<DataFormFieldResponse>();

    constructor(
        private log: NGXLogger) {

    }

    /**
     * Initialises the Data Form Fields Responses to the passed-in Data Form Fields Responses
     * @param responses Data Form Fields Responses to initialise the local responses to
     */
    public init(responses: DataFormFieldResponse[]): void {

        this.log.trace(`${LOG_PREFIX} Entering init()`);
        this.log.debug(`${LOG_PREFIX} Responses = ${JSON.stringify(responses)}`);

        this.responsesSubject$.next(responses);

    }


    /**
     * Retrieves the Data Form Field Response with the specified id
     * @param dataFormFieldId The unique identifier of the Data Form Field
     * @param index The index of the Data Form Field Response if the Data Form Field has multiple responses
     * @returns the retrieved Data Form Field Response or a new one if not found
     */
    public getResponse(dataFormFieldId: number, index?: number): DataFormFieldResponse {

        this.log.trace(`${LOG_PREFIX} Entering getResponse()`);
        this.log.debug(`${LOG_PREFIX} Target Data Form Field Id = ${dataFormFieldId}`);

        let response: DataFormFieldResponse | undefined;

        // Try retrieving the response corresponding to the target data form field from the list of responses
        this.log.trace(`${LOG_PREFIX} Trying to retrieve the response corresponding to the target data form field from the list of responses`);
        response = this.responsesSubject$.value.find(response => response.fieldId == dataFormFieldId && response.index == (index ? index : 0))

        // Check whether the response was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking whether the response was successfully retrieved`);
        if (response) {

            // The response was successfully retrieved
            this.log.debug(`${LOG_PREFIX} Responses = ${JSON.stringify(response)}`);


            // Return the response
            this.log.trace(`${LOG_PREFIX} Returning the response`);
            return response;

        } else {

            // The response was not successfully retrieved
            this.log.trace(`${LOG_PREFIX} The response was not successfully retrieved`);

            // Instantiate a new response object for the field
            this.log.trace(`${LOG_PREFIX} Instantiating a new response object for the field`);

            response = new DataFormFieldResponse({
                index: index ? index : 0,
                fieldId: dataFormFieldId,
                value: null
            });

            // Add the response to the list of responses
            this.log.trace(`${LOG_PREFIX} Adding the response to the list of responses`);
            const copy: DataFormFieldResponse[] = Object.assign([], this.responsesSubject$.value);
            copy.push(response);
            this.responsesSubject$.next(copy);

            // Return the response
            this.log.trace(`${LOG_PREFIX} Returning the response`);
            return response;


        }

    }


    /**
     * Checks whether the conditions of a certain rule have been met
     * @param rule the rule
     * @returns true or false
     */
    public isRelevant(rule: RelevancyRule | null | undefined, index?: number): boolean {

        this.log.trace(`${LOG_PREFIX} Entering isRelevant()`);

        const idx: number = index ? index : 0;

        // Check if a relevancy rule was specified
        this.log.trace(`${LOG_PREFIX} Checking if a relevancy rule was specified`);
        if (rule) {

            // A relevancy rule was specified
            this.log.trace(`${LOG_PREFIX} A relevancy rule was specified`);
            this.log.debug(`${LOG_PREFIX} Relevancy Rule = ${JSON.stringify(rule)}`);

            // Check if the response to the field upon which the rule is based exists
            this.log.trace(`${LOG_PREFIX} Checking if the response to the field upon which the rule is based exists`);
            const fieldResponses: DataFormFieldResponse[] = this.responsesSubject$.value.filter(response => response.fieldId == rule.fieldId);
            if (fieldResponses.length > 0 && (typeof fieldResponses[idx] !== 'undefined')) {

                // The response to the field upon which the rule is based exists
                this.log.trace(`${LOG_PREFIX} The response to the field upon which the rule is based exists`);

                // Check for relevancy based on the response value
                this.log.trace(`${LOG_PREFIX} Checking for relevancy based on the response value`);
                let relevant: boolean = false;
                if (fieldResponses[idx].value) {


                    switch (rule.operatorId) {

                        case 1: // Greater Than

                            relevant = Number(fieldResponses[idx].value) > Number(rule.value);
                            break;

                        case 2: // Greater Than Or Equal To

                            relevant = Number(fieldResponses[idx].value) >= Number(rule.value);
                            break;


                        case 3: // Less Than

                            relevant = Number(fieldResponses[idx].value) < Number(rule.value);
                            break;

                        case 4: // Less Than Or Equal To

                            relevant = Number(fieldResponses[idx].value) <= Number(rule.value);

                            break;

                        case 5: // Equal To

                            relevant = Number(fieldResponses[idx].value) == Number(rule.value);

                            break;

                        case 6: // Not Equal To

                            relevant = Number(fieldResponses[idx].value) != Number(rule.value);

                            break;

                        case 7: // Contains

                            relevant = (<number[]>fieldResponses[idx].value).indexOf(Number(rule.value)) != -1;

                            break;

                        case 8: // Does not Contain

                            relevant = (<number[]>fieldResponses[idx].value).indexOf(Number(rule.value)) == -1;

                            break;

                        case 9: // Minimum Characters

                            relevant = String(fieldResponses[idx].value).length >= Number(rule.value);

                            break;

                        case 10: // Maximum Characters

                            relevant = String(fieldResponses[idx].value).length <= Number(rule.value);

                            break;

                    }

                }

                // Return relevancy
                this.log.debug(`${LOG_PREFIX} Relevancy = ${relevant}`);
                return relevant;

            } else {

                // The response to the field upon which the rule is based does not exist
                this.log.trace(`${LOG_PREFIX} The response to the field upon which the rule is based does not exist`);

                // Consider the field irrelevant by default
                this.log.trace(`${LOG_PREFIX} Considering the field irrelevant by default`);
                return false;

            }


        } else {

            // A relevancy rule was not specified
            this.log.trace(`${LOG_PREFIX} A relevancy rule was not specified`);

            // Consider the field relevant by default
            this.log.trace(`${LOG_PREFIX} Considering the field relevant by default`);
            return true;
        }


    }


    /** 
    * Handles Data Form Fields Responses Change Events
    * @param response The changed Data Form Field Response
    */
    public onDataFormFieldResponseChange(response: DataFormFieldResponse): void {
        const updatedResponses = this.responsesSubject$.value.map(r => {
          if (r.fieldId === response.fieldId) {
            return { ...r, value: response.value };
          }
          return r;
        });
        this.responsesSubject$.next(updatedResponses);
        this.responseUpdated$.next(response);
      }
      


    /**
   * Checks whether the value is valid if its warranted
   * @returns an error message or null if the field is valid
   */
     public getErrors( dataFormField: DataFormElement | null | undefined, value: any): string | null {

        if(value) {

            let error: string | null = this.getTypeError(value, dataFormField?.data.typeId);

            if(error) {
                return error;
            }
    
            if(dataFormField?.data?.validationRules) {
    
                for (let rule of dataFormField.data.validationRules) {
    
                    error = this.getConstraintError(value, rule);
    
                    if(error) {
                        return error;
                    }
                }
                
            }

        } else {

            if(dataFormField?.data.required) {
                return "Value is required";
            }

        }


        return null;

    }



    private getTypeError(value: any, typeId: number | null | undefined): string | null {

        switch (typeId) {

            case 3: // Integer

                if (!this.isWholeNumber(value)) {
                    return "Value should be a valid whole number";
                }

                break;
                
            case 4: // Decimal

                if (!this.isNumber(value)) {
                    return "Value should be a valid decimal number";
                }

                break;
                
            case 7: // Date

                if (!this.isDate(value)) {
                    return "Value should be a valid date";
                }


                break;

        }

        return null;

    }

    private getConstraintError(value: any, constraint: ValidationRule): string | null {


        switch (constraint.operatorId) {

            case 1: // Greater Than

            if(!(Number(value) > Number(constraint.value))) {
                return `Value should be greater than ${constraint.value}`;
            }


                break;

            case 2: // Greater Than Or Equal To

            if(!(Number(value) >= Number(constraint.value))) {
                return `Value should be greater than or equal to ${constraint.value}`;
            }            
                
  
                break;


            case 3: // Less Than

            if(!(Number(value) < Number(constraint.value))) {
                return `Value should be less than ${constraint.value}`;
            }            
                

                break;

            case 4: // Less Than Or Equal To
                
            if(!(Number(value) <= Number(constraint.value))) {
                return `Value should be less than or equal to ${constraint.value}`;
            } 

                break;

            case 5: // Equal To
                
            if(!(Number(value) == Number(constraint.value))) {
                return `Value should be equal to ${constraint.value}`;
            } 

                break;

            case 6: // Not Equal To
                
            if(!(Number(value) != Number(constraint.value))) {
                return `Value should not be equal to ${constraint.value}`;
            } 

                break;

            case 9: // Minimum Characters

            if(!(String(value).length >= Number(constraint.value))) {
                return `Value should have a minimum character length of ${constraint.value}`;
            }             
                

                break;

            case 10: // Maximum Characters

            if(!(String(value).length <= Number(constraint.value))) {
                return `Value should have a maximum character length of ${constraint.value}`;
            }                
                
                break;

        }

        return null;
    }

    private isNumber(value: any): boolean {

        return !isNaN(parseFloat(value)) && !isNaN(value - 0);
    }

    private isWholeNumber(value: any): boolean {

        if (this.isNumber(value)) {
            return Number(value) % 1 == 0;
        } else {
            return false;
        }

    }

    private isDate(value: any): boolean {
        let date = new Date(value);
        return date instanceof Date && !isNaN(date.valueOf());
    }



    


}
