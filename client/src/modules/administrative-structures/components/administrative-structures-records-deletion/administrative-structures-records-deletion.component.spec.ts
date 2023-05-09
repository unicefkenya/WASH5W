import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent, LoadingAnimationComponent } from '@common/components';
import { EmailService, ConnectivityStatusService } from '@common/services';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { AdministrativeStructuresRecordsDeletionComponent } from '../administrative-structures-records-deletion/administrative-structures-records-deletion.component';


@Component({
    template: `
        <sb-administrative-structures-records-deletion [someInput]="someInput" (someFunction)="someFunction($event)"></sb-administrative-structures-records-deletion>
    `,
})
class TestHostComponent {
    // someInput = 1;
    // someFunction(event: Event) {}
}

describe('AdministrativeStructuresRecordsDeletionComponent', () => {

    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let hostComponentDE: DebugElement;
    let hostComponentNE: Element;

    let component: AdministrativeStructuresRecordsDeletionComponent;
    let componentDE: DebugElement;
    let componentNE: Element;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent, AdministrativeStructuresRecordsDeletionComponent, PaginationComponent, LoadingAnimationComponent],
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [AdministrativeStructuresDataService, EmailService, ConnectivityStatusService],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(TestHostComponent);
        hostComponent = fixture.componentInstance;
        hostComponentDE = fixture.debugElement;
        hostComponentNE = hostComponentDE.nativeElement;

        componentDE = hostComponentDE.children[0];
        component = componentDE.componentInstance;
        componentNE = componentDE.nativeElement;

        fixture.detectChanges();
    });

    it('should display the component', () => {
        expect(hostComponentNE.querySelector('sb-administrative-structures-records-deletion')).toEqual(jasmine.anything());
    });
});