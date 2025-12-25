import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { TokenStorageService } from "./token-storage.service";
import { AuthenticationService } from "./auth.service";

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
    providedIn: 'root',
})

export class ApiCallService {

    // private readonly baseRoute = "https://209.145.48.167:44385/api/";
    // private readonly baseRoute = "https://localhost:51346/api/";
    private readonly baseRoute = "https://154.38.171.150:44386/api/";

    private token: string | null = "";


    constructor(private http: HttpClient, private authService: AuthenticationService) {
        this.token = authService.getToken();
    }

    public PostCall(Payload: any, apiroute: string): Observable<any> {
        var finalroute = this.baseRoute + apiroute;
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (this.token) {
            headers = headers.set("Authorization", `Bearer ${this.token}`);
        }
        var response = this.http
            .post<any>(finalroute, Payload, { headers })
            .pipe(catchError(this.handleError));
        return response;
    }

    public GetCall(apiroute: string): Observable<any> {
        var apiurl = this.baseRoute + apiroute;
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (this.token) {
            headers = headers.set("Authorization", `Bearer ${this.token}`);
        }
        var response = this.http
            .get<any>(apiurl, { headers })
            .pipe(catchError(this.handleError));
        return response;
    }

    public DeleteCall(apiroute: string): Observable<any> {
        var apiurl = this.baseRoute + apiroute;
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (this.token) {
            headers = headers.set("Authorization", `Bearer ${this.token}`);
        }
        var response = this.http
            .delete<any>(apiurl, { headers })
            .pipe(catchError(this.handleError));
        return response;
    }

    public PatchCall(Payload: any, apiroute: string): Observable<any> {
        var finalroute = this.baseRoute + apiroute;
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (this.token) {
            headers = headers.set("Authorization", `Bearer ${this.token}`);
        }
        var response = this.http
            .patch<any>(finalroute, Payload, { headers })
            .pipe(catchError(this.handleError));
        return response;
    }


    private handleError(error: HttpErrorResponse) {
        if (error.status === 400) {
            return throwError("User already exists");
        } else {
            return throwError("Something went wrong. Please try again later.");
        }
    }

    PostFormDataWithToken(Payload: FormData, apiroute: string): Observable<any> {
        const token = this.authService.getToken();

        let headers = new HttpHeaders();
        if (token) {
            headers = headers.set("Authorization", `Bearer ${token}`);
        }

        const finalroute = this.baseRoute + apiroute;

        return this.http.post<any>(finalroute, Payload, { headers })
            .pipe(catchError(this.handleError));
    }

    public DeleteCallWithBody(apiroute: string, body: any): Observable<any> {
        const apiurl = this.baseRoute + apiroute;
        let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
        if (this.token) {
            headers = headers.set("Authorization", `Bearer ${this.token}`);
        }
        return this.http
            .request<any>("delete", apiurl, { headers, body })
            .pipe(catchError(this.handleError));
    }



}