import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';
import { AssignedAdministrativeUnitsTypesSelectionDataService } from './assigned-administrative-units-types-selection-data.service';

describe('Assigned Administrative Units Types Selection Data Service', () => {

    let administrativeUnitsTypesDataService: AssignedAdministrativeUnitsTypesSelectionDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [AssignedAdministrativeUnitsTypesSelectionDataService, ConnectivityStatusService],
        });

    
        administrativeUnitsTypesDataService = TestBed.inject(AssignedAdministrativeUnitsTypesSelectionDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

