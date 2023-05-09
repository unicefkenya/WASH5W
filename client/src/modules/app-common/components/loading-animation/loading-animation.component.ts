import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { BehaviorSubject} from 'rxjs';

const LOG_PREFIX: string = "[Loading Animation Component]";

@Component({
  selector: 'sb-loading-animation',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './loading-animation.component.html',
  styleUrls: ['loading-animation.component.scss'],
})
export class LoadingAnimationComponent implements OnInit {

  @Input() type: string = "spinner"; // spinner or bars

  // Instantiate a loading status observable field.
  // This field's value will be updated by external processes whenever the user 
  // starts and completes a background task.  
  private _loadingSubject$ = new BehaviorSubject<boolean>(false);
  readonly loading$ = this._loadingSubject$.asObservable();

  constructor(private log: NGXLogger) { }

  ngOnInit() {
    this.log.trace(`${LOG_PREFIX} Initialising Component`);
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {
    this.log.trace(`${LOG_PREFIX} Destroying Component`);
  }

  /**
   * Sets the current loading status: true or false
   */
  public set loading(loading: boolean) {
    this.log.debug(`${LOG_PREFIX} Setting loading status to ${JSON.stringify(loading)}`);
    this._loadingSubject$.next(loading);
  }
}
