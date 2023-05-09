import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, DebugElement, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { PaginationComponent, LoadingAnimationComponent } from '@common/components';
import { OrganisationsDataService } from '@modules/organisations/services/organisations-data.service';
import { LoggerModule, NgxLoggerLevel } from 'ngx-logger';
import { of } from 'rxjs';
import { OrganisationsRecordsTabulationComponent } from './organisations-records-tabulation.component';


@Component({
    template: `
        <sb-organisations-records-tabulation [someInput]="someInput" (someFunction)="someFunction($event)"></sb-organisations-records-tabulation>
    `,
})
class TestHostComponent {
    // someInput = 1;
    // someFunction(event: Event) {}
}

describe('OrganisationsRecordsTabulationComponent', () => {

    let fixture: ComponentFixture<TestHostComponent>;
    let hostComponent: TestHostComponent;
    let hostComponentDE: DebugElement;
    let hostComponentNE: Element;

    let component: OrganisationsRecordsTabulationComponent;
    let componentDE: DebugElement;
    let componentNE: Element;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TestHostComponent, OrganisationsRecordsTabulationComponent, PaginationComponent, LoadingAnimationComponent],
            imports: [NoopAnimationsModule, FormsModule, HttpClientTestingModule, RouterTestingModule, LoggerModule.forRoot({ serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.TRACE, serverLogLevel: NgxLoggerLevel.OFF })],
            providers: [
                OrganisationsDataService, 
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
        expect(hostComponentNE.querySelector('sb-organisations-records-tabulation')).toEqual(jasmine.anything());
    });
});