import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';
import { AssignedAdministrativeHierarchiesSelectionDataService } from './assigned-administrative-hierarchies-selection-data.service';

describe('Assigned Administrative Hierarchies Selections Data Service', () => {

    let administrativeHierarchiesDataService: AssignedAdministrativeHierarchiesSelectionDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [AssignedAdministrativeHierarchiesSelectionDataService, ConnectivityStatusService],
        });

    
        administrativeHierarchiesDataService = TestBed.inject(AssignedAdministrativeHierarchiesSelectionDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

