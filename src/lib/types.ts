/**
 * Types TypeScript pour la gestion de caisse
 */

export type UserRole = 'admin' | 'controleur' | 'caissier';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  avatar_url?: string | null;
  actif?: number | boolean;
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
  validateur_nom?: string | null;
  validateur_prenom?: string | null;
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
