/**
 * Types TypeScript pour la gestion de caisse
 */

export type UserRole = 'superadmin' | 'admin' | 'controleur' | 'caissier';

export interface Entreprise {
  id: number;
  nom: string;
  slug: string;
  devise: string;
  plan: 'gratuit' | 'pro' | 'enterprise';
  telephone?: string | null;
  localisation?: string | null;
  logo_url?: string | null;
  actif?: number | boolean;
}

export interface EntrepriseItem extends Entreprise {
  created_at: string;
  nb_users: number;
  nb_mouvements: number;
  volume_mouvements: number;
  admin_email?: string | null;
}

export interface SaaSPlanStat {
  plan: 'gratuit' | 'pro' | 'enterprise';
  count: number;
}

export interface SaaSAuditLog {
  id: number;
  user_id: number;
  entreprise_id?: number | null;
  action: string;
  details?: string | null;
  ip_address?: string | null;
  created_at: string;
  user_nom?: string | null;
  user_email?: string | null;
  entreprise_nom?: string | null;
}

export interface SuperAdminData {
  stats: {
    total_entreprises: number;
    total_users: number;
    total_mouvements: number;
    volume_total: number;
    plans: SaaSPlanStat[];
  };
  entreprises: EntrepriseItem[];
  recent_logs: SaaSAuditLog[];
}

export interface User {
  id: number;
  entreprise_id?: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  actif?: number | boolean;
  entreprise?: Entreprise;
}

export interface RegisterData {
  nom_entreprise: string;
  devise?: string;
  telephone?: string;
  nom: string;
  prenom: string;
  email: string;
  password: string;
}

export type MovementType = 'entree' | 'sortie';
export type MovementStatus = 'valide' | 'en_attente' | 'rejete';
export type PaymentMethod = 'especes' | 'virement' | 'cheque' | 'mobile_money';

export interface Category {
  id: number;
  nom: string;
  type?: MovementType;
  description?: string;
  icone?: string;
  couleur?: string;
}

export interface Movement {
  id: number;
  reference: string;
  type: MovementType;
  montant: number;
  motif: string;
  beneficiaire?: string | null;
  payeur?: string | null;
  categorie_id?: number | null;
  categorie_nom?: string | null;
  categorie_couleur?: string | null;
  categorie_icone?: string | null;
  statut: MovementStatus;
  justificatif_url?: string | null;
  justificatif_nom?: string | null;
  mode_paiement: PaymentMethod;
  date_mouvement: string;
  created_at: string;
  validated_at?: string | null;
  motif_rejet?: string | null;
  createur_nom?: string | null;
  createur_prenom?: string | null;
  createur_email?: string | null;
  validateur_nom?: string | null;
  validateur_prenom?: string | null;
  validateur_email?: string | null;
}

export interface Financials {
  solde_net: number;
  total_entrees: number;
  total_sorties: number;
  entrees_mois: number;
  sorties_mois: number;
  flux_net_mois: number;
  taux_couverture: number;
}

export interface WeeklyFlow {
  label: string; // 'S-3', 'S-2', 'S-1', 'Actuelle'
  entrees: number;
  sorties: number;
  net: number;
}

export interface DashboardData {
  financials: Financials;
  pending: {
    count: number;
    amount: number;
  };
  weekly_flows: WeeklyFlow[];
  weekly_flow?: WeeklyFlow[];
  recent_movements: Movement[];
  category_distribution: Array<{
    nom: string;
    type: MovementType;
    couleur: string;
    total: number;
    nb_mouvements: number;
  }>;
}

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errors?: any;
  timestamp?: string;
}

export interface ReportSummary {
  debut: string;
  fin: string;
  solde_initial: number;
  total_entrees: number;
  total_sorties: number;
  flux_net: number;
  solde_cloture: number;
}

export interface ReportRow {
  id: number;
  date: string;
  reference: string;
  type: MovementType;
  libelle: string;
  tiers: string;
  categorie: string;
  mode_paiement: string;
  debit: number;
  credit: number;
  solde_progressif: number;
  agent: string;
}

export interface ReportData {
  periode: ReportSummary;
  lignes: ReportRow[];
  count: number;
}

// --- Module Facturation (Invoicing) ---
export type FactureStatus = 'paye' | 'en_attente' | 'annule';

export interface Facture {
  id: number;
  entreprise_id: number;
  numero_facture: string;
  client_nom: string;
  client_telephone?: string | null;
  client_localisation?: string | null;
  service_rendu: string;
  montant: number;
  statut: FactureStatus;
  date_facture: string;
  date_echeance?: string | null;
  mode_paiement: PaymentMethod;
  mouvement_id?: number | null;
  mouvement_reference?: string | null;
  created_by: number;
  createur_nom?: string | null;
  createur_prenom?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
  entreprise_nom?: string | null;
  entreprise_devise?: string | null;
  entreprise_telephone?: string | null;
  entreprise_localisation?: string | null;
  entreprise_logo?: string | null;
}

export interface FactureQuota {
  plan: 'gratuit' | 'pro' | 'enterprise';
  total_factures: number;
  max_factures: number | null;
  is_limit_reached: boolean;
  remaining: number | null;
}

export interface FacturesResponse {
  items: Facture[];
  summary: {
    total_facture: number;
    total_paye: number;
    total_en_attente: number;
    count: number;
    total_count: number;
  };
  quota: FactureQuota;
}

