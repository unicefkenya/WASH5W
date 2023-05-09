import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';
import { AssignedAdministrativeUnitsSelectionDataService } from './assigned-administrative-units-selection-data.service';

describe('Assigned Administrative Units Selection Data Service', () => {

    let administrativeUnitsDataService: AssignedAdministrativeUnitsSelectionDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [AssignedAdministrativeUnitsSelectionDataService, ConnectivityStatusService],
        });

    
        administrativeUnitsDataService = TestBed.inject(AssignedAdministrativeUnitsSelectionDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

