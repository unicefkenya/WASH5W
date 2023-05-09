import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { ConnectivityStatusService } from '@common/services';
import { SystemsUsersAccountsService } from './systems-users-accounts.service';

describe('Systems Users Accounts Data Service', () => {

    let logicalElementsTypesDataService: SystemsUsersAccountsService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [SystemsUsersAccountsService, ConnectivityStatusService],
        });

    
        logicalElementsTypesDataService = TestBed.inject(SystemsUsersAccountsService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

