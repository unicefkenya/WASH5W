import { HttpClient } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, Input, OnInit, HostListener, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NGXLogger } from 'ngx-logger';
import { Filter } from '@app/app-filter.service';
import { FilterService } from '@app/app-filter.service';
import { BehaviorSubject, Subscription, first } from 'rxjs';
import { VisualisationVariable } from '@modules/visualisation-variables/models/visualisation-variable.model';
import { QuantityObservation } from '@modules/quantities-observations/models/quantity-observation.model';
import { MapState } from '@modules/dashboards/models/map-state.model';
import { Visualisation } from '@modules/visualisations/models/visualisation.model';
import { AdministrativeHierarchiesDataService } from '@modules/administrative-hierarchies/services/administrative-hierarchies-data.service';
import { AdministrativeUnitsDataService } from '@modules/administrative-units/services/administrative-units-data.service';
import { AdministrativeHierarchy } from '@modules/administrative-hierarchies/models/administrative-hierarchy.model';
import { AdministrativeUnit } from '@modules/administrative-units/models/administrative-unit.model';
import moment from 'moment';

/*import 'leaflet';
/*import '../../../../assets/scripts/leaflet.control.select';
import '../../../../assets/scripts/leaflet-grayscale';
import 'leaflet';
import 'leaflet-choropleth';
import 'leaflet-easybutton';*/

import 'leaflet';
import 'assets/scripts/choropleth';
import 'assets/scripts/easy-button';
import 'assets/scripts/leaflet.control.select';
import 'assets/scripts/leaflet-grayscale';
import { QuantitiesObservationsDataService } from '@modules/quantities-observations/services/quantities-observations-data.service';
import { VisualisationVariablesDataService } from '@modules/visualisation-variables/services/visualisation-variables-data.service';
import { VisualisationsDataService } from '@modules/visualisations/services/visualisations-data.service';
import { AdministrativeStructure } from '@modules/administrative-structures/models/administrative-structure.model';
import { AdministrativeStructuresDataService } from '@modules/administrative-structures/services/administrative-structures-data.service';

declare let L: any;

const LOG_PREFIX: string = "[Visualisation Map Component]";

@Component({
  selector: 'sb-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['maps.component.scss']
})
export class VisualisationMapComponent implements OnInit {

  // Allow the parent component to specify what should be visualized
  @Input() visualisation: Visualisation | null = null;

  // Collate the visualisation's variables
  private visualisationVariables!: VisualisationVariable[];

  // Keep tabs on the active visualisation variable
  public activeVisualisationVariable: VisualisationVariable | null | undefined;

  // Keep tabs on the subsidiary administrative hierarchies
  private subsidiaries: AdministrativeHierarchy[] = [];

  // Collate the visualisation variables indicators observations
  private quantitiesObservations!: QuantityObservation[];

  // Keep tabs on the values associated with each administrative unit
  values: Map<number, number> = new Map();

  // Declare an initialize the map's zoom level
  @Input() zoom: number = 7;

  // Declare and initialize the map's center
  @Input() centerLatitude: number = 1.373333;
  @Input() centerLongitude: number = 32.290275;


  // Holds the required records state
  // Makes it possible to supply the filter, sort or search criteria that should be applied to records on retrieval.
  private stateSubject$ = new BehaviorSubject<MapState | null>(null);
  readonly state$ = this.stateSubject$.asObservable();


  // Declare the map
  private map!: L.Map;

  // Declare the map's colored base layer
  private coloredBaseLayer!: any;

  // Declare the map's grayscale base layer
  private grayScaleBaseLayer!: any;

  // Declare the map's overlay layer
  private choroplethOverlayLayer!: any;

  // Declare the layer switcher control
  private layerSwitcherControl!: any;

  // Declare the zomm control
  private zoomControl!: any;

  // Declare the legend control
  private legendControl!: any;

  // Declare the filter control
  private filterControl!: any;

  // Keep tabs on the current filter
  filter!: Filter;


  // Keep tabs of errors
  error: string = "";


  center: any = L.latLng([this.centerLatitude, this.centerLongitude]);

  options = {
    center: L.latLng([this.centerLatitude, this.centerLongitude]),
    zoom: this.zoom,
    scrollWheelZoom: false,
    zoomControl: false
  }

  // Keep tabs on whether the map has been initialised previously
  initialised: boolean = false;


  // Keep tabs on the selected reporting period's data
  // admin unit id -> [visualisation variable id -> value]
  private data: Map<number, Map<number, number | null | undefined>> = new Map<number, Map<number, number | null | undefined>>();


  // Keep tabs of the currently active location / time filtering criterias
  public activeAdministrativeHierarchy: AdministrativeHierarchy | null | undefined = null;
  public activeAdministrativeUnit: AdministrativeUnit | null | undefined = null;
  public activeTimeIntervalStart: moment.Moment | null = null;
  public activeTimeIntervalEnd: moment.Moment | null = null;

  // Instantiate a central gathering point for all the component's subscriptions.
  // Makes it easier to unsubscribe from all subscriptions when the component is destroyed.   
  private _subscriptions: Subscription[] = [];

  constructor(
    public filterService: FilterService,
    public visualisationsDataService: VisualisationsDataService,
    public visualisationsVariablesDataService: VisualisationVariablesDataService,
    public administrativeHierarchiesDataService: AdministrativeHierarchiesDataService,
    public administrativeStructuresDataService: AdministrativeStructuresDataService,
    public administrativeUnitsDataService: AdministrativeUnitsDataService,
    public quantitiesObservationsDataService: QuantitiesObservationsDataService,
    private http: HttpClient,
    private modalService: NgbModal,
    private cd: ChangeDetectorRef,
    private log: NGXLogger) {
  }

  ngOnInit() {

    this.initialiseVisualisationsVariables(() => {
      this.initialiseLocationAndTimeFilterChangesHandler(() => {

      })
    })
  }





  @HostListener('window:beforeunload')
  ngOnDestroy() {

    this.log.trace(`${LOG_PREFIX} Destroying Component`);

    // Clear all subscriptions
    this.log.trace(`${LOG_PREFIX} Clearing all subscriptions`);
    this._subscriptions.forEach(s => s.unsubscribe());
  }


  /**
   * Retrieves and locally caches Visualisations Variables records
   * @param callback The function to call when done
   */
  private initialiseVisualisationsVariables(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseVisualisationsVariables()`);

    // Retrieve and cache all the Visualisations Variables records
    this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Visualisations Variables records`);
    this.visualisationsVariablesDataService
      .getVisualisationsVariables(false, {
        searchTerm: null,
        page: null,
        pageSize: null,
        sortColumn: 'id',
        sortDirection: 'asc',
        id: null,
        visualisationId: this.visualisation?.id,
        indicatorId: null,
        roleId: null
      })
      .pipe(first())
      .subscribe({
        next: (visualisationsVariables: VisualisationVariable[]) => {

          // Visualisations Variables successfully retrieved and cached
          this.log.debug(`${LOG_PREFIX} ${visualisationsVariables.length} Visualisations Variables(s) retrieved and cached`);
          this.visualisationVariables = this.sortVisualisationVariables(visualisationsVariables);

          // Preselect the first viualisation variable
          this.log.trace(`${LOG_PREFIX} ${visualisationsVariables.length} Preselecting the first viualisation variable`);
          this.activeVisualisationVariable = visualisationsVariables.length > 0 ? visualisationsVariables[0] : null;

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        },

        error: (err: any) => {

          // Visualisations Variables retrieval failed
          this.log.error(`${LOG_PREFIX} Visualisations Variables retrieval failed`);

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }
      });

  }


  /**
   * Subscribe and react to administrative unit changes
   * @param callback The function to call when done
   */
  private initialiseLocationAndTimeFilterChangesHandler(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseLocationAndTimeFilterChangesHandler()`);

    // Subscribe to filtering criteria updates and react to them if the administrative unit or time is changed
    this.log.trace(`${LOG_PREFIX} Subscribing to filtering criteria updates and react to them if the administrative unit or time is changed`);
    this._subscriptions.push(
      this.filterService.currentFilter$
        .subscribe({
          next: (filter) => {

            if ((JSON.stringify(this.activeAdministrativeUnit) !== JSON.stringify(filter.activeAdministrativeUnit)) ||
              (JSON.stringify(this.activeTimeIntervalStart) !== JSON.stringify(moment(filter.activeTimeIntervalStart))) ||
              (JSON.stringify(this.activeTimeIntervalEnd) !== JSON.stringify(moment(filter.activeTimeIntervalEnd)))) {

              // Location or time changed
              this.log.trace(`${LOG_PREFIX} Location or time changed`);

              if ((JSON.stringify(this.activeAdministrativeUnit) !== JSON.stringify(filter.activeAdministrativeUnit))) {

                this.initialiseSubsidiaries(() => {
                  this.initialiseQuantitiesObservations(() => {
                    this.initialiseSubsidiariesData(() => {
                      if (this.map) {
                        this.reinitialiseMap(() => {})
                      } else {
                        this.initialised = true;
                        this.cd.detectChanges();
                      }
                    })
                  })
                })

              } else {
                this.initialiseQuantitiesObservations(() => {
                  this.initialiseSubsidiariesData(() => {
                    if (this.map) {
                      this.reinitialiseMap(() => {})
                    } else {
                      this.initialised = true;
                      this.cd.detectChanges();
                    }
                  })
                })
              }

              // Keep a local reference to the location / temporal filters
              this.activeAdministrativeHierarchy = Object.assign({}, filter.activeAdministrativeHierarchy);
              this.activeAdministrativeUnit = Object.assign({}, filter.activeAdministrativeUnit);
              this.activeTimeIntervalStart = moment(filter.activeTimeIntervalStart).clone();
              this.activeTimeIntervalEnd = moment(filter.activeTimeIntervalEnd).clone();

            }
          }
        })
    );

    // Transfer control to the callback function
    callback();

  }


  private initialiseSubsidiaries(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSubsidiaries()`);

    this.subsidiaries.length = 0;

    if (this.filterService.filter.activeAdministrativeSystem?.id && this.filterService.filter.activeAdministrativeUnit?.id && this.filterService.filter.activeAdministrativeUnit?.data.typeId) {

      this.getSubsidiaryAdministrativeStructuresIds((ids: number[] | null) => {

        if (ids && ids.length > 0) {

          this.administrativeHierarchiesDataService
            .getAdministrativeHierarchies(false, {
              searchTerm: null,
              page: null,
              pageSize: null,
              sortColumn: 'id',
              sortDirection: 'asc',
              typesIds: ids,
              commissionerId: this.filterService.filter.activeAdministrativeUnit?.id,
              commissionerName: null,
              responsibleId: null,
              responsibleName: null,
              id: null
            })
            .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
            .subscribe({
              next: (administrativeHierarchies: AdministrativeHierarchy[]) => {

                // Administrative Hierarchies successfully retrieved and cached
                this.log.debug(`${LOG_PREFIX} ${administrativeHierarchies.length} Administrative Hierarchies retrieved and cached`);

                // Initialise the subsidiaries list
                this.log.trace(`${LOG_PREFIX} Initialising the subsidiaries list`);
                this.subsidiaries = administrativeHierarchies;

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();
              },

              error: (err: any) => {

                // Administrative Hierarchies retrieval failed
                this.log.error(`${LOG_PREFIX} Administrative Hierarchies retrieval failed`);

                // Return
                this.log.trace(`${LOG_PREFIX} Returning`);
                callback();

              }
            });

        } else {

          // Return
          this.log.trace(`${LOG_PREFIX} Returning`);
          callback();
        }

      })

    } else {

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }

  }



  /**
   * Retrieves and caches Quantities Observation records
   * @param callback The function to call when done
   */
  private initialiseQuantitiesObservations(callback: () => void): void {

    this.log.trace(`${LOG_PREFIX} Entering initialiseQuantitiesObservations()`);

    // Check if the target administrative unit has been specified
    this.log.trace(`${LOG_PREFIX} Checking if the target administrative unit has been specified`);
    if (this.filterService.filter.activeAdministrativeUnit?.id) {

      // The target administrative unit has been specified
      this.log.trace(`${LOG_PREFIX} The target administrative unit has been specified`);

      // Retrieve all the Quantities Observations whose indicators are referenced by the visualisation variables
      this.log.trace(`${LOG_PREFIX} Retrieving and caching all the Quantities Observation records`);
      this.quantitiesObservationsDataService
        .getQuantitiesObservations(false, {
          page: null,
          pageSize: null,
          searchTerm: null,
          sortColumn: 'id',
          sortDirection: 'asc',
          partiesIds: (this.subsidiaries.filter(s => s.data.responsible?.id).map(s => s.data.responsible?.id as number)).filter(this.notEmpty),
          timePointId: null,
          timePointIdGTE: parseInt(moment(this.filterService.filter.activeTimeIntervalStart).format('YYYYMMDD')),
          timePointIdLTE: parseInt(moment(this.filterService.filter.activeTimeIntervalEnd).format('YYYYMMDD')),
          timePeriodId: null,
          phenomenonTypesIds: (this.visualisationVariables.filter(v => v.data.indicatorId).map(v => v.data.indicatorId as number)).filter(this.notEmpty),
          observationTypeId: null
        })
        .pipe(first())
        .subscribe({
          next: (quantitiesObservations: QuantityObservation[]) => {

            // Quantities Observation successfully retrieved and cached
            this.log.debug(`${LOG_PREFIX} ${quantitiesObservations.length} Quantities Observation(s) retrieved and cached`);
            this.quantitiesObservations = quantitiesObservations;

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          },

          error: (err: any) => {

            // Quantities Observation retrieval failed
            this.log.error(`${LOG_PREFIX} Quantities Observation retrieval failed`);

            // Return
            this.log.trace(`${LOG_PREFIX} Returning`);
            callback();
          }
        });

    } else {

      // The target administrative unit has not been specified
      this.log.error(`${LOG_PREFIX} The target administrative unit has not been specified`);

      // Return
      this.log.trace(`${LOG_PREFIX} Returning`);
      callback();

    }


  }


  initialiseSubsidiariesData(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering initialiseSubsidiariesData()`);

    // Clear the previously initialised data
    this.data.clear();

    // Loop through each of the administrative hierarchies subsidiaries
    for (let subsidiary of this.subsidiaries) {

      // Get the id of the administrative unit associated with the subsidiary administrative hierarchy level
      const adminUnitId: number | null | undefined = subsidiary?.data?.responsible?.id;

      // Continue iff the administrative unit id was successfully retrieved
      if (adminUnitId) {

        // Obtain the administrative unit's observed values for each of the visualisations variables for the active period
        for (let v of this.visualisationVariables) {

          // Consider only the visualisation variables with valid ids / indicator ids
          if (v.id && v.data.indicatorId) {

            // Get the administrative unit's observations container
            // or initialise one if non-existent
            let temp: Map<number, number | null | undefined> | undefined = this.data.get(adminUnitId);
            if (temp == undefined) { temp = new Map<number, number | null | undefined>(); }

            // Get the observations associated with the administrative unit / visualisation variable's indicators
            const observations: QuantityObservation[] = this.quantitiesObservations.filter(q => q.data.partyId == adminUnitId && q.data.phenomenonTypeId == v.data.indicatorId);

            // Pick an observed value based on how many observations were returned
            switch (observations.length) {

              case 0:
                temp.set(v.id, null);
                break;

              case 1:
                temp.set(v.id, observations[0].data.amount);
                break;

              default:

                // Sort in descending order and take the first value i.e. the latest value
                temp.set(v.id, observations.sort(function (a, b) {
                  if (a.data.timePointId && b.data.timePointId) {
                    if (a.data.timePointId > b.data.timePointId) return -1;
                    if (a.data.timePointId < b.data.timePointId) return 1;
                    return 0;
                  } else {
                    return 0;
                  }
                })[0].data.amount);

            }

            // Update the administrative unit's data
            this.data.set(adminUnitId, temp);
          }

        }

      }


    }

    // Return
    this.log.trace(`${LOG_PREFIX} Returning`);
    callback();

  }


  onMapReady(map: L.Map) {

    this.log.trace(`${LOG_PREFIX} Entering onMapReady()`);

    if (!this.map) {

      // Keep a local reference to the map
      this.log.trace(`${LOG_PREFIX} Keeping a local reference to the map`);
      this.map = map;

      // Invalidating the map size to allow leaflet to detect page height.
      // Since the container has no explicit height, leaflet will not render all of the tiles
      // The following call remedies the issue by allowing leaflet to detect the height  
      this.log.trace(`${LOG_PREFIX} Invalidating map size to allow leaflet to detect page height`);
      setTimeout(() => {
        map.invalidateSize();
        this.initialiseMap(() => {

        })
      }, 0);
    }



  }


  initialiseMap(callback: () => void) {

    // Add the grayscale base layer to the map
    this.addGrayscaleBaseLayer(() => {
      this.addChoroplethOverlayMap(() => {
        this.addLegend(() => {
          this.addZoomControl(() => {
            this.addFilter(() => {

              // Map successfully initialised
              this.log.trace(`${LOG_PREFIX} Map successfully initialised`);

              // Transfer control to the callback() function
              callback();

            })
          })
        })
      })
    })
  }


  uninitialiseMap(callback: () => void) {

    this.removeChoroplethOverlayMap(() => {
      this.removeLegend(() => {
        this.removeZoomControl(() => {
          this.removeFilter(() => {

            // Map successfully uninitialised
            this.log.trace(`${LOG_PREFIX} Map successfully uninitialised`);

            // Transfer control to the callback() function
            callback();

          })
        })
      })
    })

  }


  reinitialiseMap(callback: () => void) {

    this.uninitialiseMap(() => {
      this.initialiseMap(() => {

      })
    })

  }


  /*addColoredBaseLayer(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering addColoredBaseLayer()`);

    // Initialise the colored base map
    this.log.trace(`${LOG_PREFIX} Initialising the colored base map`);
    this.coloredBaseLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      detectRetina: true,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    // Add the colored base map to the map
    this.log.trace(`${LOG_PREFIX} Adding the colored base map to the map`);
    this.coloredBaseLayer.addTo(this.map);

    // Transfer control to the callback() function
    callback();

  }*/

  addGrayscaleBaseLayer(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering addGrayscaleBaseLayer()`);

    // Check if the grayscale base layer hasn't been initialised
    this.log.trace(`${LOG_PREFIX} Checking if the grayscale base layer hasn't been initialised`);
    if (!this.grayScaleBaseLayer) {

      // The grayscale base layer hasn't been initialised
      this.log.trace(`${LOG_PREFIX} The grayscale base layer hasn't been initialised`);

      // Initialise the grayscale base map
      this.log.trace(`${LOG_PREFIX} Initialising the grayscale base layer`);

      // See: https://github.com/Zverik/leaflet-grayscale
      this.grayScaleBaseLayer = L.tileLayer.grayscale('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      // Add the grayscale base layer to the map
      this.log.trace(`${LOG_PREFIX} Adding the grayscale base layer to the map`);
      this.grayScaleBaseLayer.addTo(this.map);


    } else {

      // The grayscale base layer has been initialised
      this.log.trace(`${LOG_PREFIX} The grayscale base layer has been initialised`);

    }

    // Transfer control to the callback() function
    callback();

  }

  addChoroplethOverlayMap(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering addChoroplethOverlayMap()`);

    // Get the overlay geojson
    this.log.trace(`${LOG_PREFIX} Getting the overlay geojson`);
    this.http.get(`assets/maps/${this.activeAdministrativeUnit?.id}.geojson`)
      .subscribe((geojson: any) => {

        // Use the geojson to initialize the choropleth overlay layer
        this.log.trace(`${LOG_PREFIX} Using the geojson to initialize the choropleth overlay layer`);
        this.choroplethOverlayLayer = L.choropleth(geojson, {

          valueProperty: (feature: any) => {
            return this.getChoroplethDensity(feature.properties.entity_id)
          },
          scale: ['#ffffff', this.activeVisualisationVariable?.data.color],
          steps: 5,
          mode: 'q',
          style: {
            color: '#fff',
            weight: 2,
            fillOpacity: 0.9
          },
          onEachFeature: (feature: any, layer: any) => {

            /*layer.on('click', () => {
              this.onOpenMoreInformationModal({ id: feature.properties.entity_id, name: feature.properties.d });
            });*/

            layer.bindTooltip(feature.properties.name + ' (' + this.getChoroplethDensity(feature.properties.entity_id) + '%)');
          }
        });

        // Add the choropleth overlay to the map
        this.log.trace(`${LOG_PREFIX} Adding the choropleth overlay to the map`);
        this.choroplethOverlayLayer.addTo(this.map);

        // this.log.trace(`${LOG_PREFIX} Fitting the choropleth overlay to the map bounds`);
        this.map.fitBounds(this.choroplethOverlayLayer.getBounds());

        // Transfer control to the callback() function
        callback();

      });

  }



  removeChoroplethOverlayMap(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering removeChoroplethOverlayMap()`);

    // Check if a choropleth overlay layer has been added to the map
    this.log.trace(`${LOG_PREFIX} Checking if a choropleth overlay layer has been added to the map`);

    if (this.choroplethOverlayLayer) {

      // A choropleth overlay layer has been added to the map
      this.log.trace(`${LOG_PREFIX} A choropleth overlay layer has been added to the map`);

      // Remove the choropleth overlay
      this.log.trace(`${LOG_PREFIX} Remove the choropleth overlay`);
      this.map.removeControl(this.choroplethOverlayLayer);

    } else {

      // A choropleth overlay layer has not been added to the map
      this.log.trace(`${LOG_PREFIX} A choropleth overlay layer has not been added to the map`);

    }

    // Transfer control to the callback() function
    callback();

  }


  addLegend(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering addLegend()`);

    // Initialise a legend for the choropleth overlay
    this.log.trace(`${LOG_PREFIX} Initialising a legend for the choropleth overlay`);
    this.legendControl = L.control({ position: 'topright', title: this.activeVisualisationVariable?.data.label });
    this.legendControl.onAdd = (map: L.Map) => {

      const div = L.DomUtil.create('div', 'legend');
      const limits = [0,25,50,75,100];
      const colors = this.choroplethOverlayLayer.options.colors;
      const labels: any = [];
      const labelStyle = "\
        color: #333 \
        padding: 6px 0; \
        font: 12px Arial; Helvetica; sans-serif; \
        font-weight: bold; \
        border-radius: 5px";
      const minLabelStyle = "\
        color: #333; \
        float: left; \
        padding-bottom: 5px;";
      const maxLabelStyle = "\
        color: #333; \
        float: right;";
      const labelListStyle = "\
        list-style-type: none; \
        padding: 0; \
        margin: 0; \
        clear: both;";
      const labelListItemsStyle = "\
        display: inline-block; \
        width: 30px; \
        border: 1px solid #333; \
        height: 22px;";

      // Add min & max
      div.innerHTML = '\
        <div style="' + labelStyle + '"> \
        <div style="' + minLabelStyle + '">' + limits[0] + '</div> \
        <div style="' + maxLabelStyle + '">' + limits[limits.length - 1] + '</div>\
        </div>'

      limits.forEach(function (limit: number, index: number) {
        labels.push('<li style="' + labelListItemsStyle + '; background-color: ' + colors[index] + '"></li>')
      })

      div.innerHTML += '<ul style="' + labelListStyle + '">' + labels.join('') + '</ul>'
      return div
    }

    // Add the choropleth overlay legend
    this.log.trace(`${LOG_PREFIX} Adding the choropleth overlay legend to the map`);
    this.legendControl.addTo(this.map);

    // Transfer control to the callback() function
    callback();



  }


  removeLegend(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering removeLegend()`);

    // Check if a legend control has been added to the map
    this.log.trace(`${LOG_PREFIX} Checking if a legend control has been added to the map`);

    if (this.legendControl) {

      // A legend control has been added to the map
      this.log.trace(`${LOG_PREFIX} A legend control has been added to the map`);

      // Remove the legend
      this.log.trace(`${LOG_PREFIX} Remove the legend`);
      this.legendControl.remove(this.map);

    } else {

      // A legend control has not been added to the map
      this.log.trace(`${LOG_PREFIX} A legend control has not been added to the map`);

    }

    // Transfer control to the callback() function
    callback();



  }




  addLayerSwitcher(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering addLayerSwitcher()`);

    // Group the base maps layers
    this.log.trace(`${LOG_PREFIX} Grouping the base maps layers`);
    const baseMaps = {
      'Colored': this.coloredBaseLayer,
      'Grayscale': this.grayScaleBaseLayer
    };

    // Group the overlay maps layers
    this.log.trace(`${LOG_PREFIX} Grouping the overlay maps layers`);
    const overlayMaps = {
      'Administrative Units': this.choroplethOverlayLayer
    }

    // Initialise the layer switcher control with the base / overlay maps combination
    this.log.trace(`${LOG_PREFIX} Initialising the layer switcher control with the base / overlay maps combination`);
    this.layerSwitcherControl = L.control.layers(baseMaps, overlayMaps, { position: 'bottomleft' });

    // Add the layer switcher control on to the map
    this.log.trace(`${LOG_PREFIX} Adding the layer switcher control on to the map`);
    this.layerSwitcherControl.addTo(this.map);

    // Transfer control to the callback() function
    callback();

  }

  removeLayerSwitcher(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering removeLayerSwitcher()`);

    // Check if a layer switching control has been added to the map
    this.log.trace(`${LOG_PREFIX} Checking if a layer switching control has been added to the map`);

    if (this.layerSwitcherControl) {

      // A layer switching control has been added to the map
      this.log.trace(`${LOG_PREFIX} A layer switching control has been added to the map`);

      // Remove the layer switcher
      this.log.trace(`${LOG_PREFIX} Remove the layer switcher`);
      this.layerSwitcherControl.remove(this.map);


    } else {

      // A layer switching control has not been added to the map
      this.log.trace(`${LOG_PREFIX} A layer switching control has not been added to the map`);

    }

    // Transfer control to the callback() function
    callback();

  }


  addZoomControl(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering addZoomControl()`);


    // Initialise the zoom control
    this.log.trace(`${LOG_PREFIX} Initialising the zoom control`);
    this.zoomControl = L.control.zoom({
      position: 'bottomleft'
    });

    // Add the zoom control on to the map
    this.log.trace(`${LOG_PREFIX} Adding the zoom control on to the map`);
    this.zoomControl.addTo(this.map);

    // Transfer control to the callback() function
    callback();

  }

  removeZoomControl(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering removeZoomControl()`);

    // Check if a zoom control has been added to the map
    this.log.trace(`${LOG_PREFIX} Checking if a zoom control has been added to the map`);

    if (this.zoomControl) {

      // A zoom control has been added to the map
      this.log.trace(`${LOG_PREFIX} A zoom control has been added to the map`);

      // Remove the zoom control
      this.log.trace(`${LOG_PREFIX} Remove the zoom control`);
      this.zoomControl.remove(this.map);


    } else {

      // A zoom control has not been added to the map
      this.log.trace(`${LOG_PREFIX} A zoom control has not been added to the map`);

    }

    // Transfer control to the callback() function
    callback();

  }



  addFilter(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering addFilter()`);

    // Check if the filtering control hasn't been initialised
    this.log.trace(`${LOG_PREFIX} Checking if the filtering control hasn't been initialised`);
    if (this.filterControl == null) {

      // The filtering control hasn't been initialised
      this.log.trace(`${LOG_PREFIX} The filtering control hasn't been initialised`);

      // Initialise the filtering control
      this.log.trace(`${LOG_PREFIX} Initialising the filtering control`);

      let items: { label: string, value: number }[] = [];
      for (let vv of this.visualisationVariables.filter(v => v.data.dimensionIdx == 1)) { // Consider only totals
        if (vv.id && vv.data.label) {
          items.push({
            label: vv.data.label,
            value: vv.id
          })
        }
      }



      this.filterControl = L.control
        .select({
          position: "topleft",
          selectedDefault: this.activeVisualisationVariable?.id,
          iconMain: "☰",
          items: items,
          id: "filter-control",
          additionalClass: `custom-control`,
          onSelect: (id: number) => {

            this.activeVisualisationVariable = this.visualisationVariables.find(v => v.id == id);
            this.reinitialiseMap(() => {

            })
          }
        })

    } else {

      // The filtering control has been initialised
      this.log.trace(`${LOG_PREFIX} The filtering control has been initialised`);

    }

    // Add the filter control to the map
    this.log.trace(`${LOG_PREFIX} Adding the filter control to the map`);
    this.filterControl.addTo(this.map);



    // Transfer control to the callback() function
    callback();

  }


  removeFilter(callback: () => void) {

    this.log.trace(`${LOG_PREFIX} Entering removeFilter()`);

    // Check if a filtering control has been added to the map
    this.log.trace(`${LOG_PREFIX} Checking if a filtering control has been added to the map`);

    if (this.filterControl) {

      // A filtering control has been added to the map
      this.log.trace(`${LOG_PREFIX} A filtering control has been added to the map`);

      // Remove the filter
      this.log.trace(`${LOG_PREFIX} Remove the filter`);
      this.map.removeControl(this.filterControl);

    } else {

      // A filtering control has not been added to the map
      this.log.trace(`${LOG_PREFIX} A filtering control has not been added to the map`);

    }

    // Transfer control to the callback() function
    callback();

  }


  /**
   * See: https://stackoverflow.com/questions/15125920/how-to-get-distinct-values-from-an-array-of-objects-in-javascript
   */
  getChoroplethDensity(administrativeUnitId: number): number {

    this.log.trace(`${LOG_PREFIX} Entering getChoroplethDensity()`);
    this.log.debug(`${LOG_PREFIX} Administrative Unit Id = ${administrativeUnitId}`);

    let density: number | null | undefined = null;

    const temp: Map<number, number | null | undefined> | undefined = this.data.get(administrativeUnitId);

    if (temp && this.activeVisualisationVariable?.id) {

      density = temp.get(this.activeVisualisationVariable?.id);

    }

    // Adjust to 0 if not defined
    density = density ? density : 0;

    this.log.debug(`${LOG_PREFIX} Administrative Unit Id ${administrativeUnitId} Choropleth Density = ${density}`);
    return parseFloat(density.toFixed(3));

  }


  onOpenMoreInformationModal(administrativeUnit: { id: any, name: any }): void {

    this.log.trace(`${LOG_PREFIX} Entering onShowParticipatingOrganisations()`);
    this.log.debug(`${LOG_PREFIX} Administrative Unit = ${JSON.stringify(administrativeUnit)}`);


  }

  onFilter() {

    this.log.trace(`${LOG_PREFIX} Entering onFilter()`);



  }


  private showError(message: string) {

    this.error = message;

    setTimeout(() => {
      this.error = "";
      this.cd.detectChanges();
    }, 5000);
  }

  /**
   * Sorts the visulisation variables by dimension and index
   */
  private sortVisualisationVariables(visualisationVariables: VisualisationVariable[]): VisualisationVariable[] {

    return visualisationVariables.sort((obj1, obj2) => {

      if (obj1.data.dimensionIdx && obj2.data.dimensionIdx) {
        if (obj1.data.dimensionIdx < obj2.data.dimensionIdx) {
          return -1;
        } else if (obj1.data.dimensionIdx > obj2.data.dimensionIdx) {
          return 1;
        } else {

          if (obj1.data.labelIdx && obj2.data.labelIdx) {

            if (obj1.data.labelIdx < obj2.data.labelIdx) {
              return -1;
            } else if (obj1.data.labelIdx > obj2.data.labelIdx) {
              return 1;
            } else {
              return 0;
            }

          } else {

            return 0;
          }


        }
      } else {

        if (obj1.data.labelIdx && obj2.data.labelIdx) {

          if (obj1.data.labelIdx < obj2.data.labelIdx) {
            return -1;
          } else if (obj1.data.labelIdx > obj2.data.labelIdx) {
            return 1;
          } else {
            return 0;
          }

        } else {

          return 0;
        }
      }
    });

  }



  // See: https://stackoverflow.com/questions/43118692/typescript-filter-out-nulls-from-an-array
  private notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
    return value !== null && value !== undefined;
  }
  private unique(value: any, index: any, self: any) {
    return self.indexOf(value) === index;
  }

  private getsubsidiaryAdministrativeUnitName(id: number): string {
    const temp: AdministrativeHierarchy | undefined = this.subsidiaries.find(s => s.data.responsible?.id == id);
    return temp && temp.data.responsible?.name ? temp.data.responsible.name : "" + id;
  }

  getSubsidiaryAdministrativeStructuresIds(callback: (ids: number[] | null) => void): void {

    const hierarchyId: number | null | undefined = this.filterService.filter.activeAdministrativeSystem?.id;
    const commissionerId: number | null | undefined = this.filterService.filter.activeAdministrativeUnit?.data.typeId;

    if (hierarchyId && commissionerId) {

      this.administrativeStructuresDataService
        .getAdministrativeStructures(true, {
          searchTerm: null,
          page: null,
          pageSize: null,
          sortColumn: 'id',
          sortDirection: 'asc',
          hierarchyId: hierarchyId,
          hierarchyName: null,
          commissionerId: commissionerId,
          commissionerName: null,
          responsibleId: null,
          responsibleName: null
        })
        .pipe(first()) // This will automatically complete (and therefore unsubscribe) after the first value has been emitted.
        .subscribe({
          next: (administrativeStructures: AdministrativeStructure[]) => {

            const ids: number[] = [];
            for (let struct of administrativeStructures) {
              if (struct.id) {
                ids.push(struct.id);
              }
            }
            callback(ids);
          },

          error: (err: any) => {

            callback(null);
          }
        });

    } else {
      callback(null);
    }

  }


}



