import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Containers Records Updation Component]";

@Component({
  selector: 'sb-visualisationsContainers-records-updation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisations-containers-records-updation.component.html',
  styleUrls: ['visualisations-containers-records-updation.component.scss'],
})
export class VisualisationsContainersRecordsUpdationComponent implements OnInit {

  // Allows the parent component to inject the unique identifier of the target Visualisation Container record
  @Input() public id!: number;

  // Broadcasts successful Visualisations Containers updation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisations Containers updation events together with their error plurals
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

  // Holds the target Visualisation Container record
  public visualisationContainer: VisualisationContainer | null | undefined = undefined;

  // Defines Visualisations Containers reactive form controls group
  public visualisationsContainersForm = new FormGroup({

    navTitle: new FormControl<string | null>('',
      [Validators.required, Validators.minLength(2), Validators.maxLength(50)]),

    pageTitle: new FormControl<string | null>('',
      [Validators.minLength(2), Validators.maxLength(250)])

  });



  constructor(
    private visualisationsContainersDataService: VisualisationsContainersDataService,
    private log: NGXLogger) {

  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);

    // Initialise the Visualisation Container field based on the passed in id
    this.initialiseVisualisationContainer(() => {

      // Initialise the Visualisation Container updation form based on the target Visualisation Container
      this.initialiseVisualisationContainerUpdationForm(() => {

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
   * Retrieves the Visualisation Container with the injected id and sets it as the Visualisation Container that needs to be updated
   * @param callback The function to call when done
   */
  private initialiseVisualisationContainer(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationContainer()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${this.id}`);

    this.retrieveVisualisationContainerRecord(this.id, (visualisationContainer: VisualisationContainer | null) => {

      // Set the target Visualisation Container
      this.log.trace(`${LOG_PREFIX} Setting the target Visualisation Container`);
      this.visualisationContainer = visualisationContainer;

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    });

  }


  /**
   * Initialises the Visualisation Container updation form
   * @param callback The function to call when done
   */
  private initialiseVisualisationContainerUpdationForm(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationContainerUpdationForm()`);
    this.log.debug(`${LOG_PREFIX} Target Visualisation Container Record = ${JSON.stringify(this.visualisationContainer)}`);

    // Initialise the Visualisation Container Records form fields
    this.log.trace(`${LOG_PREFIX} Initialising the Visualisation Container Records form fields`);
    this.visualisationsContainersForm.setValue({
      navTitle: (this.visualisationContainer && this.visualisationContainer.data?.navTitle) ? this.visualisationContainer.data?.navTitle : "",
      pageTitle: (this.visualisationContainer && this.visualisationContainer.data?.pageTitle) ? this.visualisationContainer.data?.pageTitle : ""
    });

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }

  /**
   * Retrieves an Visualisation Container record given its unique identifier synchronously
   * @param id The unique identifier of the Visualisation Container
   * @param callback The function to call when done
   */
  private retrieveVisualisationContainerRecord(id: number, callback: (visualisationContainer: VisualisationContainer | null) => void): void {

    this.log.trace(`${LOG_PREFIX} Entering retrieveVisualisationContainerRecord()`);
    this.log.debug(`${LOG_PREFIX} Target Id = ${id}`);

    // Check if the visualisationContainer id has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the visualisationContainer id has been specified`);
    if (id) {

      // The Visualisation Container id has been specified
      this.log.trace(`${LOG_PREFIX} The Visualisation Container id has been specified`);
      this.log.debug(`${LOG_PREFIX} Visualisation Container Id = ${JSON.stringify(id)}`);

      // Try retrieving an Visualisation Container Record with the passed in id
      this.log.trace(`${LOG_PREFIX} Trying to retrieve an Visualisation Container Record with the passed in id`);
      const visualisationContainer: VisualisationContainer | undefined = id ? this.visualisationsContainersDataService.records.find(d => d.id == id) : undefined;

      // Check if the Visualisation Container Record was successfully retrieved
      this.log.trace(`${LOG_PREFIX} Checking if the Visualisation Container Record was successfully retrieved`);
      if (visualisationContainer) {

        // The Visualisation Container Record was successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Visualisation Container Record was successfully retrieved`);
        this.log.debug(`${LOG_PREFIX} Visualisation Container Record = ${JSON.stringify(this.visualisationContainer)}`);

        // Return the Visualisation Container
        this.log.warn(`${LOG_PREFIX} Returning the Visualisation Container`);
        callback(visualisationContainer);

      } else {

        // The Visualisation Container Record was not successfully retrieved
        this.log.trace(`${LOG_PREFIX} The Visualisation Container Record was not successfully retrieved`);

        // Return null
        this.log.warn(`${LOG_PREFIX} Returning null`);
        callback(null);

      }


    } else {

      // The Visualisation Container id has not been specified
      this.log.error(`${LOG_PREFIX} The Visualisation Container id has not been specified`);

      // Return null
      this.log.warn(`${LOG_PREFIX} Return null`);
      callback(null);

    }
  }

  /**
   * Validates and saves a new Visualisation Container Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

    // Check if the target Visualisation Container record was successfully initialised
    this.log.trace(`${LOG_PREFIX} Checking if the target Visualisation Container record was successfully initialised()`);
    if (this.visualisationContainer) {

      // The target Visualisation Container record was successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Container record was successfully initialised()`);

      // Check if the data entry form is valid
      this.log.trace(`${LOG_PREFIX} Checking if the data entry form is valid`);
      if (this.visualisationsContainersForm.valid) {

        // The data entry form is valid
        this.log.trace(`${LOG_PREFIX} The data entry form is valid`);

        // Read in the provided Navigation Title
        this.log.trace(`${LOG_PREFIX} Reading in the provided Navigation Title`);
        const navTitle: string | null | undefined = this.visualisationsContainersForm.get('navTitle')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Visualisation Container Navigation Title = ${navTitle}`);

        // Read in the provided Page Title
        this.log.trace(`${LOG_PREFIX} Reading in the provided Page Title`);
        const pageTitle: string | null | undefined = this.visualisationsContainersForm.get('pageTitle')?.value?.trim();
        this.log.debug(`${LOG_PREFIX} Visualisation Container Page Title = ${pageTitle}`);


        // Save the record
        this.log.trace(`${LOG_PREFIX} Saving the Visualisation Container Record`);
        this.visualisationsContainersDataService
        .updateVisualisationContainer(new VisualisationContainer(
          {
            id: this.visualisationContainer.id,
            data: {
              contextId: this.visualisationContainer.data.contextId,
              typeId: this.visualisationContainer.data.typeId,
              parentId: this.visualisationContainer.data.parentId,
              navTitle: navTitle, 
              pageTitle: pageTitle
            },
            version: this.visualisationContainer.version
          }))
          .subscribe({
            next: (response: VisualisationContainer) => {

              // The Visualisation Container Record was saved successfully
              this.log.trace(`${LOG_PREFIX} The Visualisation Container Record was successfuly updated`);

              // Reset the form
              this.log.trace(`${LOG_PREFIX} Resetting the form`);
              this.visualisationsContainersForm.reset();

              // Emit a 'succeeded' event
              this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
              this.succeeded.emit();
            },
            error: (error: any) => {

              // The Visualisation Container Record was not saved successfully
              this.log.trace(`${LOG_PREFIX} The Visualisation Container Record was not successfuly updated`);

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
        this.validateAllFormFields(this.visualisationsContainersForm);

        // Emit an 'invalid' event
        this.log.trace(`${LOG_PREFIX} Emitting a 'failed' event`);
        this.failed.emit(400);

      }

    } else {
      // The target Visualisation Container record was not successfully initialised
      this.log.trace(`${LOG_PREFIX} The target Visualisation Container record was not successfully initialised()`);

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
