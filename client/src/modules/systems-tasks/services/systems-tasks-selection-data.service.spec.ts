import { TestBed } from '@angular/core/testing';
import { HttpTestingController, HttpClientTestingModule } from '@angular/common/http/testing';
import { SystemsTasksDataService } from './systems-tasks-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { EmailService } from '../../app-common/services/emails.service';
import { ConnectivityStatusService } from '@common/services';

describe('SystemsTasks Data Service', () => {

    let systemsTasksDataService: SystemsTasksDataService;
    let httpMock: HttpTestingController;

    beforeEach(() => {

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [SystemsTasksDataService, EmailService, ConnectivityStatusService],
        });

    
        systemsTasksDataService = TestBed.inject(SystemsTasksDataService);
        httpMock = TestBed.inject(HttpTestingController);

    });

});

function expectNone() {
    throw new Error('Function not implemented.');
}

