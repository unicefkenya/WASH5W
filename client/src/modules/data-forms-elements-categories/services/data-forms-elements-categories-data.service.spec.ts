import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { DataFormsElementsCategoriesDataService } from './data-forms-elements-categories-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { EmailService } from '../../app-common/services/emails.service';
import { ConnectivityStatusService } from '@common/services';

describe('DataFormsElementsCategories Data Service', () => {

    let dataFormsElementTypesDataService: DataFormsElementsCategoriesDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [DataFormsElementsCategoriesDataService, EmailService, ConnectivityStatusService],
        });

    
        dataFormsElementTypesDataService = TestBed.inject(DataFormsElementsCategoriesDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

