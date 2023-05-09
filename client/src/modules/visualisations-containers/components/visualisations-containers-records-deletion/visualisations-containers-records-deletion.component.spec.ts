import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent, LoadingAnimationComponent } from '@common/components';
import { EmailService, ConnectivityStatusService } from '@common/services';
import { VisualisationsContainersDataService } from '@modules/visualisations-containers/services';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { VisualisationsContainersRecordsDeletionComponent } from '../visualisations-containers-records-deletion/visualisations-containers-records-deletion.component';


@Component({
    template: `
        <sb-visualisationsContainers-records-deletion [someInput]="someInput" (someFunction)="someFunction($event)"></sb-visualisationsContainers-records-deletion>
    `,
})
class TestHostComponent {
    // someInput = 1;
    // someFunction(event: Event) {}
}

describe('VisualisationsContainersRecordsDeletionComponent', () => {

    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let hostComponentDE: DebugElement;
    let hostComponentNE: Element;

    let component: VisualisationsContainersRecordsDeletionComponent;
    let componentDE: DebugElement;
    let componentNE: Element;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent, VisualisationsContainersRecordsDeletionComponent, PaginationComponent, LoadingAnimationComponent],
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [VisualisationsContainersDataService, EmailService, ConnectivityStatusService],
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
        expect(hostComponentNE.querySelector('sb-visualisationsContainers-records-deletion')).toEqual(jasmine.anything());
    });
});