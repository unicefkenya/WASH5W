import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';

/**
 * A service for interacting with a file server.
 */
@Injectable({
    providedIn: 'root'
})
export class FileService {

    private baseUrl: string = environment.urls.ftp;
  
    constructor(private http: HttpClient) { }
  
    /**
     * Uploads a file to the server.
     * @param localFile The file to upload.
     * @param remoteFile The name of the file on the server.
     * @returns An observable that emits HttpEvents for monitoring the upload progress.
     */
    upload(localFile: File, remoteFile: string): Observable<HttpEvent<any>> {
      console.log('File object:', localFile);
  
      const formData = new FormData();
      formData.append('file', localFile, localFile.name);
      formData.append('remoteFile', remoteFile);
  
      console.log('Form data:', formData);
  
      const req = new HttpRequest('POST', `${this.baseUrl}/upload`, formData, {
        reportProgress: true,
        responseType: 'text'
      });
  
      return this.http.request(req);
    }
  
    /**
     * Downloads a file from the server.
     * @param localFile The name to use for the downloaded file.
     * @param remoteFile The name of the file on the server.
     * @returns An observable that emits HttpEvents for monitoring the download progress.
     */
    download(localFile: string, remoteFile: string): Observable<HttpEvent<any>> {
      const params = new HttpParams()
        .set('localFile', localFile)
        .set('remoteFile', remoteFile);
  
      const options = {
        responseType: 'arraybuffer' as const,
        reportProgress: true,
        observe: 'events'
      };
  
      const req = new HttpRequest('GET', `${this.baseUrl}/download`, { params, ...options });
  
      return this.http.request(req);
    }
  
    /**
     * Deletes a file from the server.
     * @param remoteFile The name of the file to delete on the server.
     * @returns An observable that emits HttpEvents for monitoring the delete progress.
     */
    delete(remoteFile: string): Observable<HttpEvent<any>> {
      const params = new HttpParams().set('remoteFile', remoteFile);
      const req = new HttpRequest('DELETE', `${this.baseUrl}/delete`, { params, responseType: 'text' });
      return this.http.request(req);
    }
  }
  
