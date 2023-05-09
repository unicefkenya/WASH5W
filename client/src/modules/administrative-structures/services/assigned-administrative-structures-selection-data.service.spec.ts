import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';
import { AssignedAdministrativeStructuresSelectionDataService } from './assigned-administrative-structures-selection-data.service';

describe('Assigned Administrative Structures Selection Data Service', () => {

    let administrativeStructuresDataService: AssignedAdministrativeStructuresSelectionDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [AssignedAdministrativeStructuresSelectionDataService, ConnectivityStatusService],
        });

    
        administrativeStructuresDataService = TestBed.inject(AssignedAdministrativeStructuresSelectionDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

