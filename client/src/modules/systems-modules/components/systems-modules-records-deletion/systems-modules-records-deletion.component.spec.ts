import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent, LoadingAnimationComponent } from '@common/components';
import { EmailService, ConnectivityStatusService } from '@common/services';
import { SystemsModulesDataService } from '@modules/systems-modules/services';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { SystemsModulesRecordsDeletionComponent } from '../systems-modules-records-deletion/systems-modules-records-deletion.component';


@Component({
    template: `
        <sb-systemsModules-records-deletion [someInput]="someInput" (someFunction)="someFunction($event)"></sb-systemsModules-records-deletion>
    `,
})
class TestHostComponent {
    // someInput = 1;
    // someFunction(event: Event) {}
}

describe('SystemsModulesRecordsDeletionComponent', () => {

    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let hostComponentDE: DebugElement;
    let hostComponentNE: Element;

    let component: SystemsModulesRecordsDeletionComponent;
    let componentDE: DebugElement;
    let componentNE: Element;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent, SystemsModulesRecordsDeletionComponent, PaginationComponent, LoadingAnimationComponent],
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [SystemsModulesDataService, EmailService, ConnectivityStatusService],
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
        expect(hostComponentNE.querySelector('sb-systemsModules-records-deletion')).toEqual(jasmine.anything());
    });
});