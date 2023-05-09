/**
 * See: https://www.npmjs.com/package/ngx-countdown
 */

import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, HostListener, ViewChild } from "@angular/core";
import { CountdownComponent, CountdownConfig, CountdownEvent } from "ngx-countdown";
import { NGXLogger } from "ngx-logger";

const LOG_PREFIX: string = "[Countdown Overlay Component]";

@Component({
  selector: 'sb-countdown-overlay',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './countdown-overlay.component.html',
  styleUrls: ['countdown-overlay.component.scss'],
})
export class CountdownOverlayComponent {

  // Allows the parent component to configure the countdown
  @Input() config: Partial<CountdownConfig> = { leftTime: 10 }

  // Allows the parent component to specify the icon that will accompany the purpose of the countdown
  @Input() icon: string = "stopwatch";

  // Allows the parent component to specify what the countdown is all about
  @Input() crosshead: string = "";

  // Broadcasts countdown completion events to the parent component
  @Output() public completed: EventEmitter<void> = new EventEmitter<void>();

  // Keeps a reference to the Countdown component
  private _component!: CountdownComponent;

  // Keeps tabs of custom icon classes
  iconClasses: string[] = [];

  constructor(private log: NGXLogger) { }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnInit()`);
  }


  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Entering ngOnDestroy()`);

  }

  /**
   * Initialises the local reference to the displayed Countdown component
   */
  @ViewChild(CountdownComponent)
  public set component(component: CountdownComponent) {

    this.log.trace(`${LOG_PREFIX} Entering setComponent()`);

    if (component) {
      this._component = component;
    }
  }


  /**
   * Start countdown - must be manually called when demand = false
   */
  public begin(): void {
    this._component.begin();
  }

  /**
   * Restart countdown
   */
  public restart(): void {
    this._component.restart();
  }

  /**
   * Stop countdown, must call restart when stopped, it's different from pause, unable to recover
   */
  public stop(): void {
    this._component.stop();
  }


  /**
   * Pause countdown, you can use resume to recover again
   */
  public pause(): void {
    this._component.pause();
  }

  /**
  * Resume countdown
  */
  public resume(): void {
    this._component.resume();
  }


  public handleEvent(event: CountdownEvent): void {
    if (event.action == "done") {
      this.completed.emit();
    }
  }


}
