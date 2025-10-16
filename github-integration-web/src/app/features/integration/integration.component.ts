import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { GithubService } from '../../core/services/github.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-integration',
  standalone: true,
  imports: [CommonModule,HttpClientModule, MatCardModule, MatButtonModule, MatExpansionModule],
  templateUrl: './integration.component.html',
  styleUrls: ['./integration.component.scss']
})
export class IntegrationComponent implements OnInit {
  status: any = null;
  loading = false;

  constructor(private github: GithubService) {}

  ngOnInit() {
    this.fetchStatus();
  }

  fetchStatus() {
    this.github.getStatus().subscribe(res => this.status = res);
  }

  connect() {
    window.location.href = 'http://localhost:3000/api/github/connect';
  }

  remove() {
    if (this.status?._id) {
      this.github.removeIntegration(this.status._id).subscribe(() => {
        alert('Integration removed');
        this.fetchStatus();
      });
    }
  }


  resync() {
    if (this.status?._id) {
      this.loading = true;
      this.github.resyncIntegration(this.status._id).subscribe(() => {
        this.loading = false;
        alert('Resync completed');
      });
    }
  }
}