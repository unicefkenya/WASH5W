import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { VisualisationContainer } from '@modules/visualisations-containers/models/visualisation-container.model';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services/visualisations-containers-data.service';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Visualisations Containers Records Creation Component]";

@Component({
  selector: 'sb-visualisationsContainers-records-creation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './visualisations-containers-records-creation.component.html',
  styleUrls: ['visualisations-containers-records-creation.component.scss'],
})
export class VisualisationsContainersRecordsCreationComponent implements OnInit, OnDestroy {

  // Allows the parent component to inject the unique identifier of the target context
  @Input() public contextId: number | null | undefined;

  // Allows the parent component to inject the unique identifier of the target container type
  @Input() typeId!: number;

  // Allows the parent component to inject the unique identifier of the container's parent
  @Input() parentId!: number;

  // Broadcasts successful Visualisations Containers creation events
  @Output() public succeeded: EventEmitter<void> = new EventEmitter<void>();

  // Broadcasts failed Visualisations Containers creation events together with their error codes
  @Output() public failed: EventEmitter<number> = new EventEmitter<number>();

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

    // Mark Init as complete
    this.log.trace(`${LOG_PREFIX} Init completed`);

  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }


  /**
   * Validates and saves a new Visualisation Container Record.
   * Emits a succeeded or failed event depending on whether the save request succeeded or failed respectively
   * Error 400 = Indicates that a user error was encountered
   * Error 500 = Indicates that a system error was encountered
   */
  public save(): void {

    this.log.trace(`${LOG_PREFIX} Entering save()`);

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
        .createVisualisationContainer(new VisualisationContainer(
          {
            data: {
              contextId: this.contextId,
              typeId: this.typeId,
              parentId: this.parentId,
              navTitle: navTitle, 
              pageTitle: pageTitle
            },
            version: null
          }))
        .subscribe({
          next: (response: VisualisationContainer) => {

            // The Visualisation Container Record was saved successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Container Record was saved successfuly`);

            // Reset the form
            this.log.trace(`${LOG_PREFIX} Resetting the form`);
            this.visualisationsContainersForm.reset();

            // Emit a 'succeeded' event
            this.log.trace(`${LOG_PREFIX} Emitting a 'succeeded' event`);
            this.succeeded.emit();
          },
          error: (error: any) => {

            // The Visualisation Container Record was not saved successfully
            this.log.trace(`${LOG_PREFIX} Visualisation Container Record was not saved successfuly`);

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
