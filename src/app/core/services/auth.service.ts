import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/auth-response-model';
import { LoginModel } from '../models/login-model';
import { AuthUser } from '../models/user-model';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}

const STORAGE_KEY = 'guardian_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private readonly _user = signal<AuthUser | null>(this.restoreUser());
  readonly user = this._user.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  login(credentials: LoginModel): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem(STORAGE_KEY, response.accessToken);
        this._user.set(this.decodeUser(response.accessToken));
      }),
    );
    
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
  }

  getToken(): string | null {
    const token = localStorage.getItem(STORAGE_KEY);
    return token && !this.isExpired(token) ? token : null;
  }

  private restoreUser(): AuthUser | null {
    const token = localStorage.getItem(STORAGE_KEY);
    if (!token || this.isExpired(token)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return this.decodeUser(token);
  }

  private decodeUser(token: string): AuthUser | null {
    const payload = this.decodePayload(token);
    return payload ? { id: payload.sub, email: payload.email, role: payload.role } : null;
  }

  private decodePayload(token: string): JwtPayload | null {
    try {
      const [, payload] = token.split('.');
      return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    } catch {
      return null;
    }
  }

  private isExpired(token: string): boolean {
    const payload = this.decodePayload(token);
    return !payload || payload.exp * 1000 <= Date.now();
  }
}
