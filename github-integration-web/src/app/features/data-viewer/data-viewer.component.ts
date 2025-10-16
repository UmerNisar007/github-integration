import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AgGridAngular } from 'ag-grid-angular';
import { GithubService } from '../../core/services/github.service';

@Component({
  selector: 'app-data-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    AgGridAngular
  ],
  templateUrl: './data-viewer.component.html',
  styleUrls: ['./data-viewer.component.scss']
})
export class DataViewerComponent implements OnInit {
  collections: string[] = [];
  selectedCollection = '';
  rowData: any[] = [];
  columnDefs: any[] = [];
  search = '';
  loading = false;

  // Pagination & Sorting
  page = 1;
  pageSize = 25;
  totalRows = 0;
  sortField = 'fetchedAt';
  sortDir: 'asc' | 'desc' = 'asc';

  gridApi: any;
  gridColumnApi: any;

  defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 120,
  };

  constructor(private github: GithubService) {}

  ngOnInit() {
    this.github.getCollections().subscribe(res => {
      this.collections = res.collections || [];
    });
  }

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    if (this.selectedCollection) {
      this.loadData();
    }
  }

  onSortChanged(event: any) {
    const sortModel = event.api.getSortModel();
    if (sortModel && sortModel.length > 0) {
      this.sortField = sortModel[0].colId;
      this.sortDir = sortModel[0].sort;
    } else {
      this.sortField = 'fetchedAt';
      this.sortDir = 'asc';
    }
    this.loadData();
  }

  loadData() {
    if (!this.selectedCollection) return;
    this.loading = true;

    const query: any = {
      page: this.page,
      pageSize: this.pageSize,
      sortField: this.sortField,
      sortDir: this.sortDir,
      search: this.search
    };

    this.github.getData(this.selectedCollection, query).subscribe({
      next: (res) => {
        this.rowData = res.data || [];
        this.totalRows = res.total || 0;
        if (res.columns?.length) {
          this.columnDefs = res.columns.map((c: any) => ({
            field: c.field,
            headerName: c.headerName || c.field,
          }));
        }
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  nextPage() {
    if (this.page * this.pageSize < this.totalRows) {
      this.page++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.loadData();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalRows / this.pageSize) || 1;
  }

}