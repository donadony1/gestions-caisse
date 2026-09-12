/**
 * Client API HTTP avec gestion automatique des tokens JWT & requêtes backend (Compatible Vite & React)
 */

import { ApiResponse, DashboardData, Movement, Category, ReportData, User, RegisterData, SuperAdminData, Entreprise, Facture, FacturesResponse, SubscriptionInfo, AbonnementItem, SubscriptionPlan } from './types';

function getApiBaseUrl(): string {
  const envUrl = 
    (typeof import.meta !== 'undefined' && (
      (import.meta as any).env?.GES_API_URL ||
      (import.meta as any).env?.GES_API_BASE_URL ||
      (import.meta as any).env?.API_URL ||
      (import.meta as any).env?.VITE_API_BASE_URL ||
      (import.meta as any).env?.VITE_API_URL
    ));

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/+$/, '');
  }

  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://gestion-caise.hondap.com/api';
  }

  return 'http://localhost/personnel/gestions-caisse1/backend/api';
}

const API_BASE_URL = getApiBaseUrl();

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
    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${cleanEndpoint}`;

    try {
      const response = await fetch(url, {
        mode: 'cors',
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({
        status: 'error',
        message: `Erreur de réponse du serveur (${response.status} ${response.statusText})`,
      }));

      if (!response.ok) {
        if (response.status === 401 && typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          this.clearToken();
          window.location.href = '/login';
        }
        throw new Error(data.message || `Erreur requête (${response.status})`);
      }

      return data;
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(`Impossible de contacter l'API (${url}). Veuillez vérifier votre connexion ou recharger la page (Ctrl+F5).`);
      }
      throw new Error(err.message || "Impossible de contacter l'API backend.");
    }
  }

  // --- Authentification ---
  async register(data: RegisterData): Promise<{ requires_verification?: boolean; email: string; token?: string; user?: User; code_preview?: string }> {
    const res = await this.request<any>('/auth/register.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
      this.setSavedUser(res.data.user);
    }

    return res.data!;
  }

  async verifyEmail(email: string, code?: string, token?: string): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/verify_email.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, token }),
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
      this.setSavedUser(res.data.user);
    }

    return res.data!;
  }

  async resendVerification(email: string): Promise<any> {
    const res = await this.request('/auth/resend_verification.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.data;
  }

  async forgotPassword(email: string): Promise<any> {
    const res = await this.request('/auth/forgot_password.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.data;
  }

  async resetPassword(email: string, password: string, code?: string, token?: string): Promise<any> {
    const res = await this.request('/auth/reset_password.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, code, token }),
    });
    return res.data;
  }

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

  async switchEntreprise(entrepriseId: number): Promise<{ token: string; user: User }> {
    const res = await this.request<{ token: string; user: User }>('/auth/switch_entreprise.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entreprise_id: entrepriseId }),
    });

    if (res.data?.token) {
      this.setToken(res.data.token);
      this.setSavedUser(res.data.user);
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

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/entrees.php`, {
      method: 'POST',
      mode: 'cors',
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

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/sorties.php`, {
      method: 'POST',
      mode: 'cors',
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

    const baseUrl = getApiBaseUrl();
    return `${baseUrl}/rapports.php?${query.toString()}`;
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

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/users.php`, {
      method: 'POST',
      mode: 'cors',
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

  // --- Gestion de l'Entreprise (Admin & Contrôleur) ---
  async getEntreprise(): Promise<Entreprise> {
    const res = await this.request<Entreprise>('/entreprise.php');
    return res.data!;
  }

  async updateEntreprise(formData: FormData): Promise<Entreprise> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/entreprise.php`, {
      method: 'POST',
      mode: 'cors',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({
      status: 'error',
      message: "Erreur lors de la mise à jour des informations de l'entreprise"
    }));

    if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour de l'entreprise");
    
    // Mettre à jour l'utilisateur local si les infos entreprise ont changé
    const currentUser = this.getSavedUser();
    if (currentUser && data.data) {
      currentUser.entreprise = {
        ...currentUser.entreprise,
        ...data.data,
      };
      this.setSavedUser(currentUser);
    }

    return data.data;
  }

  // --- Gestion du Profil Utilisateur (Tout utilisateur) ---
  async updateProfile(formData: FormData): Promise<{ user: User; token?: string }> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      Accept: 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const baseUrl = getApiBaseUrl();
    const res = await fetch(`${baseUrl}/profile.php`, {
      method: 'POST',
      mode: 'cors',
      headers,
      body: formData,
    });

    const data = await res.json().catch(() => ({
      status: 'error',
      message: "Erreur lors de la mise à jour du profil"
    }));

    if (!res.ok) throw new Error(data.message || "Erreur lors de la mise à jour du profil");

    if (data.data?.user) {
      this.setSavedUser(data.data.user);
    }
    if (data.data?.token) {
      this.setToken(data.data.token);
    }

    return data.data;
  }

  // --- Module Facturation (Factures Clients) ---
  async getFactures(params?: { search?: string; statut?: string; date_debut?: string; date_fin?: string; limit?: number; offset?: number }): Promise<FacturesResponse> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.statut) query.append('statut', params.statut);
    if (params?.date_debut) query.append('date_debut', params.date_debut);
    if (params?.date_fin) query.append('date_fin', params.date_fin);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());

    const res = await this.request<FacturesResponse>(`/factures.php?${query.toString()}`);
    return res.data!;
  }

  async getFacture(id: number): Promise<Facture> {
    const res = await this.request<Facture>(`/factures.php?id=${id}`);
    return res.data!;
  }

  async createFacture(data: {
    client_nom: string;
    client_telephone?: string;
    client_localisation?: string;
    service_rendu: string;
    montant: number;
    montant_recu?: number;
    statut?: 'paye' | 'en_attente';
    date_facture?: string;
    date_echeance?: string;
    mode_paiement?: string;
    notes?: string;
  }): Promise<Facture> {
    const res = await this.request<Facture>('/factures.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.data!;
  }

  async markFactureAsPaid(id: number, mode_paiement?: string): Promise<Facture> {
    const res = await this.request<Facture>('/factures.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid', id, mode_paiement }),
    });
    return res.data!;
  }

  // --- Espace Super-Admin (Gestion Globale SaaS) ---
  async getSuperAdminData(): Promise<SuperAdminData> {
    const res = await this.request<SuperAdminData>('/superadmin.php');
    return res.data!;
  }

  async updateEntreprisePlan(entrepriseId: number, plan: 'gratuit' | 'pro' | 'enterprise'): Promise<any> {
    const res = await this.request('/superadmin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_plan', entreprise_id: entrepriseId, plan }),
    });
    return res.data;
  }

  async toggleEntrepriseStatus(entrepriseId: number): Promise<any> {
    const res = await this.request('/superadmin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle_status', entreprise_id: entrepriseId }),
    });
    return res.data;
  }

  // --- Module Abonnements SaaS & Facturation ---
  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const res = await this.request<SubscriptionInfo>('/abonnement.php');
    return res.data!;
  }

  async requestSubscription(data: {
    plan: 'gratuit' | 'pro' | 'enterprise';
    duree_mois: number;
    mode_paiement: string;
    reference_paiement?: string;
  }): Promise<any> {
    const res = await this.request('/abonnement.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request', ...data }),
    });
    return res.data;
  }

  async getAllAbonnements(statut?: string): Promise<{ abonnements: AbonnementItem[]; pending_count: number; total_revenue: number }> {
    const query = statut ? `?all=1&statut=${encodeURIComponent(statut)}` : '?all=1';
    const res = await this.request<{ abonnements: AbonnementItem[]; pending_count: number; total_revenue: number }>(`/abonnement.php${query}`);
    return res.data!;
  }

  async validateSubscription(data: {
    abonnement_id: number;
    approved: boolean;
    motif_rejet?: string;
  }): Promise<any> {
    const res = await this.request('/superadmin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate_subscription', ...data }),
    });
    return res.data;
  }
}

export const api = new ApiClient();


