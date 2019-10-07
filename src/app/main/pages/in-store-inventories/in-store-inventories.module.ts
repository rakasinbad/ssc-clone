import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { FuseSharedModule } from '@fuse/shared.module';
import { InStoreInventoriesRoutingModule } from './in-store-inventories-routing.module';
import { InStoreInventoriesComponent } from './in-store-inventories.component';
// import { InStoreCatalogsComponent } from './in-store-catalogs/in-store-catalogs.component';

@NgModule({
  declarations: [InStoreInventoriesComponent],
  imports: [
    InStoreInventoriesRoutingModule,

    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    MatMenuModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,

    FuseSharedModule
  ]
})
export class InStoreInventoriesModule {}
