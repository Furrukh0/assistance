import { Injectable } from '@angular/core';
import { getFirebaseBackend } from '../../authUtils';
import { User } from 'src/app/store/Authentication/auth.models';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { GlobalComponent } from "../../global-component";
import { Store } from '@ngrx/store';
import { RegisterSuccess, loginFailure, loginSuccess, logout, logoutSuccess } from 'src/app/store/Authentication/authentication.actions';
import { Router } from '@angular/router';
import { ToastService } from './toast.service';
import { jwtDecode } from 'jwt-decode';

const AUTH_API = GlobalComponent.AUTH_API;

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

interface DecodedToken {
    exp: number;
    Type: string;
    ID: number;
}

@Injectable({ providedIn: 'root' })

/**
 * Auth-service Component
 */
export class AuthenticationService {
    private readonly TOKEN_KEY = 'token';
    user!: User;
    currentUserValue: any;

    private currentUserSubject: BehaviorSubject<User>;
    // public currentUser: Observable<User>;

    constructor(private http: HttpClient, private store: Store, private router: Router, private toastr: ToastService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(sessionStorage.getItem('currentUser')!));
        // this.currentUser = this.currentUserSubject.asObservable();
    }

    /**
     * Performs the register
     * @param email email
     * @param password password
     */
    register(email: string, first_name: string, password: string) {
        // return getFirebaseBackend()!.registerUser(email, password).then((response: any) => {
        //     const user = response;
        //     return user;
        // });

        // Register Api
        return this.http.post(AUTH_API + 'signup', {
            email,
            first_name,
            password,
        }, httpOptions).pipe(
            map((response: any) => {
                const user = response;
                return user;
            }),
            catchError((error: any) => {
                const errorMessage = 'Login failed'; // Customize the error message as needed
                this.store.dispatch(loginFailure({ error: errorMessage }));
                return throwError(errorMessage);
            })
        );
    }

    /**
     * Performs the auth
     * @param email email of user
     * @param password password of user
     */
    login(email: string, password: string) {
        // return getFirebaseBackend()!.loginUser(email, password).then((response: any) => {
        //     const user = response;
        //     return user;
        // });

        return this.http.post(AUTH_API + 'signin', {
            email,
            password
        }, httpOptions).pipe(
            map((response: any) => {
                const user = response;
                return user;
            }),
            catchError((error: any) => {
                const errorMessage = 'Login failed'; // Customize the error message as needed
                return throwError(errorMessage);
            })
        );
    }

    /**
     * Returns the current user
     */
    public currentUser(): any {
        return getFirebaseBackend()!.getAuthenticatedUser();
    }

    /**
     * Logout the user
     */
    // logout() {
    //     this.store.dispatch(logout());
    //     // logout the user
    //     // return getFirebaseBackend()!.logout();
    //     sessionStorage.removeItem('currentUser');
    //     sessionStorage.removeItem('token');
    //     this.currentUserSubject.next(null!);

    //     return of(undefined).pipe(

    //     );

    // }

    /**
     * Reset password
     * @param email email
     */
    resetPassword(email: string) {
        return getFirebaseBackend()!.forgetPassword(email).then((response: any) => {
            const message = response.data;
            return message;
        });
    }


    // methods

    saveToken(token: string): void {
        localStorage.setItem(this.TOKEN_KEY, token);
        // this.isAuthenticatedSubject.next(true);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        const userDetails = this.getUserDetails();
        const details = JSON.parse(userDetails);
        return details?.refreshToken || null;
    }

    private decodeToken(token: string): DecodedToken {
        try {
            return jwtDecode<DecodedToken>(token);
        } catch (error) {
            console.error('Error decoding token:', error);
            return { exp: 0, Type: '', ID: 0 };
        }
    }

    logout(): void {
        this.router.navigate(['/']);
        this.deleteLoginDetails();
        // this.isAuthenticatedSubject.next(false);
        this.toastr.info('You have been logged out');
    }

    deleteLoginDetails() {
        localStorage.removeItem('token');
        localStorage.removeItem('userDetails');
        sessionStorage.clear();
    }

    isTokenExpired(token: string | null): boolean {
        if (!token) return true;
        const decodedToken = this.decodeToken(token);
        return Date.now() >= decodedToken.exp * 1000;
    }

    getTokenExpiry(token: string): number {
        const decoded = this.decodeToken(token);
        return decoded.exp;
    }


    // isAuthenticated(): Observable<boolean> {
    //     return this.isAuthenticatedSubject.asObservable();
    // }

    hasValidToken(): boolean {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    }

    getUserRole(): string | null {
        const token = this.getToken();
        if (!token) {
            // this.userRoleSubject.next(null);
            return null;
        }
        const decodedToken = this.decodeToken(token);
        const role = decodedToken.Type;
        // this.userRoleSubject.next(role);
        return role;
    }

    getUserId(): number | null {
        const token = this.getToken();
        if (!token) return null;
        const decodedToken = this.decodeToken(token);
        return decodedToken.ID;
    }

    getUserDetails(): any {
        const token = this.getToken();
        if (!token) return null;
        const userDetails = localStorage.getItem('userDetails');
        return userDetails;
    }

    checkTokenExpiryAndLogout(): void {
        if (!this.hasValidToken()) {
            this.logout();
        }
    }

    generateFallbackImage(firstName: string | null): string {
        const initial = firstName?.charAt(0).toUpperCase();
        return `https://placehold.co/96x96?text=${initial}`;
    }


    canActivate(): boolean {

        if (this.hasValidToken()) {
            return true;
        } else {
            this.toastr.warning('Please log in to access this page');
            this.router.navigate(['/authentication']);
            return false;
        }
    }

    onInvalidToken() {

        this.router.navigate(['/']);
        this.logout();
        // this.toastr.error('Your session has expired. Please log in again.');
        // return throwError(() => new Error('Unauthorized access'));
    }

    isLoggedIn(): boolean {
        const token = this.getToken();
        return !!token && !this.isTokenExpired(token);
    }


    saveUserDetailsOnLogin(userDetails: any) {
        localStorage.setItem('userDetails', JSON.stringify(userDetails));
        this.saveToken(userDetails.token);
    }


    saveLoginCredentials(email: string, password: string) {
        localStorage.setItem('credentials', JSON.stringify({ email, password }));
    }

    getSavedLogInCredentials() {
        const credentials = localStorage.getItem('credentials');
        return credentials ? JSON.parse(credentials) : null;
    }

    clearSavedLoginCredentials() {
        localStorage.removeItem('credentials');
    }
}

