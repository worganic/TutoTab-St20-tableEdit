import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { environment } from 'src/environments/environment';
import { NgFor, NgIf, CommonModule } from '@angular/common';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, of, Subject } from 'rxjs';
import { WorgPaginationComponent } from 'src/app/shared/component/worg-table/worg-pagination/worg-pagination.component';
import { TbPipe } from 'src/app/shared/component/worg-table/worg-pipes/tbPipe.pipe'
import { ExpandableComponent } from 'src/app/shared/component/worg-table/worg-expandable/expandable.component';


// Interface : liste des elements d'une colonne de table :
export interface Listecolumn {
  column: string;// Nom de la colonne dans les datas.
  columnTitle: string;// Nom de la colonne affiché.
  type: string;// Type d'infos : [number/string/boolean].
  columnHidden: boolean;// Colonne non affiché (hidden).

  filter: boolean;// Filtre de la colonne [true/false].
  filterType: string; // Filtre : type : [text/select].
  filterSelectData: any;// Filtre : liste des données du select.
  filterSelectDefault: string;// Filtre : donnée par default.
  filterSelectVide: string;// Filtre : donnée par default si données vide.
  edit: boolean;// Edition de la colonne.
}

export interface ModelExport {
  element: any,
  action: string
}

@Component({
  selector: 'app-worg-table',
  templateUrl: './worg-table.component.html',
  styleUrls: ['./worg-table.component.scss'],
  standalone: true,
  imports: [NgFor, NgIf, WorgTableComponent,
    FormsModule, ReactiveFormsModule,
    CommonModule,
    WorgPaginationComponent,
    TbPipe,
    ExpandableComponent
  ]
})
export class WorgTableComponent implements OnInit {

  dataSelectAsync$: Observable<any> | undefined;
  input$ = new Subject<string>();

  // Récupération des options du tableau :
  @Input() tableOption!: any[];
  // Récupération des data :
  @Input() ELEMENT_DATA!: any[];// Données récupéré en asynchrone.

  //
  @Output() action = new EventEmitter<ModelExport>();

  // Appel pour récupération des data :
  @Output() newDataEvent = new EventEmitter<any>();

  // Actualisation de la zone infos.
  infoActualisation: boolean = false;

  // Data récupéré et affiché dans la vue.
  viewData!: any[];
  DATATAB!: any[];
  viewDataLenght: number = 0;
  elementAffiche: number = 0;
  elementTotal: number = 0;

  // Timer de réactualisation :
  interval: any | undefined;// Premier timer d'actualisation.
  interval2: any | undefined;// Second timer pour l'affichage des infos de maj.
  timeLeft: number = environment.timerUser;
  time = 0;

  // Table options : 
  sectionName: string = "";
  urlParent: string = "";
  importPipe: any | undefined;
  tableAffichage: boolean = true;
  tableTimer: boolean = true;
  tableTimerTemps: number = environment.timerUser;
  filtre: boolean = true;
  paginatorPageSize: number = 10;
  paginatorMaxSize: number = 2;
  paginator: boolean = false;
  infosNbElement: boolean = false;
  infosNbElementText: string = "Nombre d'élément total";
  expandabled: boolean = false;

  service: any;// Service récupéré.
  Listecolumns!: Listecolumn[]; // Initialisation de la liste des filtres :

  // Form
  form!: FormGroup<any>;

  // Pagination :
  currentPage = 1;
  totalPages = 10;


  /**
   * constructor
   * 
   * @param _fb 
   */
  constructor(
  ) { }

  /**
   * 
   */
  ngOnInit(): void {
    console.log('WorgTableComponent | ngOnInit');

    // Récupération des option du tableau :
    const option = this.tableOption[0];
    this.sectionName = option['options']['sectionName'];
    console.log('WorgTableComponent | ngOnInit / option :', option);
    this.tableAffichage = option['options']['affichage'];
    this.urlParent = option['options']['urlParent'];

  //  this.importPipe = option['importPipe'];
  //  console.log('WorgTableComponent | ngOnInit / this.importPipe :',this.importPipe );
  
    this.tableTimer = option['options']['timer'];
    this.tableTimerTemps = option['options']['timerTemps'];
    this.filtre = option['options']['filtre'];
    this.paginator = option['options']['paginator'];
    if(this.paginator){
      if(option['options']['paginatorPageSize'])this.paginatorPageSize = option['options']['paginatorPageSize'];
      if(option['options']['paginatorMaxSize'])this.paginatorMaxSize = option['options']['paginatorMaxSize'];
    } else {
      this.paginatorPageSize = 10000;
    }
    this.infosNbElement = option['options']['infosNbElement'];
    this.infosNbElementText = option['options']['infosNbElementText'];
    this.expandabled = option['options']['expandabled'];
    console.log('WorgTableComponent | ngOnInit / this.expandabled :', this.expandabled);

    this.service = option['service'];// Service utilisé.
    this.Listecolumns = option['listeColumns'];// Liste des colonnes.
    // Récupération de l'option time si celle ci à été modifié.
    if (this.tableTimerTemps && this.timeLeft != this.tableTimerTemps) this.timeLeft = this.tableTimerTemps;

    // Mise en place des filtres :
    const group: any = {};
    Object.entries(this.Listecolumns).forEach(([key, value], index) => {
      //console.log('WorgTableComponent | Object / value :',value);
      group[value.column] = new FormControl(value.filterSelectDefault);
    });
    this.form = new FormGroup(group);


    // Récupération des employés :
    this.startTimer();
  }

  /**
   * 
   */
  ngOnDestroy() {
    if (this.interval) {
      console.log("WorgTableComponent | ngOnDestroy");
      clearInterval(this.interval);
    }
  }

  /**
   * 
   */
  startTimer(time1: number = this.timeLeft) {
    this.time = time1;
    //console.log("WorgTableComponent | startTimer / this.time", this.time);
    this.recupData();
    this.interval = setInterval(() => {
      //console.log("WorgTableComponent | startTimer /setInterval / this.time", this.time);
      if (this.time > 0) {
        this.time--;
      } else {
        //console.log("WorgTableComponent | startTimer");
        this.service.deleteCached();
        this.recupData();
        this.time = this.timeLeft;
      }
    }, 1000)
  }

  /**
   * 
   */
  majDonnees() {
    console.log("> WorgTableComponent | majDonnees");
    this.time = 0;
  }

  /**
   * 
   */
  startTimerInfo() {
    var time = 5;
    //console.log("WorgTableComponent | startTimerInfo / time", time);
    this.interval2 = setInterval(() => {
      //console.log("WorgTableComponent | startTimerInfo / interval2 / time", time);
      if (time > 0) {
        time--;
      } else {
        //console.log("WorgTableComponent | startTimerInfo FIN");
        this.infoActualisation = false;
        time = 0;
        clearInterval(this.interval2);
      }
    }, 1000)
  }

  /**
   * 
   */
  recupData() {
    //console.log("WorgTableComponent / recupData");
    this.newDataEvent.emit('add');
  }

  // Function de Récupération des employés :
  majData(res: any) {
    // console.log("WorgTableComponent / majData");
    var isEqual = JSON.stringify(this.DATATAB) === JSON.stringify(res);

    if (!isEqual) {// Si les données ont évolué :
      this.viewData = this.DATATAB = res;
      this.elementTotal = this.viewData.length;// Nombre d'élément total.

      //console.log("WorgTableComponent / majData / subscribe / res :", res);
      this.infoActualisation = true;
      this.startTimerInfo();

      // Mise à jour des Filtre select :
      this.selectDataMaj();

      // Vérication si les filtres sont utilisé :
      this.filterKeyEvent();

      // Récupération du nombre d'éléement à affiché :
      this.viewDataLenght = this.viewData.length;

    } else {// Les données récupéré sont identique (aucune maj necessaire) :
      //console.log("WorgTableComponent / majData / subscribe / Pas de de MAJ");
      this.infoActualisation = false;
    }
  }

  formData$: Observable<any> | undefined;

  /**
   * selectDataMaj
   * Création et mis en place des filtres select :
   */
  selectDataMaj() {
    // Mise en place des données dans les filtres select :
    const group: any = {};
    //console.log("WorgTableComponent | selectDataMaj / this.viewData :", this.viewData);
    // Boucle sur les colonnes :
    Object.entries(this.Listecolumns).forEach(([key, value], index) => {
      // console.log("WorgTableComponent | selectDataMaj / value :", value);

      // Vérification si les colonnes ont des filtres select :
      if (value.filterType == 'select' && value.filterSelectData == null) {
        // Mise en place des datas pour les seleted :
        this.formData$ = this.getSelectList();// Envois des datas dans le form.
      }
    });
  }

  /**
   * getSelectList
   * 
   * @returns 
   */
  getSelectList(): Observable<any> {

    let element: any = [];
    // Boucle sur la liste des colonnes :
    Object.entries(this.Listecolumns).forEach(([key, value], index) => {
      // console.log("WorgTableComponent | getsupplierlist / Object / value :", value);

      // Mise en place des datas pour les seleted :
      if (value.filterType == 'select') {//&& value.filterSelectData == null
        if (value.filterSelectData == null) {
          const listData: any = [];
          listData.push("All");// Data par default pour afficher toutes les données.

          // Récupération des datas parmis les datas encore affiché :
          Object.entries(this.viewData).forEach(([key1, value1], index1) => {
            listData.push(value1[value.column]);
          });

          element[value.column] = listData;// Récupération des données pour une colonne.
        } else {
          // Select avec les données dans les options :
          element[value.column] = value.filterSelectData;
        }
      }
    });
    return of(element);
  }

  /**
   * ngOnChanges
   * Si les données envoyé change :
   * 
   * ELEMENT_DATA
   */
  ngOnChanges() {
    // console.log("WorgTableComponent | ngOnChanges");

    // Check if the data exists before using it
    if (this.ELEMENT_DATA) {
      //console.log("WorgTableComponent | ngOnChanges / this.ELEMENT_DATA :", this.ELEMENT_DATA);
      this.majData(this.ELEMENT_DATA);
    }
  }

  /**
   * findHiddenFalse : Pipe d'affichage ou non des colonnes (option/colonne/columnHidden).
   * @param list Pip
   * @returns 
   */
  findHiddenFalse(list: any[]): any[] {
    //return list.filter(p => p.columnHidden === false);
    return list.filter(p => p.columnHidden === false);
  }

  result: any;
  /**
   * filterKeyEvent
   * @param event 
   */
  filterKeyEvent() {
    var testFilter = this.ELEMENT_DATA;

    // Récupération des infos des filtres :
    //console.log("WorgTableComponent | filterKeyEvent / this.form.value :", this.form.value);
    Object.entries(this.form.value).forEach(([key, value], index) => {
      if (value != null && value != 'All') {
        testFilter = testFilter.filter(p => {
          const tt = p[key].toLowerCase();
          const tt2 = value.toString().toLowerCase();
          return tt.includes(tt2);
        }
        );
      }
    });
    this.viewData = testFilter;
    this.elementAffiche = this.viewData.length;// Nombre d'élément affiché.

    this.selectDataMaj();
    //console.log("WorgTableComponent | filterKeyEvent / testFilter :", testFilter);
  }

  /**
   * 
   */
  onPageChange(page: number): void {
    this.currentPage = page;
  }

  /**
   * Expandable
   */
  expandableData: string = "";
  expandableNb: number = 0;
  timerSave: number = 0;
  expandable(element: any){
    console.log('WorgTableComponent | expandable / element :', element);  
    console.log('WorgTableComponent | expandable / element.isExpand :', element.isExpand);  
    if(element.isExpand){
      this.expandableNb++;
    } else {
      this.expandableNb =  this.expandableNb - 1;
    }

    if(this.expandableNb > 0){
      this.timerSave = this.time;
      console.log('WorgTableComponent | expandable / 0 this.timerSave :', this.timerSave);  
      clearInterval(this.interval);
    } else {
      console.log('WorgTableComponent | expandable / 1 this.timerSave :', this.timerSave);  
      this.startTimer(this.timerSave);
    }
  }


  /**
   * element
   * 
   * @param element 
   */

  editAff: number | undefined;
  buttonFct(element: any, action: string){
    var data: ModelExport = 
    { 
      element: element, 
      action: action
    };
    console.log('WorgTableComponent | buttonFct / data :', data);  
    if(action == 'delete'){
   
      this.action.emit(data);
      this.majDonnees();
    }
    if(action == 'edit'){
      if(this.editAff != undefined){
        this.editAff = undefined;
      }else{
        this.editAff = element.id;
      }
      console.log('WorgTableComponent | buttonFct / edit / element.id :', element.id);  
    }
    if(action == 'cancel'){
      this.editAff = undefined;
    }
    if(action == 'editValid'){
      console.log('WorgTableComponent | buttonFct / valid / element : ', element); 
      // On parcour les colonnes (options) :
      Object.entries(this.Listecolumns).forEach(([key, value], index) => {
        // On récupère que les type edit :
        if(value.edit){
          const res = (<HTMLInputElement>document.getElementById(value.column)).value;
          element[value.column] = res;
        }
      });
      // On envois les nouvelles données aux services :
      var data: ModelExport = 
      { 
        element: element, 
        action: action
      };
      this.action.emit(data);
      // On reviens à une ligne d'affichage normal (ss bouton).
      this.editAff = undefined;
      // On met à jour les données pour l'affichage.
      this.majDonnees();
    }

  }

  clickme(username: string) {
    console.log("WorgTableComponent | clickme / username : ", username);
  }

  /**
   * expandableAction
   * 
   * @param element 
   */
  expandableAction(element: any, expandable: boolean = false){
    if(this.expandabled){
      const expandableCol = this.tableOption[0]['options']['expandableCol'];
      // Vérification si le expandable est lié à la colonne :
      if(expandable || expandableCol == false){
        element.isExpand = !element.isExpand; 
        this.expandable(element);
      }
    }
  }

}