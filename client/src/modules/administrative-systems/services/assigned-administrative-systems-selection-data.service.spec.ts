import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';
import { AssignedAdministrativeSystemsSelectionDataService } from './assigned-administrative-systems-selection-data.service';

describe('Assigned Administrative Systems Data Service', () => {

    let administrativeSystemsDataService: AssignedAdministrativeSystemsSelectionDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [AssignedAdministrativeSystemsSelectionDataService, ConnectivityStatusService],
        });

    
        administrativeSystemsDataService = TestBed.inject(AssignedAdministrativeSystemsSelectionDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

