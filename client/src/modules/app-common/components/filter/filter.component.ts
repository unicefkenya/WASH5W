import { Component, ChangeDetectionStrategy, AfterViewInit, HostListener, OnInit, OnDestroy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { NGXLogger } from "ngx-logger";
import { Subscription } from "rxjs";

const LOG_PREFIX: string = "[Filter Component]";

@Component({
  selector: 'sb-filter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './filter.component.html',
  styleUrls: ['filter.component.scss'],
})
export class FilterComponent implements OnInit, OnDestroy, AfterViewInit {

  // Allows the handling of the filter's select options as a reactive form
  filterForm!: FormGroup;

  // A common gathering point for all the component's subscriptions.
  // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
  private _subscriptions: Subscription[] = [];


  constructor(
    private log: NGXLogger) {
  }


  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Initialising Component`);

  }

  ngAfterViewInit() {

    this.log.trace(`${LOG_PREFIX} Post View initialisation`);

  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this._subscriptions.forEach((s) => s.unsubscribe());
  }

  onEmergencyChange(event: any) {

  }

  onIterationChange(event: any) {

  }


}
