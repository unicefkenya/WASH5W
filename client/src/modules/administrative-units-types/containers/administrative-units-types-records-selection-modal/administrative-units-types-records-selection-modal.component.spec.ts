import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { AdministrativeUnitsTypesDataService } from '@modules/administrative-units-types/services/administrative-units-types-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { of } from 'rxjs';
import { AdministrativeUnitsTypesRecordsSelectionModalComponent } from './administrative-units-types-records-selection-modal.component';


@Component({
    template: `
        <sb-administrativeUnitsTypes-records-selection-modal [someInput]="someInput" (someFunction)="someFunction($event)"></sb-administrativeUnitsTypes-records-selection-modal>
    `,
})
class TestHostComponent {
    // someInput = 1;
    // someFunction(event: Event) {}
}

describe('AdministrativeUnitsTypesRecordsSelectionModalComponent', () => {
    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let hostComponentDE: DebugElement;
    let hostComponentNE: Element;

    let component: AdministrativeUnitsTypesRecordsSelectionModalComponent;
    let componentDE: DebugElement;
    let componentNE: Element;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent, AdministrativeUnitsTypesRecordsSelectionModalComponent],
            imports: [HttpClientTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [
                AdministrativeUnitsTypesDataService, 
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
        expect(hostComponentNE.querySelector('sb-administrativeUnitsTypes-records-selection-modal')).toEqual(jasmine.anything());
    });
});
