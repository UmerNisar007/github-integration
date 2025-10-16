import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GithubService {
  private baseUrl = 'http://localhost:3000/api/github';

  constructor(private http: HttpClient) {}

  getStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/status`);
  }

  removeIntegration(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  resyncIntegration(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/resync`, {});
  }

  getCollections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/collections`);
  }

  getData(
    collection: string,
    query: any,
    page: number = 0,
    limit: number = 50,
    sortField: string = '',
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', query.search || '')
      .set('sortField', sortField)
      .set('sortOrder', sortOrder);

    return this.http.get(`${this.baseUrl}/data/${collection}`, { params });
  }
}