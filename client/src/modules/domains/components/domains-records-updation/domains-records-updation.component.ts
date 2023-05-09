import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, AsyncValidatorFn, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Domain } from '@modules/domains/models/domain.model';
import { DomainsDataService } from '@modules/domains/services/domains-data.service';
import { NGXLogger } from 'ngx-logger';
import { Observable, map, of } from 'rxjs';

const LOG_PREFIX: string = "[Domains Records Updation Component]";

@Component({
  selector: 'sb-domains-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './domains-records-updation.component.html',
  styleUrls: ['domains-records-updation.component.scss'],
})
export class DomainsRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Domain record
  @Input() public id!: number;

  // Broadcasts successful Domains updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Domains updation events together with their error abbreviations
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Domain record
  public domain: Domain | null | undefined = undefined;

  // Defines Domains reactive form controls group
  public domainsForm = new FormGroup({

    name: new FormControl<string | null>('', 
    [Validators.required, Validators.minLength(2), Validators.maxLength(250)],
    [this.nameExists()])  

  });



  constructor(
    private domainsDataService: DomainsDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Domain field based on the passed in id
    this.initialiseDomain(() => {

      // Initialise the Domain updation form based on the target Domain
      this.initialiseDomainUpdationForm(() => {

        // Mark Init as complete
        this.log.trace(`${LOG_PREFIX} Init completed`);

      });
    });

  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Retrieves the Domain with the injected id and sets it as the Domain that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseDomain(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDomain()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveDomainRecord(this.id, (domain: Domain | null) => {

      // Set the target Domain
      this.log.trace(`${LOG_PREFIX} Setting the target Domain`);
      this.domain = domain;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Domain updation form
   * @param callback The function to call when done
   */
  private initialiseDomainUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseDomainUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Domain Record = ${JSON.stringify(this.domain)}`);

    // Initialise the Domain Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Domain Records form fields`);
    this.domainsForm.setValue({
      name: (this.domain && this.domain.data?.name) ? this.domain.data?.name : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves a Domain record given its unique identifier synchronously
   * @param id The unique identifier of the Domain
   * @param callback The function to call when done
   */
  private retrieveDomainRecord(id: number, callback: (domain: Domain | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveDomainRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the domain id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the domain id has been specified`);
    if (id) {

      // The domain id has been specified
      this.log.trace(`${LOG_PREFIX} The domain id has been specified`);
      this.log.debug(`${LOG_PREFIX} Domain Id = ${JSON.stringify(id)}`);

      // Try retrieving a Domain Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve a Domain Record with the passed in id`);
      const domain: Domain | undefined = id ? this.domainsDataService.records.find(d => d.id == id) : undefined;

      // Check if the Domain Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Domain Record was successfully retrieved`);
      if (domain) {

        // The Domain Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Domain Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Domain Record = ${JSON.stringify(this.domain)}`);

        // Return the Domain
        this.log.warn(`${LOG_PREFIX} Returning the Domain`);
        callback(domain);

      } else {

        // The Domain Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Domain Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The domain id has not been specified
      this.log.error(`${LOG_PREFIX} The domain id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }

  /**
   * Internal validator that checks whether a proposed Domain's name already exists
   * @returns 
   */
  private nameExists(): AsyncValidatorFn {

    this.log.trace(`${LOG_PREFIX} Entering nameExists()`);

    return (control: AbstractControl): Observable<ValidationErrors | null> => {

      // Check if a name value has been provided
      this.log.trace(`${LOG_PREFIX} Check if a name value has been provided`);
      if (control.value) {

        // A name value has been provided
        this.log.trace(`${LOG_PREFIX} A name value has been provided`);

        // Attempt retrieving Domains with the same name
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve Domains with the same name`);
        return this.domainsDataService
          .getDomains(false,{
            page: null,
            pageSize: null,
            searchTerm: null,
            sortColumn: null,
            sortDirection: null,
            ids: null,
            name: control.value?.trim()
          })
          .pipe(
            map((domains: Domain[]) => {

              // Check if a Domain record with the same name was found
              this.log.trace(`${LOG_PREFIX} Checking if a Domain record with the same name was found`);

              if (domains.length > 0) {

                // A Domain record with the same name was found
                this.log.trace(`${LOG_PREFIX} A Domain record with the same name was found`);

                // Retrieve the Domain record with the specified name
                this.log.trace(`${LOG_PREFIX} Retrieving the Domain record with the specified name`);
                const domain: Domain | undefined = domains.find(s => s.data.name?.toLowerCase() == control.value.toLowerCase());
                this.log.trace(`${LOG_PREFIX} Domain record = ${JSON.stringify(domain)}`);

                // Check if the Domain record's identity is different from the current Domain record's identity
                this.log.trace(`${LOG_PREFIX} Checking if the Domain record's identity is different from the current Domain record's identity`);

                if (domain && domain.id != this.id) {

                  // The Domain record's identity is different from the current Domain record's identity
                  this.log.trace(`${LOG_PREFIX} The Domain record's identity is different from the current Domain record's identity`);

                  // Mark 'name exists' as true
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as true`);
                  return { 'exists': true };

                } else {

                  // The Domain record's identity is not different from the current Domain record's identity
                  this.log.trace(`${LOG_PREFIX} The Domain record's identity is not different from the current Domain record's identity`);

                  // Mark 'name exists' as false
                  this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                  return null;
                }


              } else {

                // A Domain record with the same name was not found
                this.log.trace(`${LOG_PREFIX} A Domain record with the same name was not found`);

                // Mark 'name exists' as false
                this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
                return null;

              }
            }

            )
          );

      } else {

        // A name value has not been provided
        this.log.trace(`${LOG_PREFIX} A name value has not been provided`);

        // Mark 'name exists' as false
        this.log.trace(`${LOG_PREFIX} Marking 'name exists' as false`);
        return of(null);
      }

    };

  }




  /**
   * Validates and saves a new Domain Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Domain record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Domain record was successfully initialised()`);
    if (this.domain) {

      // The target Domain record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Domain record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.domainsForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);      

      // Read in the provided name
      this.log.trace(`${LOG_PREFIX} Reading in the provided name`);
      const name: string | null | undefined = this.domainsForm.get('name')?.value?.trim();
      this.log.debug(`${LOG_PREFIX} Domain Name = ${name}`); 

        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Domain Record`);
        this.domainsDataService
          .updateDomain(Object.assign(this.domain, { data: { name} }))
          .subscribe({
            next: (response: Domain) => {

              // The Domain Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Domain Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.domainsForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Domain Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Domain Record was not successfuly updated`);

              // Emit a 'failed' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
              this.failed.emit(500);

            }
          });

      } else {

        // The data entry form is invalid
        this.log.trace(`${LOG_PREFIX} The data entry form is invalid`);

        // Run the form fields validation request to validate all fields and display the error message(s)
        this.log.trace(`${LOG_PREFIX} Running the form fields validation request to validate all fields and display the error message(s)`);
        this.validateAllFormFields(this.domainsForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Domain record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Domain record was not successfully initialised()`);

      // Emit an 'invalid' event
      this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
      this.failed.emit(500);

    }


  }

  /**
   * See: https://loiane.com/2017/08/angular-reactive-forms-trigger-validation-on-submit
   * @param formGroup 
   */
  private validateAllFormFields(formGroup: FormGroup): void {

    this.log.trace(`${LOG_PREFIX} Entering validateAllFormFields()`);

    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }


}
