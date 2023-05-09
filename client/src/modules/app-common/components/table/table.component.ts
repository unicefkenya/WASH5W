import { ChangeDetectionStrategy, Component, HostListener, Input, OnInit } from '@angular/core';
import { NGXLogger } from 'ngx-logger';

const LOG_PREFIX: string = "[Table Component]";

@Component({
    selector: 'sb-table',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './table.component.html',
    styleUrls: ['table.component.scss'],
})
export class TableComponent implements OnInit {

    // Table Customization Inputs
    @Input() data: boolean = false; // Accepts true or false
    @Input() captioned: boolean = true; // Accepts true or false
    @Input() headed: boolean = true; // Accepts true or false
    @Input() bodied: boolean = true; // Accepts true or false
    @Input() footed: boolean = true; // Accepts true or false
    @Input() responsive: boolean = true; // Accepts true or false
    @Input() stripped: boolean = true; // Accepts true or false
    @Input() bordered: boolean = false; // Accepts true or false
    @Input() hoverable: boolean = true; // Accepts true or false
    @Input() small: boolean = false; // Accepts true or false
    @Input() breakpoint: string | null = null; // Accepts sm,md,lg and xl
    @Input() background: string = "light"; // Accepts dark, light, etc    

    // Table Customization Classes 
    tableResponsivityClasses: string[] = [];
    tableClasses: string[] = ["table mb-3 pb-0"];
    tableHeaderClasses: string[] = [];

    constructor(private log: NGXLogger) { }

    ngOnInit() {
        this.log.trace(`${LOG_PREFIX} Initialising Component`);

        // Collate custom table responsivity classes
        if (this.responsive) {
            if (this.breakpoint) {
                switch (this.breakpoint) {
                    case "sm":
                    case "md":
                    case "lg":
                    case "xl":
                        this.tableResponsivityClasses.push(`table-responsive-${this.breakpoint}`);
                        break;
                    default:
                        this.tableResponsivityClasses.push("table-responsive");
                }
            } else {
                this.tableResponsivityClasses.push("table-responsive");
            }
        }


        // Collate custom table classes
        if (this.background) {
            this.tableClasses.push(this.background);
        }

        if (this.stripped) {
            this.tableClasses.push("table-striped");
        }

        if (this.bordered) {
            //this.tableClasses.push("table-bordered");
        } else {
            this.tableClasses.push("table-borderless");
        }

        if (this.hoverable) {
            this.tableClasses.push("table-hover");
        }

        if (this.small) {
            this.tableClasses.push("table-sm");
        }
    }

    @HostListener('window:beforeunload')
    ngOnDestroy() {
        this.log.trace(`${LOG_PREFIX} Destroying Component`);
    }    
}
