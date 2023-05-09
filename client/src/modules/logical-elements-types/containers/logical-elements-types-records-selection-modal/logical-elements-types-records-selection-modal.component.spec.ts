import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { LogicalElementsTypesDataService } from '@modules/logical-elements-types/services/logical-elements-types-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { of } from 'rxjs';
import { LogicalElementsTypesRecordsSelectionModalComponent } from './logical-elements-types-records-selection-modal.component';


@Component({
    template: `
        <sb-logicalElementsTypes-records-selection-modal [someInput]="someInput" (someFunction)="someFunction($event)"></sb-logicalElementsTypes-records-selection-modal>
    `,
})
class TestHostComponent {
    // someInput = 1;
    // someFunction(event: Event) {}
}

describe('LogicalElementsTypesRecordsSelectionModalComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let hostComponentDE: DebugElement;
    let hostComponentNE: Element;

    let component: LogicalElementsTypesRecordsSelectionModalComponent;
    let componentDE: DebugElement;
    let componentNE: Element;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent, LogicalElementsTypesRecordsSelectionModalComponent],
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [
                LogicalElementsTypesDataService, 
                {
                    provide: ActivatedRoute, 
                    useValue: {
                        paramMap: of({ get: (key: string) => 1 }),
                        queryParamMap: of({ get: (key: string) => 'value' })
                    }
                }
            ],
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
        expect(hostComponentNE.querySelector('sb-logicalElementsTypes-records-selection-modal')).toEqual(jasmine.anything());
    });
});
