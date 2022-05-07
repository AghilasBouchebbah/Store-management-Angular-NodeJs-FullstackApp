import { ValueTransformer } from '@angular/compiler/src/util';
import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ProductService } from 'src/app/services/product.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { GlobalConstant } from 'src/app/shared/global-constants';
import { ConfirmationComponent } from '../dialog/confirmation/confirmation.component';
import { ProductComponent } from '../dialog/product/product.component';

@Component({
  selector: 'app-manage-product',
  templateUrl: './manage-product.component.html',
  styleUrls: ['./manage-product.component.scss']
})
export class ManageProductComponent implements OnInit {

  displayedColumns: string[] = ['name', 'categoryName', 'description', 'price', 'edit'];
  dataSource: any;
  responseMessage: any;

  constructor(private productService: ProductService,
    private ngxService: NgxUiLoaderService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit(): void {
    //initialiser le loaderUI et l'affichage du tableau de données
    this.ngxService.start();
    this.tableData();
  }

  tableData() {
    this.productService.getProducts().subscribe(
      //si reponse 200
      //response contient les données récuprés de la base de données apés l'appel à l'api
      (response: any) => {

        this.ngxService.stop();
        //construire la table dataSource de type MatTableDataSource qui nous permet de faire des filtres par valeurs
        this.dataSource = new MatTableDataSource(response);
        //si erreur
      }, (error) => {
        console.log(error);
        this.ngxService.stop();
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        }
        else {
          this.responseMessage = GlobalConstant.genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, GlobalConstant.error);
      }
    )
  }



  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }


  handleAddAction() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Add'
    }
    //lorsque le user clique sur le button add product, le component enfant "product" qui est la boite de dialogue va s'ouvrir
    dialogConfig.width = "850px";
    const dialogRef = this.dialog.open(ProductComponent, dialogConfig);
    //lorsuque est faite sur le componeent enfant "product"
    //revenir au router actuel et on ferme la boite de dialog
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onAddProduct.subscribe(
      (response) => {
        this.tableData();
      }
    )
  }


  handleEditAction(values: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      action: 'Edit',
      data: values
    }
    dialogConfig.width = "850px";
    const dialogRef = this.dialog.open(ProductComponent, dialogConfig);
    this.router.events.subscribe(() => {
      dialogRef.close();
    });
    const sub = dialogRef.componentInstance.onEditProduct.subscribe(
      (response) => {
        this.tableData();
      }
    )
  }

  handleDeleteAction(values: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.data = {
      message: 'delete ' + values.name + ' product'
    }
    //faire appel à la boite de dialogue "confirmation"
    const dialogRef = this.dialog.open(ConfirmationComponent, dialogConfig);
    const sub = dialogRef.componentInstance.onEmitStatusChange.subscribe(
      (response) => {
        this.ngxService.start();
        this.deleteProduct(values.id);
        dialogRef.close();
      }
    )
  }


  deleteProduct(id: any) {
    this.productService.delete(id).subscribe(
      (response: any) => {
        //arreter le loader animation
        this.ngxService.stop();
        //rafraichir la table
        this.tableData();
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, 'success');

      }, (error) => {
        console.log(error);
        this.ngxService.stop();
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        }
        else {
          this.responseMessage = GlobalConstant.genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, GlobalConstant.error);
      })
  }


  onChange(status: any, id: any) {
    var data = {
      status: status.toString(),
      id: id
    }
    this.productService.updateStatus(data).subscribe(
      (response: any) => {
        this.responseMessage = response?.message;
        this.snackbarService.openSnackBar(this.responseMessage, 'success');

      }, (error) => {
        console.log(error);
        this.ngxService.stop();
        if (error.error?.message) {
          this.responseMessage = error.error?.message;
        }
        else {
          this.responseMessage = GlobalConstant.genericError;
        }
        this.snackbarService.openSnackBar(this.responseMessage, GlobalConstant.error);
      })

  }
}
