import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent, LoadingAnimationComponent } from '@common/components';
import { EmailService, ConnectivityStatusService } from '@common/services';
import { VisualisationsDataService } from '@modules/visualisations/services';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { VisualisationsRecordsDeletionComponent } from '../visualisations-records-deletion/visualisations-records-deletion.component';


@Component({
    template: `
        <sb-visualisations-records-deletion [someInput]="someInput" (someFunction)="someFunction($event)"></sb-visualisations-records-deletion>
    `,
})
class TestHostComponent {
    // someInput = 1;
    // someFunction(event: Event) {}
}

describe('VisualisationsRecordsDeletionComponent', () => {

    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let hostComponentDE: DebugElement;
    let hostComponentNE: Element;

    let component: VisualisationsRecordsDeletionComponent;
    let componentDE: DebugElement;
    let componentNE: Element;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent, VisualisationsRecordsDeletionComponent, PaginationComponent, LoadingAnimationComponent],
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [VisualisationsDataService, EmailService, ConnectivityStatusService],
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
        expect(hostComponentNE.querySelector('sb-visualisations-records-deletion')).toEqual(jasmine.anything());
    });
});