import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    const clonedRequest = req.clone({
      setHeaders: {
        'Content-Type': 'application/json'
        // 'Authorization': `Bearer ${token}` // Uncomment when token auth is added
      }
    });

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('API Error:', error);
        let errorMsg = 'An unknown error occurred';
        if (error.error?.message) {
          errorMsg = error.error.message;
        } else if (error.status) {
          errorMsg = `Error ${error.status}: ${error.statusText}`;
        }
        alert(errorMsg);
        return throwError(() => error);
      })
    );
  }
}