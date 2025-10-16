import { Routes } from '@angular/router';
import { IntegrationComponent } from './features/integration/integration.component';
import { DataViewerComponent } from './features/data-viewer/data-viewer.component';

export const routes: Routes = [
  { path: '', redirectTo: 'integration', pathMatch: 'full' },
  { path: 'integration', component: IntegrationComponent },
  { path: 'dashboard', component: DataViewerComponent },
  { path: '**', redirectTo: 'integration' }
];
