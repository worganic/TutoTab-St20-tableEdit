# WorganicTabV1 / v20 : Table/Button/Edit

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 16.1.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


## Development server json

Run `json-server --watch db.json` for a dev server. Navigate to `http://localhost:3000/`.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Get clone 
> https://github.com/worganic/TutoTab-St20-tableEdit.git
> npm install
> cd .\worganic-tab-v19\
> ng serve

## Project :
v20 - Tableau -> Button -> edit

    - On ajoute un test sur le nom de la colonne pour ne pas affiché le nom de la colonne si il s'agit d'un button
        \src\app\shared\component\worg-table\worg-table.component.html
            >> <div *ngIf="column.type != 'button' && this.editAff == element['id']" >input</div>...
            
    - On ajout dans la fct "buttonFct" la section Edit :
        \src\app\shared\component\worg-table\worg-table.component.ts
            >> if(action == 'edit'){...
        La variable editAff indique la ligne à afficher par l'id.
            >> this.editAff = element.id;
    - On Ajout une option edit dans les options des colonnes :
        \src\app\component\users\users.component.ts
            >>  edit: true    
    - On modifi la vue pour affiché ou non les form/input (pour le moment) suivant les options des colonnes.
        \src\app\shared\component\worg-table\worg-table.component.html
            >> *ngIf="((column.type != 'button'  && this.editAff != element['id']) && column.edit == true) || column.edit != true"
    - On modifi la vue pour ajouté des boutons valid et cancel (si colonne edit).
        \src\app\shared\component\worg-table\worg-table.component.html
            >> <div *ngIf="editAff != element['id'] ||  column.column != 'edit'">...
            >> <div *ngIf="editAff == element['id'] && column.column == 'edit'">...
    - On ajout l'input :
        \src\app\shared\component\worg-table\worg-table.component.html
            >> <input [value]="element[column.column]" type="text" id="{{ column.column }}" name="{{ column.column }}" ...
    - On met à jour la fct buttonFct pour récupéré les données des input :
        \src\app\shared\component\worg-table\worg-table.component.ts
            >> if(action == 'editValid'){...
    - On met à jour la récup des datas dans Users :
        \src\app\component\users\users.component.ts
            >> action(data: any){...
                if(data['action']== "editValid"){...
    - Et on termine par mettre à jour le service :
        \src\app\shared\services\users.service.ts
            >> editUser(element: any) {...

## Problème à résoudre :
    

## Infos plus :
   
## Update

## Historique :
Avant -> v19 - Ajout bouton delete.
Après -> v21 - Tableau -> Button -> Edit -> selected

## Ressource :
    - Form
    https://www.bennadel.com/blog/3205-using-form-controls-without-formsmodule-or-ngmodel-in-angular-2-4-1.htm
    - Form input direct :
    https://www.cloudhadoop.com/angular-get-input-value-multiple-ways?utm_content=cmp-true
    - JsonServer :
    https://www.pluralsight.com/guides/posting-deleting-putting-data-angular

## Abouts
created by Johann Loreau
create at 2023/08/16
Le project évolura suivant les remarques et conseils des visiteurs.