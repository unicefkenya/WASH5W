import { Component, ChangeDetectionStrategy, AfterViewInit, Input, Output, ElementRef, EventEmitter, HostListener } from "@angular/core";
import { ConnectivityStatusService } from "@common/services";
import { NGXLogger } from "ngx-logger";
import { BehaviorSubject, Observable, Subscription } from "rxjs";

const LOG_PREFIX: string = "[Button Component]";

@Component({
  selector: 'sb-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './button.component.html',
  styleUrls: ['button.component.scss'],
})
export class ButtonComponent {

  // Instantiate Events Emitters.
  @Output() add: EventEmitter<void> = new EventEmitter<void>();
  @Output() update: EventEmitter<number> = new EventEmitter<number>();
  @Output() delete: EventEmitter<number> = new EventEmitter<number>();
  @Output() copy: EventEmitter<number> = new EventEmitter<number>();
  @Output() close: EventEmitter<number> = new EventEmitter<number>();
  @Output() save: EventEmitter<void> = new EventEmitter<void>();
  @Output() yes: EventEmitter<void> = new EventEmitter<void>();
  @Output() no: EventEmitter<void> = new EventEmitter<void>();
  @Output() open: EventEmitter<any> = new EventEmitter<any>();
  @Output() select: EventEmitter<number> = new EventEmitter<number>();
  @Output() selectNested: EventEmitter<number> = new EventEmitter<number>();
  @Output() check: EventEmitter<any> = new EventEmitter<any>();
  @Output() uncheck: EventEmitter<any> = new EventEmitter<any>();
  @Output() next: EventEmitter<void> = new EventEmitter<void>();
  @Output() previous: EventEmitter<void> = new EventEmitter<void>();
  @Output() quit: EventEmitter<void> = new EventEmitter<void>();
  @Output() drillUp: EventEmitter<void> = new EventEmitter<void>();
  @Output() drillDown: EventEmitter<any> = new EventEmitter<any>();
  @Output() filter: EventEmitter<void> = new EventEmitter<void>();
  @Output() done: EventEmitter<void> = new EventEmitter<void>();
  @Output() apply: EventEmitter<void> = new EventEmitter<void>();
  @Output() expand: EventEmitter<number> = new EventEmitter<number>();
  @Output() collapse: EventEmitter<number> = new EventEmitter<number>();
  @Output() preview: EventEmitter<number> = new EventEmitter<number>();
  @Output() hide: EventEmitter<number> = new EventEmitter<number>();
  @Output() configure: EventEmitter<number> = new EventEmitter<number>();
  @Output() moveUp: EventEmitter<number> = new EventEmitter<number>();
  @Output() moveDown: EventEmitter<number> = new EventEmitter<number>();




  // Instantiate and avail the action variable to the parent component for customization.
  // Each event name above represents a supported action
  @Input() action!: string;

  // Instantiate and avail the entity variable to the parent component for customization.
  // The entity is the thing that we are adding, updating or deleting
  @Input() entity: string = "";

  // Instantiate and avail the id variable to the parent component for customization.
  // The id is the unique identifier of the entity
  @Input() id!: number;

  // Instantiate and avail the type id variable to the parent component for customization.
  // The type id is the unique identifier of the type of entity
  @Input() typeId!: number;

  // Instantiate and avail the name variable to the parent component for customization.
  // The name is the unique identifier of the entity
  @Input() name!: string;

  // Instantiate and avail the guarded variable to the parent component for customization.
  // The guard variable, will determine whether or not a button is disabled when the system goes offline
  @Input() guarded: boolean = true;

  // Instantiate and avail the disabled variable to the parent component for customization.
  // The disabled variable, will determine whether or not a button is disabled.
  // If true, this value will override the disabled property that is automatically set when the system goes offline.
  // It should thus not be confused with the disabled$ observable
  @Input() disabled: boolean = false;

  // Instantiate and avail the tooltip variable to the parent component for customization.
  // The tooltip, if provided, will be used in place of the getTooltip()'s concatenated result
  @Input() tooltip!: string;

  // Instantiate and avail the selected variable to the parent component for customization.
  // This will allow the Parent Component to specify whether or not it wants a Radio Button selected at the start
  @Input() selected: boolean = false;

  // Instantiate and avail the checked variable to the parent component for customization.
  // This will allow the Parent Component to specify whether or not it wants a Checkbox selected at the start
  @Input() checked: boolean = false;

  // Instantiate and avail a supportive text variable to the parent component for customization.
  // If included, this shall be appended next to the button icon or name
  @Input() text!: string;

  // Instantiate an array containing offline css classes
  offlineClasses: string[] = ["btn", "btn-sm", "btn-secondary", "mr-1", "custom-btn"];

  // Instantiate an array containing offline css classes
  onlineClasses: string[] = ["btn", "btn-sm", "btn-primary", "mr-1", "custom-btn"];

  // Keeps tabs of whether or not we are online
  online: boolean = false;


  // Keeps tabs of the current css classes.
  // Should be updated when the online status changes
  private _classesSubject$: BehaviorSubject<string[]> = new BehaviorSubject<string[]>(this.offlineClasses);
  readonly classes$: Observable<string[]> = this._classesSubject$.asObservable();

  // Keeps tabs of the current tooltip value.
  // Should be updated when the online status changes
  private _tooltipSubject$: BehaviorSubject<string> = new BehaviorSubject<string>("");
  readonly tooltip$: Observable<string> = this._tooltipSubject$.asObservable();

  // Keeps tabs of the current button disabled value.
  // Should be updated when the online status changes
  private _disabledSubject$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  readonly disabled$: Observable<boolean> = this._disabledSubject$.asObservable();

  // A common gathering point for all the component's subscriptions.
  // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
  private _subscriptions: Subscription[] = [];

  constructor(
    public connectivityStatusService: ConnectivityStatusService,
    private log: NGXLogger) {
  }

  ngOnInit() {

    this.log.trace(`${LOG_PREFIX} Initialising Component`);

    // Subscribe to connectivity status notifications.
    this.log.trace(`${LOG_PREFIX} Subscribing to connectivity status notifications`);
    this._subscriptions.push(
      this.connectivityStatusService.online$.subscribe(
        (status) => {
          if (status != this.online) {
            this.online = status;
            this._classesSubject$.next(this.getClasses());
            this._tooltipSubject$.next(this.getTooltip());
            this._disabledSubject$.next(this.getDisabled());
          }
        }));
  }

  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Destroying Component`);

    // Clear all subscriptions
    this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
    this._subscriptions.forEach(s => s.unsubscribe());
  }

  onFilter(): void {
    this.filter.emit();
  }

  onAdd(): void {
    this.add.emit();
  }

  onUpdate(): void {
    this.update.emit(this.id);
  }

  onDelete(): void {
    this.delete.emit(this.id);
  }

  onCopy(): void {
    this.copy.emit(this.id);
  }

  onClose(): void {
    this.close.emit(this.id);
  }

  onSave(): void {
    this.save.emit();
  }

  onYes(): void {
    this.yes.emit();
  }

  onNo(): void {
    this.no.emit();
  }

  onOpen(): void {
    this.open.emit({ id: this.id, name: this.name });
  }

  onNext(): void {
    this.next.emit();
  }

  onPrevious(): void {
    this.previous.emit();
  }

  onQuit(): void {
    this.quit.emit();
  }

  onDone(): void {
    this.done.emit();
  }

  onApply(): void {
    this.apply.emit();
  }

  onDrillUp(): void {
    this.drillUp.emit();
  }

  onDrillDown(): void {
    this.drillDown.emit({ typeId: this.typeId, id: this.id });
  }


  onMoveUp(): void {
    this.moveUp.emit(this.id);
  }

  onMoveDown(): void {
    this.moveDown.emit(this.id);
  }

  onExpand(): void {
    this.expand.emit(this.id);
  }

  onCollapse(): void {
    this.collapse.emit(this.id);
  }


  onConfigure(): void {
    this.configure.emit(this.id);
  }


  onPreview(): void {
    this.preview.emit(this.id);
  }

  onHide(): void {
    this.hide.emit(this.id);
  }


  onSelectNested(): void {
    this.selectNested.emit(this.id);
  }

  onSelectionChange(e: any) {
    console.log(e);
    if (e.target.checked) {
      this.select.emit(this.id);
    }
  }

  onCheckboxChange(e: any): void {
    console.log(e);
    if (e.target.checked) {
      this.check.emit(this.id);
    } else {
      this.uncheck.emit(this.id);
    }
  }



  getClasses(): string[] {

    if (this.disabled) {
      return this.offlineClasses;
    } else {
      return this.guarded ?
        this.online ? this.onlineClasses : this.offlineClasses :
        this.onlineClasses;
    }

  }

  getTooltip(): string {


    let prefix: string;

    const disabledSuffix1: string = "is currently disabled because the running process is yet to be completed";
    const disabledSuffix2: string = "is currently disabled because you seem to be offline";

    switch (this.action) {


      case "expand":

        prefix = this.tooltip != undefined ? this.tooltip : `Expand`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "collapse":

        prefix = this.tooltip != undefined ? this.tooltip : `Collapse`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "filter":

        prefix = this.tooltip != undefined ? this.tooltip : `Filter ${this.entity}`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "add":

        prefix = this.tooltip != undefined ? this.tooltip : `Add ${this.entity}`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "update":

        prefix = this.tooltip != undefined ? this.tooltip : `Update ${this.entity}`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "delete":

        prefix = this.tooltip != undefined ? this.tooltip : `Delete ${this.entity}`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "copy":

        prefix = this.tooltip != undefined ? this.tooltip : `Copy ${this.entity}`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "close":

        prefix = this.tooltip != undefined ? this.tooltip : `Close ${this.entity}`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "save":

        prefix = this.tooltip != undefined ? this.tooltip : `Save`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "yes":

        prefix = this.tooltip != undefined ? this.tooltip : `Yes`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "no":

        prefix = this.tooltip != undefined ? this.tooltip : `No`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "open":

        prefix = this.tooltip != undefined ? this.tooltip : `More details`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "next":

        prefix = this.tooltip != undefined ? this.tooltip : `Next`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "previous":

        prefix = this.tooltip != undefined ? this.tooltip : `Previous`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "quit":

        prefix = this.tooltip != undefined ? this.tooltip : `Quit`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "done":

        prefix = this.tooltip != undefined ? this.tooltip : `Close`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "apply":

        prefix = this.tooltip != undefined ? this.tooltip : `Apply`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "configure":

        prefix = this.tooltip != undefined ? this.tooltip : `Configure`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "preview":

        prefix = this.tooltip != undefined ? this.tooltip : `Preview`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "hide":

        prefix = this.tooltip != undefined ? this.tooltip : `Hide`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "select":

        prefix = this.tooltip != undefined ? this.tooltip : `Select`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "select-nested":

        prefix = this.tooltip != undefined ? this.tooltip : `Select ${this.entity}`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "check":

        prefix = this.tooltip != undefined ? this.tooltip : `Check`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "uncheck":

        prefix = this.tooltip != undefined ? this.tooltip : `Uncheck`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }


      case "moveUp":

        prefix = this.tooltip != undefined ? this.tooltip : `Move one step up`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }

      case "moveDown":

        prefix = this.tooltip != undefined ? this.tooltip : `Move one step down`;

        if (this.disabled) {
          return `${prefix} ${disabledSuffix1}`;
        } else {
          return this.guarded ?
            this.online ? `${prefix}` : `${prefix} ${disabledSuffix2}` :
            `${prefix}`;
        }
      default:
        return "";
    }

  }

  getDisabled(): boolean {

    if (this.disabled) {
      return true;
    } else {
      return this.guarded ?
        this.online ? false : true :
        false;
    }

  }

}