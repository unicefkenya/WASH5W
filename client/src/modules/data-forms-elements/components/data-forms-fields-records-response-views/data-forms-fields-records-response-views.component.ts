import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
} from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { Observable, Subscription, of, map, first, tap, BehaviorSubject, filter, last, catchError, throwError } from 'rxjs';
import { FormControl, FormGroup } from '@angular/forms';
import { DataFormElement } from '@modules/data-forms-elements/models/data-form-element.model';
import { TextUtilService } from '@common/services/text-util.service';
import { OptionsDataService } from '@modules/options/services/options-data.service';
import { Option } from '@modules/options/models/option.model';
import { DataFormsElementsTypesDataService } from '@modules/data-forms-elements-types/services/data-forms-elements-types-data.service';
import { OperatorsDataService } from '@modules/operators/services/operators-data.service';
import { DataFormFieldResponse as DataFormFieldResponse } from '@modules/data-forms-elements/models/data-form-field-response.model';
import { DataFormsElementsDataService } from '@modules/data-forms-elements/services/data-forms-elements-data.service';
import { DataFormsFieldsResponsesService } from '@modules/data-forms-elements/services/data-forms-fields-responses.service';
import { OptionsSelectionDataService } from '@modules/options/services/options-selection-data.service';
import { SCREEN_SIZE } from '@common/models/screen-sizes.model';
import { ResizeService } from '@common/services/resize.service';
import { FileService } from '@common/services/file.service';
import { environment } from 'environments/environment';
import { ValidationRule } from '@modules/data-forms-elements/models';
import { HttpErrorResponse, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';



const LOG_PREFIX: string = "[Data Forms Fields Records Response Views Component]";



@Component({
    selector: 'sb-data-forms-fields-records-response-views',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './data-forms-fields-records-response-views.component.html',
    styleUrls: ['data-forms-fields-records-response-views.component.scss'],
})
export class DataFormsFieldsRecordsResponseViewComponent implements OnInit, OnDestroy {

    // Allows the parent component to specify the target data form field
    @Input() public dataFormField!: DataFormElement;

    // Allows the parent component to specify mode of working
    @Input() public mode: string = "mock"; // mock, actual    

    // Allows the parent component to specify whether the form fields should be disabled
    @Input() public disabled: boolean = false;

    // Allows the parent component to assign the current display position an odd or even position
    @Input() public odd: boolean = true;

    // A property that holds an array of Option objects representing the available options for the field.
    public options!: Option[];

    // A property that holds the value entered for the current field
    value: any = null;

    // A property that holds multiple responses associated with the current field
    selectedOptions: number | null = null;

    // A property that holds file upload / downloads progress
    private progressSubject$ = new BehaviorSubject<number | null>(null);
    readonly progress$ = this.progressSubject$.asObservable();

    // A property that displays the processing status especially as we deal with files
    private processingSubject$ = new BehaviorSubject<boolean>(false);
    readonly processing$ = this.processingSubject$.asObservable();

    // A property that holds the current status of descriptive text: collapsed or expanded
    public descriptionCollapsed: boolean = true;

    // Keeps tabs of the selected options
    //public selectedOptionsIds: number[] = [];

    // Keeps tabs of the processing errors
    public error: string | null = null;

    // Keeps tabs of whether the page has been successfully initialised
    public initialised: boolean = false;


    // Central gathering point for all the component's subscriptions.
    // Makes it efficient to unsubscribe from all subscriptions when the component is destroyed.   
    private _subscriptions: Subscription[] = [];


    size: SCREEN_SIZE = SCREEN_SIZE.MD;

    sizes = [
        {
            id: SCREEN_SIZE.SM, name: 'sm', css: `d-md-none`
        },
        {
            id: SCREEN_SIZE.MD, name: 'md', css: `d-none.d-md-block`
        }
    ];

    private detectScreenSize() {

        const currentSize = this.sizes.find(x => {
            const el = this.elementRef.nativeElement.querySelector(`.${x.css}`);
            if (el) {
                const isVisible = window.getComputedStyle(el).display != 'none';
                return isVisible;
            } else {
                return false;
            }

        });

        if (currentSize && (currentSize.id != this.size)) {
            this.log.debug(`${LOG_PREFIX} Current size = ${currentSize.name}`);
            this.size = currentSize.id;
            this.cd.detectChanges();
        }

    }

    constructor(
        private elementRef: ElementRef,
        private fileService: FileService,
        private cd: ChangeDetectorRef,
        public dataFormsFieldsResponsesService: DataFormsFieldsResponsesService,
        public optionsSelectionDataService: OptionsSelectionDataService,
        public dataFormsElementsDataService: DataFormsElementsDataService,
        public dataFormsElementsTypesDataService: DataFormsElementsTypesDataService,
        public dataFormsResponsesService: DataFormsFieldsResponsesService,
        public operatorsDataService: OperatorsDataService,
        public optionsDataService: OptionsDataService,
        public textUtilService: TextUtilService,
        private log: NGXLogger) {

    }

    //@HostListener("window:resize", [])
    private onResize() {
        this.detectScreenSize();
    }


    // A lifecycle hook that runs when the component is initialised. 
    // It checks whether the dataFormField is a dropdown selection response field and retrieves the available options if it is.
    ngOnInit() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);


        this.initialiseOptions(() => {
            this.initialiseDataFormFieldValue(() => {
                this.initialiseDataFormFieldResponseChangesHandler(() => {
                    // Mark Init as complete
                    this.log.trace(`${LOG_PREFIX} Init completed`);
                    this.initialised = true;
                    this.cd.detectChanges();
                });
            });
        });

        // Clear errors
        this.error = null;
    }

    // A lifecycle hook that runs when the component is destroyed.
    @HostListener('window:beforeunload')
    ngOnDestroy() {

        this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

        // Clear all subscriptions
        this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
        this._subscriptions.forEach(s => s.unsubscribe());
    }


    /**
     * Initialise selectable options
     * @param callback the function to call once done
     */
    private initialiseOptions(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseOptions()`);


        if (this.dataFormField?.data.typeId == 8 ||  // Single Selection
            this.dataFormField?.data.typeId == 9 ||  // Multi Selection
            this.dataFormField?.data.typeId == 10) { // Dropdown

            this.optionsSelectionDataService
                .getOptions$(this.dataFormField?.data.options)
                .subscribe({
                    next: (options: Option[]) => {

                        this.options = options;

                        // Return;
                        callback();
                    }
                });

        } else {

            this.options = [];

            // Return;
            callback();
        }

    }


    /**
     * Initialise the Data Form Field's value
     * @param callback 
     */
    private initialiseDataFormFieldValue(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormFieldValue()`);

        if (this.dataFormField?.id) {
            this.value = this.dataFormsFieldsResponsesService.getResponse(this.dataFormField.id).value;
            this.error = this.dataFormsResponsesService.getErrors(this.dataFormField, this.value);
        }

        // Return;
        callback();

    }


    /**
     * Subscribe and react to Data Form Field Response changes
     * @param callback The function to call when done
     */
    private initialiseDataFormFieldResponseChangesHandler(callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering initialiseDataFormFieldResponseChangesHandler()`);

        this._subscriptions.push(
            this.dataFormsFieldsResponsesService.responseUpdated$
                .subscribe({
                    next: (response: DataFormFieldResponse) => {

                        // Check if the update pertains to the current data form field and the passed in value is different from the locally held value
                        if ((response.fieldId == this.dataFormField?.id) && ((JSON.stringify(response.value) !== JSON.stringify(this.value)))) {

                            // The update pertains to the current data form field and the passed in value is different from the locally held value
                            // Update the locally held Data Form Field Response.
                            this.value = response.value;
                            this.cd.detectChanges()

                        }
                    }
                })
        );

        // Transfer control to the callback function
        callback();

    }

    /**
     * Get the default placeholder text that is associated with the active data type
     * @returns The placeholder text
     */
    public getPlaceholder(): string {
        switch (this.dataFormField.data.typeId) {
            case 3: // Integer
                return "Enter a whole number";
            case 4: // Decimal
                return "Enter a decimal number";
            case 5: // Short Text
                return "Enter text";
            case 6: // Long Text
                return "Enter detailed text";
            default:
                return "";
        }
    }


    /** 
     * Handles Options Checkboxes Check Events
     * @param optionId The id of the Checked Option
     */
    private onCheck(optionId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onCheck()`);

        this.log.debug(`${LOG_PREFIX} Checked Option Id = ${optionId}`);

        const value: number[] = this.value ? Object.assign([], this.value) : [];

        // Check whether the passed in option is not already a part of the checked options
        this.log.trace(`${LOG_PREFIX} Checking whether the passed in option is not already a part of the checked options`);
        if (value.indexOf(optionId) == -1) {

            // The passed in option is not already a part of the checked options
            this.log.trace(`${LOG_PREFIX} The passed in option is not already a part of the checked options`);

            // Add the newly checked option to the list of checked options
            this.log.trace(`${LOG_PREFIX} Adding the newly checked option to the list of checked options`);
            value.push(optionId);


        } else {

            // The passed in option is already a part of the checked options
            this.log.warn(`${LOG_PREFIX} The passed in option is already a part of the checked options`);

        }

        this.value = value;

    }


    /** 
    * Handles Options Checkboxes Uncheck Events
    * @param optionId The id of the Unchecked Option
    */
    private onUncheck(optionId: number): void {

        this.log.trace(`${LOG_PREFIX} Entering onUncheck()`);

        this.log.debug(`${LOG_PREFIX} Unchecked Option Id = ${optionId}`);

        const value: number[] = this.value ? Object.assign([], this.value) : [];

        // Check if the unchecked option exists in the checked options array
        this.log.trace(`${LOG_PREFIX} Checking if the unchecked option exists in the checked options array`);
        if (value.indexOf(optionId) != -1) {

            // The unchecked option exists in the checked options array
            this.log.trace(`${LOG_PREFIX} The unchecked option exists in the checked options array`);

            // Remove the unchecked option from the array
            this.log.trace(`${LOG_PREFIX} Removing the unchecked option from the array`);
            value.splice(value.indexOf(optionId), 1);


        } else {

            // The unchecked option does not exist in the checked options array
            this.log.warn(`${LOG_PREFIX} The unchecked option does not exist in the checked options array`);

        }

        this.value = value;

    }




    /**
     * A method that is called when the value changes.
     * 
     * @param value The newly provided value
     */
    public onValueChange(value: any, event?: any) {

        this.log.trace(`${LOG_PREFIX} Entering onValueChange()`);


        // Process the value further if needed
        switch (this.dataFormField?.data.typeId) {

            case 9: // Multi Selection

                this.log.debug(`${LOG_PREFIX} Data Form Field Type = Multi Selection`);

                this.value = this.value ?? [];

                if (event.target.checked) {
                    this.onCheck(value)
                } else {
                    this.onUncheck(value);
                }

                break;

            case 11: // File
                this.value = value;
                this.cd.detectChanges();
                break;

        }

        if (this.dataFormField && this.dataFormField.id) {
            this.log.debug(`${LOG_PREFIX} Value = ${this.value}`);
            const copy = Object.assign({}, this.dataFormsFieldsResponsesService.getResponse(this.dataFormField.id), { value: this.value });
            this.log.debug(`${LOG_PREFIX} Response = ${JSON.stringify(copy)}`);
            this.dataFormsFieldsResponsesService.onDataFormFieldResponseChange(copy);

            if (this.dataFormField?.data.typeId != 11) {
                this.error = this.dataFormsResponsesService.getErrors(this.dataFormField, this.value);
            }

        }

    }

    /**
     * Handles file attachment events
     * @param files The attached files
     */
    public onAttachFile(files: FileList): void {

        this.log.trace(`${LOG_PREFIX} Entering onAttachFile()`);

        // Attempt retrieving the attached file
        this.log.trace(`${LOG_PREFIX} Attempting to retrieve the attached file`);
        const file: File | null = files.item(0);

        // Check if the file was successfully retrieved
        this.log.trace(`${LOG_PREFIX} Checking if the file was successfully retrieved`);
        if (file) {

            // The file was successfully retrieved
            this.log.trace(`${LOG_PREFIX} The file was successfully retrieved`);
            this.log.debug(`${LOG_PREFIX} File = ${file.name}`);

            // Validate the file size
            this.log.trace(`${LOG_PREFIX} Validating the file size`);
            this.validateFileSize(file, (valid: boolean) => {

                if (valid) {

                    // Upload the file
                    this.log.trace(`${LOG_PREFIX} Uploading the file`);
                    this.uploadFile(file, () => {

                        // Update response
                        this.log.trace(`${LOG_PREFIX} Updating response`);
                        this.onValueChange(file.name);

                    })
                }
            });

        }


    }

    /**
     * Checks if the provided file is within the prescribed max size
     * @param file  The provided file
     * @param callback The function to call once through with the validation
     */
    private validateFileSize(file: File, callback: (valid: boolean) => void): void {

        this.log.trace(`${LOG_PREFIX} Entering validateFileSize()`);

        // Check if file validation rule(s) were provided
        this.log.trace(`${LOG_PREFIX} Checking if file validation rule(s) were provided`);
        if (this.dataFormField?.data.validationRules && this.dataFormField.data.validationRules.length > 0) {

            // The file validation rule(s) were provided
            this.log.trace(`${LOG_PREFIX} The file validation rule(s) were provided`);

            // Check if the maximum file size validation rule was provided
            this.log.trace(`${LOG_PREFIX} Checking if the maximum file size validation rule was provided`);
            const maxSizeValidationRule: ValidationRule | undefined = this.dataFormField.data.validationRules.find(v => v.operatorId == 11);
            if (maxSizeValidationRule) {

                // The maximum file size validation rule was provided
                this.log.trace(`${LOG_PREFIX} The maximum file size validation rule was provided`);
                this.log.debug(`${LOG_PREFIX} Validation Rule = ${JSON.stringify(maxSizeValidationRule)}`);

                // Get the file's size in mbs
                this.log.trace(`${LOG_PREFIX} Getting the file's size in mbs`);
                const fileSizeInMB = (file.size) / (1024 * 1024);
                this.log.debug(`${LOG_PREFIX} File Size = ${fileSizeInMB}`);

                // Check if the file size is greater than the maximum permissible file size
                this.log.trace(`${LOG_PREFIX} Checking if the file size is greater than the maximum permissible file size`);
                if (fileSizeInMB > Number(maxSizeValidationRule.value)) {

                    // The file size is greater than the maximum permissible file size
                    this.log.trace(`${LOG_PREFIX} The file size is greater than the maximum permissible file size`);

                    // Print out an error
                    this.log.trace(`${LOG_PREFIX} Printing out an error`);
                    this.error = `File size should be ${maxSizeValidationRule.value} MBs or less`;

                    // Return negative result to the callback function
                    this.log.trace(`${LOG_PREFIX} Returning negative result to the callback function`);
                    callback(false);

                } else {

                    // The file size is not greater than the maximum permissible file size
                    this.log.trace(`${LOG_PREFIX} The file size is not greater than the maximum permissible file size`);

                    // Clear previous errors
                    this.log.trace(`${LOG_PREFIX} Clearing previous errors`);
                    this.error = null;
                }

            } else {

                // The maximum file size validation rule was not provided
                this.log.trace(`${LOG_PREFIX} The maximum file size validation rule was not provided`);
            }

        } else {

            // The file validation rule(s) were not provided
            this.log.trace(`${LOG_PREFIX} The file validation rule(s) were not provided`);
        }

        // Return positive result to the callback function
        this.log.trace(`${LOG_PREFIX} Returning positive result to the callback function`);
        callback(true);

    }

    /**
     * Uploads file to an FTP server
     * @param file  The target file
     * @param callback The function to call once through with the validation
     */
    private uploadFile(file: File, callback: () => void): void {

        this.log.trace(`${LOG_PREFIX} Entering uploadFile()`);

        // Set the processing status to true
        this.processingSubject$.next(true);

        // Send the file to the FTP server
        this.log.trace(`${LOG_PREFIX} Sending the file to the FTP server`);
        this.fileService.upload(file, `${environment.urls.ftp_resources}/${file.name}`).subscribe({

            next: (event: any) => {

                // Determine whether the upload is in progress or completed based on the event type
                if (event.type === HttpEventType.UploadProgress) {

                    // Upload in progress
                    this.log.trace(`${LOG_PREFIX} Upload in progress`);

                    // Get the proportion uploaded  
                    const proportionUploaded: number = Math.round(100 * event.loaded / event.total);
                    this.log.debug(`${LOG_PREFIX} Proportion Uploaded = ${proportionUploaded}`);

                    // Set the progress to the proportion uploaded 
                    this.progressSubject$.next(proportionUploaded);

                } else if (event instanceof HttpResponse) {

                    // Upload Finished
                    this.log.trace(`${LOG_PREFIX} Upload Finished`);

                    // Set the progress to null 
                    this.progressSubject$.next(null);

                    // Set the processing status to false
                    this.processingSubject$.next(false);

                    // Return control to the callback function
                    callback();
                }
            },

            error: (err: HttpErrorResponse) => {

                let errorMessage = 'Unknown error';

                if (err.error instanceof ErrorEvent) {

                    // A client-side error occurred
                    errorMessage = `Error: ${err.error.message}`;

                } else {

                    // The backend returned an unsuccessful response code
                    errorMessage = `Error Code: ${err.status}\nMessage: ${err.message}`;
                }

                // Log the eror
                this.log.error(`${LOG_PREFIX} Upload Error: ${errorMessage}`);

                // Set the progress to null 
                this.progressSubject$.next(null);

                // Set the processing status to false
                this.processingSubject$.next(false);
            }

        });
    }



    /**
     * Downloads file from FTP server
     */
    public downloadFile() {

        this.log.trace(`${LOG_PREFIX} Entering downloadFile()`);


        // Check if the file name has been provided
        this.log.trace(`${LOG_PREFIX} Checking if the file name has been provided`);
        if (this.value) {

            // The file name has been provided
            this.log.trace(`${LOG_PREFIX} The file name has been provided`);
            this.log.debug(`${LOG_PREFIX} File Name = ${this.value}`);

            // Set the processing status to true
            this.processingSubject$.next(true);

            // Download the file with the given name from the FTP server
            this.log.trace(`${LOG_PREFIX} Downloading the file with the given name from the FTP server`);
            this.fileService
                .download(this.value, `${environment.urls.ftp_resources}/${this.value}`)
                .pipe(
                    // Filter the response events for HttpEventType.DownloadProgress and HttpEventType.Response
                    filter((event: HttpEvent<any>) => {
                        return (
                            event.type === HttpEventType.DownloadProgress ||
                            event.type === HttpEventType.Response
                        );
                    }),
                    // If the event is HttpEventType.DownloadProgress, map the progress to a percentage
                    map((event: HttpEvent<any>) => {
                        if (event.type === HttpEventType.DownloadProgress) {

                            // Download in progress
                            this.log.trace(`${LOG_PREFIX} Download in progress`);

                            // Get the proportion downloaded  
                            const proportionDownloaded: number = Math.round((100 * event.loaded) / (event.total ?? 1));
                            this.log.debug(`${LOG_PREFIX} Proportion Downloaded = ${proportionDownloaded}`);

                            // Set the progress to the proportion downloaded 
                            this.progressSubject$.next(proportionDownloaded);
                        }
                        return event;
                    }),
                    // Filter out all events except for HttpEventType.Response
                    last(),
                    // Map the response to a Blob object
                    map((event: HttpEvent<any>) => {

                        if (event.type === HttpEventType.Response) {

                            // Download completed
                            this.log.trace(`${LOG_PREFIX} Download completed`);

                            // Cast the event object to the type HttpResponse<ArrayBuffer>, so that we can access its properties and methods
                            const res = event as HttpResponse<ArrayBuffer>;

                            // Create a blob by passing the ArrayBuffer contained in the response body to the Blob constructor
                            const blob = new Blob([res.body as ArrayBuffer]);

                            // Init the file name to the component's value
                            const fileName = this.value;

                            // Set the progress to null 
                            this.progressSubject$.next(null);

                            // Set the processing status to false
                            this.processingSubject$.next(false);

                            // Return the blob and the associated file name
                            return { data: blob, fileName };
                        }
                        throw new Error('Response event not found');
                    }),
                    // Handle errors
                    catchError((error) => {
                        this.log.error(`${LOG_PREFIX} Error downloading file: ${error}`);
                        return throwError(() => new Error('Error downloading file'));
                    })
                )
                .subscribe({
                    next: ({ data, fileName }) => {
                        // Create a temporary anchor tag to download the file
                        const downloadLink = document.createElement('a');
                        downloadLink.href = URL.createObjectURL(data);
                        downloadLink.download = fileName;
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                    },
                    error: (error) => {

                        // Log the error
                        this.log.error(`${LOG_PREFIX} Error downloading file: ${error}`);

                        // Set the progress to null 
                        this.progressSubject$.next(null);

                        // Set the processing status to false
                        this.processingSubject$.next(false);
                    }
                });

        } else {

            // The file name has not been provided
            this.log.error(`${LOG_PREFIX} The file name has not been provided`);
        }
    }



    /**
     * Deletes file from FTP server
     */
    public deleteFile() {

        this.log.trace(`${LOG_PREFIX} Entering deleteFile()`);

        // Check if the file name has been provided
        this.log.trace(`${LOG_PREFIX} Checking if the file name has been provided`);
        if (this.value) {

            // The file name has been provided
            this.log.trace(`${LOG_PREFIX} The file name has been provided`);
            this.log.debug(`${LOG_PREFIX} File Name = ${this.value}`);

            // Set the processing status to true
            this.processingSubject$.next(true);

            // Deleting the file with the given name from the FTP server
            this.log.trace(`${LOG_PREFIX} Deleting the file with the given name from the FTP server`);

            this.fileService
                .delete(`${environment.urls.ftp_resources}/${this.value}`)
                .pipe(
                    map((event: HttpEvent<any>) => {
                        if (event.type === HttpEventType.Response) {

                            const response = event as HttpResponse<any>;
                            const body = response.body;

                            // Set the processing status to false
                            this.processingSubject$.next(false);

                            return new HttpResponse({ body, status: response.status, statusText: response.statusText });
                        }
                        return event;
                    }),
                    catchError((err) => {
                        let errorMessage = 'Unknown error';
                        if (err.error instanceof ErrorEvent) {
                            errorMessage = `Error: ${err.error.message}`;
                        } else {
                            errorMessage = `Error Code: ${err.status}\nMessage: ${err.message}`;
                        }

                        // Set the processing status to false
                        this.processingSubject$.next(false);

                        return throwError(() => new Error(errorMessage));
                    })
                )
                .subscribe({
                    next: () => {
                        this.log.trace(`${LOG_PREFIX} File deleted successfully`);

                        // Update response
                        this.log.trace(`${LOG_PREFIX} Updating response`);
                        this.onValueChange(null);
                    },
                    error: (err: any) => {
                        this.log.error(`${LOG_PREFIX} Error deleting file: ${err}`);
                    }
                });
        } else {

            // The file name has not been provided
            this.log.error(`${LOG_PREFIX} The file name has not been provided`);
        }

    }


    isMobileTemplate(): boolean {
        return this.size == SCREEN_SIZE.SM;
    }


    toggleDescriptionCollapse() {
        this.descriptionCollapsed = !this.descriptionCollapsed;
    }


}

