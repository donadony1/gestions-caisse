/**
 * Client API HTTP avec gestion automatique des tokens JWT & requêtes backend (Compatible Vite & React)
 */

import { ApiResponse, DashboardData, Movement, Category, ReportData, User } from './types';

// Récupération de l'URL du backend depuis le fichier .env (Vite: VITE_API_BASE_URL)
const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) ||
  'http://localhost/personnel/gestions-caisse1/backend/api';

class ApiClient {
  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('caisse_token');
  }

  public setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('caisse_token', token);
    }
  }

  public clearToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('caisse_token');
      localStorage.removeItem('caisse_user');
    }
  }

  public getSavedUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('caisse_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  public setSavedUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('caisse_user', JSON.stringify(user));
    }
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${API_BASE_URL}${cleanEndpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({
        status: 'error',
        message: `Erreur de réponse du serveur (${response.status} ${response.statusText})`,
      }));

      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          this.clearToken();
          window.location.href = '/login';
        }
        throw new Error(data.message || `Erreur requête (${response.status})`);
      }

      return data;
    } catch (err: any) {
      throw new Error(err.message || "Impossible de contacter l'API backend.");
    }
  }

  // --- Authentification ---
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/login.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
      this.setSavedUser(res.data.user);
    }

    return res.data!;
  }

  async getMe(): Promise<User> {
    const res = await this.request<User>('/auth/me.php');
    if (res.data) {
      this.setSavedUser(res.data);
    }
    return res.data!;
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout.php', { method: 'POST' });
    } catch {
      // Ignorer
    } finally {
      this.clearToken();
    }
  }

  // --- Tableau de bord ---
  async getDashboard(): Promise<DashboardData> {
    const res = await this.request<DashboardData>('/dashboard.php');
    return res.data!;
  }

  // --- Entrées ---
  async getEntrees(params?: { search?: string; categorie_id?: number; date_debut?: string; date_fin?: string; page?: number }): Promise<{ items: Movement[]; categories: Category[]; summary: any }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.categorie_id) query.append('categorie_id', params.categorie_id.toString());
    if (params?.date_debut) query.append('date_debut', params.date_debut);
    if (params?.date_fin) query.append('date_fin', params.date_fin);
    if (params?.page) query.append('page', params.page.toString());

    const res = await this.request<{ items: Movement[]; categories: Category[]; summary: any }>(`/entrees.php?${query.toString()}`);
    return res.data!;
  }

  async createEntree(formData: FormData): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/entrees.php`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({
      status: 'error',
      message: "Erreur serveur lors de l'envoi du formulaire"
    }));

    if (!res.ok) throw new Error(data.message || "Erreur lors de l'enregistrement de l'encaissement");
    return data;
  }

  // --- Sorties ---
  async getSorties(params?: { search?: string; statut?: string; categorie_id?: number; date_debut?: string; date_fin?: string; page?: number }): Promise<{ items: Movement[]; categories: Category[]; summary: any }> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.statut) query.append('statut', params.statut);
    if (params?.categorie_id) query.append('categorie_id', params.categorie_id.toString());
    if (params?.date_debut) query.append('date_debut', params.date_debut);
    if (params?.date_fin) query.append('date_fin', params.date_fin);
    if (params?.page) query.append('page', params.page.toString());

    const res = await this.request<{ items: Movement[]; categories: Category[]; summary: any }>(`/sorties.php?${query.toString()}`);
    return res.data!;
  }

  async createSortie(formData: FormData): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/sorties.php`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({
      status: 'error',
      message: "Erreur serveur lors de l'envoi du formulaire"
    }));

    if (!res.ok) throw new Error(data.message || "Erreur lors de l'enregistrement de la dépense");
    return data;
  }

  // --- Validations ---
  async getValidations(filter: 'pending' | 'history' = 'pending'): Promise<{ pending?: Movement[]; history?: Movement[]; count: number }> {
    const res = await this.request<{ pending?: Movement[]; history?: Movement[]; count: number }>(`/validations.php?filter=${filter}`);
    return res.data!;
  }

  async processValidation(id: number, action: 'approuver' | 'rejeter', motif_rejet?: string): Promise<any> {
    const res = await this.request('/validations.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, motif_rejet }),
    });
    return res.data!;
  }

  // --- Rapports ---
  async getRapport(params?: { date_debut?: string; date_fin?: string; type?: string }): Promise<ReportData> {
    const query = new URLSearchParams();
    if (params?.date_debut) query.append('date_debut', params.date_debut);
    if (params?.date_fin) query.append('date_fin', params.date_fin);
    if (params?.type) query.append('type', params.type);

    const res = await this.request<ReportData>(`/rapports.php?${query.toString()}`);
    return res.data!;
  }

  getExportCsvUrl(params?: { date_debut?: string; date_fin?: string; type?: string }): string {
    const query = new URLSearchParams();
    query.append('format', 'csv');
    if (params?.date_debut) query.append('date_debut', params.date_debut);
    if (params?.date_fin) query.append('date_fin', params.date_fin);
    if (params?.type) query.append('type', params.type);
    
    const token = this.getToken();
    if (token) query.append('token', token);

    return `${API_BASE_URL}/rapports.php?${query.toString()}`;
  }

  // --- Membres / Utilisateurs ---
  async getUsers(): Promise<User[]> {
    const res = await this.request<User[]>('/users.php');
    return res.data || [];
  }

  async createUser(formData: FormData): Promise<any> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/users.php`, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({
      status: 'error',
      message: "Erreur serveur lors de la création du membre"
    }));

    if (!res.ok) throw new Error(data.message || "Erreur lors de la création du membre");
    return data;
  }

  async toggleUserStatus(id: number, actif: boolean): Promise<any> {
    const res = await this.request('/users.php', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, actif }),
    });
    return res.data;
  }
}

export const api = new ApiClient();

