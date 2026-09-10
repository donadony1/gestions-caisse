import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, Clock, Building2, Phone, MapPin, DollarSign, Calendar, CreditCard, Sparkles, Loader2 } from 'lucide-react';
import { Facture } from '@/lib/types';
import { api } from '@/lib/api';

interface ViewFactureModalProps {
  isOpen: boolean;
  onClose: () => void;
  facture: Facture | null;
  autoPrint?: boolean;
  onFactureUpdated?: (updated: Facture) => void;
}

// Fonction de génération du code HTML de la facture
export function generateFactureHtml(facture: Facture): string {
  const devise = facture.entreprise_devise || 'FCFA';
  const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR').format(val || 0);

  const dateFacture = facture.date_facture 
    ? new Date(facture.date_facture).toLocaleDateString('fr-FR') 
    : new Date().toLocaleDateString('fr-FR');
  const dateEcheance = facture.date_echeance 
    ? new Date(facture.date_echeance).toLocaleDateString('fr-FR') 
    : '';

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <title>Facture ${facture.numero_facture} - ${facture.client_nom}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }
        body {
          background: #ffffff;
          color: #1e293b;
          font-size: 13px;
          line-height: 1.5;
          padding: 10px;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding-bottom: 20px;
          border-bottom: 2px solid #e2e8f0;
          margin-bottom: 24px;
        }
        .company-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }
        .company-logo {
          width: 56px;
          height: 56px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          padding: 2px;
        }
        .company-placeholder {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          background: #059669;
          color: #ffffff;
          font-size: 24px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .company-name {
          font-size: 18px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .company-sub {
          font-size: 11px;
          color: #64748b;
          line-height: 1.4;
        }
        .invoice-title-block {
          text-align: right;
        }
        .invoice-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: #f1f5f9;
          color: #334155;
          padding: 4px 10px;
          border-radius: 6px;
          margin-bottom: 6px;
        }
        .invoice-num {
          font-size: 22px;
          font-weight: 900;
          color: #0f172a;
          font-family: monospace;
          margin-bottom: 8px;
        }
        .status-stamp {
          display: inline-block;
          font-size: 11px;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 9999px;
        }
        .status-paye {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }
        .status-attente {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
        }
        .details-grid {
          display: flex;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }
        .details-col {
          width: 48%;
        }
        .details-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        .client-name {
          font-size: 15px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 4px;
        }
        .client-meta {
          font-size: 12px;
          color: #475569;
          margin-bottom: 2px;
        }
        .invoice-meta-row {
          font-size: 12px;
          color: #475569;
          margin-bottom: 4px;
          display: flex;
          justify-content: space-between;
        }
        .invoice-meta-row strong {
          color: #0f172a;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
        }
        .items-table th {
          background: #f1f5f9;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 12px 16px;
          border-bottom: 1px solid #e2e8f0;
          text-align: left;
        }
        .items-table th.text-right {
          text-align: right;
        }
        .items-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
        }
        .items-table td.text-right {
          text-align: right;
          font-family: monospace;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
        }
        .service-desc {
          font-size: 13px;
          font-weight: 600;
          color: #1e293b;
          white-space: pre-line;
          line-height: 1.6;
        }
        .total-row {
          background: #f8fafc;
          border-top: 2px solid #cbd5e1;
        }
        .total-label {
          text-align: right;
          padding: 14px 16px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
          color: #475569;
        }
        .total-amount {
          text-align: right;
          padding: 14px 16px;
          font-size: 18px;
          font-weight: 900;
          color: #059669;
          font-family: monospace;
        }
        .notes-block {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 12px 16px;
          margin-bottom: 24px;
          font-size: 12px;
          color: #475569;
        }
        .notes-block strong {
          color: #0f172a;
          display: block;
          margin-bottom: 4px;
        }
        .footer {
          margin-top: 36px;
          padding-top: 14px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
          color: #94a3b8;
          font-size: 11px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-info">
          ${facture.entreprise_logo 
            ? `<img src="${facture.entreprise_logo}" alt="Logo" class="company-logo" />` 
            : `<div class="company-placeholder">${(facture.entreprise_nom || 'E')[0]}</div>`
          }
          <div>
            <div class="company-name">${facture.entreprise_nom || 'Notre Entreprise'}</div>
            <div class="company-sub">
              ${facture.entreprise_telephone ? `📞 ${facture.entreprise_telephone}<br>` : ''}
              ${facture.entreprise_localisation ? `📍 ${facture.entreprise_localisation}` : ''}
            </div>
          </div>
        </div>

        <div class="invoice-title-block">
          <div class="invoice-badge">FACTURE OFFICIELLE</div>
          <div class="invoice-num">${facture.numero_facture}</div>
          <div>
            ${facture.statut === 'paye' 
              ? `<span class="status-stamp status-paye">✔ FACTURE PAYÉE</span>` 
              : `<span class="status-stamp status-attente">⏳ EN ATTENTE DE RÈGLEMENT</span>`
            }
          </div>
        </div>
      </div>

      <div class="details-grid">
        <div class="details-col">
          <div class="details-label">Facturé à (Client)</div>
          <div class="client-name">${facture.client_nom || 'Client'}</div>
          ${facture.client_telephone ? `<div class="client-meta">📞 ${facture.client_telephone}</div>` : ''}
          ${facture.client_localisation ? `<div class="client-meta">📍 ${facture.client_localisation}</div>` : ''}
        </div>

        <div class="details-col" style="text-align: right;">
          <div class="details-label">Détails de facturation</div>
          <div class="invoice-meta-row"><span>Date d'émission :</span> <strong>${dateFacture}</strong></div>
          ${dateEcheance ? `<div class="invoice-meta-row"><span>Date d'échéance :</span> <strong>${dateEcheance}</strong></div>` : ''}
          <div class="invoice-meta-row"><span>Mode de règlement :</span> <strong>${(facture.mode_paiement || 'especes').replace('_', ' ').toUpperCase()}</strong></div>
        </div>
      </div>

      <table class="items-table">
        <thead>
          <tr>
            <th>Désignation / Service Rendu</th>
            <th class="text-right" style="width: 160px;">Montant (${devise})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="service-desc">${facture.service_rendu || 'Prestation de service'}</div>
            </td>
            <td class="text-right">
              ${formatMoney(facture.montant || 0)}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td class="total-label">TOTAL TTC À PAYER</td>
            <td class="total-amount">${formatMoney(facture.montant || 0)} ${devise}</td>
          </tr>
        </tfoot>
      </table>

      ${facture.notes ? `
        <div class="notes-block">
          <strong>Notes & Conditions :</strong>
          <div>${facture.notes}</div>
        </div>
      ` : ''}

      <div class="footer">
        <p>Merci pour votre confiance !</p>
        <p style="font-size: 10px; margin-top: 4px;">Facture générée automatiquement via le système de gestion de caisse.</p>
      </div>
    </body>
    </html>
  `;
}

// Téléchargement direct du fichier facture officiel (.html auto-imprimable / conservable)
export function downloadSingleFacture(facture: Facture) {
  const html = generateFactureHtml(facture);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeClient = (facture.client_nom || 'Client').replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `Facture_${facture.numero_facture}_${safeClient}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Fonction d'impression 100% isolée pour garantir l'impression d'UNE SEULE facture client
export function printSingleFacture(facture: Facture) {
  const existingFrame = document.getElementById('print-facture-iframe');
  if (existingFrame) existingFrame.remove();

  const iframe = document.createElement('iframe');
  iframe.id = 'print-facture-iframe';
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const html = generateFactureHtml(facture);
  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();

    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        window.print();
      }
    }, 300);
  }
}

export const ViewFactureModal: React.FC<ViewFactureModalProps> = ({
  isOpen,
  onClose,
  facture,
  autoPrint = false,
  onFactureUpdated,
}) => {
  const [loadingPay, setLoadingPay] = useState(false);
  const [currentFacture, setCurrentFacture] = useState<Facture | null>(facture);

  React.useEffect(() => {
    setCurrentFacture(facture);
    if (isOpen && autoPrint && facture) {
      const timer = setTimeout(() => {
        printSingleFacture(facture);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [facture, isOpen, autoPrint]);

  if (!isOpen || !currentFacture) return null;

  const handlePrint = () => {
    if (currentFacture) {
      printSingleFacture(currentFacture);
    } else {
      window.print();
    }
  };

  const handleDownload = () => {
    if (currentFacture) {
      downloadSingleFacture(currentFacture);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!confirm(`Confirmer le règlement de la facture ${currentFacture.numero_facture} ? Le montant sera automatiquement ajouté aux entrées de caisse.`)) {
      return;
    }

    setLoadingPay(true);
    try {
      const updated = await api.markFactureAsPaid(currentFacture.id);
      setCurrentFacture(updated);
      if (onFactureUpdated) {
        onFactureUpdated(updated);
      }
    } catch (err: any) {
      alert(err.message || "Erreur lors de la validation du paiement.");
    } finally {
      setLoadingPay(false);
    }
  };

  const devise = currentFacture.entreprise_devise || 'FCFA';
  const formatMoney = (val: number) => new Intl.NumberFormat('fr-FR').format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible print:h-auto print:block">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl border border-slate-100 overflow-hidden transform transition-all my-auto max-h-[92vh] flex flex-col print:shadow-none print:border-none print:max-h-none print:w-full print:rounded-none print:block">
        
        {/* Barre d'action supérieure (non imprimée) */}
        <div className="print:hidden bg-slate-900 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Facture Client</span>
            <span className="text-sm font-black text-white">{currentFacture.numero_facture}</span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {currentFacture.statut === 'en_attente' && (
              <button
                type="button"
                onClick={handleMarkAsPaid}
                disabled={loadingPay}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-emerald-600/30 disabled:opacity-50 cursor-pointer"
              >
                {loadingPay ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                <span>Marquer comme payée</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center space-x-1.5 border border-slate-700 shadow-sm cursor-pointer"
              title="Lancer l'impression"
            >
              <Printer className="w-3.5 h-3.5 text-indigo-400" />
              <span>Imprimer</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 cursor-pointer active:scale-95"
              title="Télécharger la facture sur votre appareil"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Téléchargement de la facture</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white ml-1 cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corps de la Facture (Imprimable) */}
        <div id="printable-invoice" className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-slate-800 space-y-8 print:p-4 print:overflow-visible print:text-black">
          
          {/* En-tête : Entreprise vs Titre Facture */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pb-6 border-b-2 border-slate-100">
            {/* Infos Entreprise */}
            <div className="space-y-2 max-w-xs">
              <div className="flex items-center space-x-3">
                {currentFacture.entreprise_logo ? (
                  <img
                    src={currentFacture.entreprise_logo}
                    alt={currentFacture.entreprise_nom || 'Logo'}
                    className="w-12 h-12 object-contain rounded-xl border border-slate-200 p-1"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-sm">
                    {currentFacture.entreprise_nom ? currentFacture.entreprise_nom[0] : 'E'}
                  </div>
                )}
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                    {currentFacture.entreprise_nom || "Notre Entreprise"}
                  </h2>
                  <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                    Gestion de Caisse
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500 space-y-1 pt-1">
                {currentFacture.entreprise_telephone && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{currentFacture.entreprise_telephone}</span>
                  </div>
                )}
                {currentFacture.entreprise_localisation && (
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{currentFacture.entreprise_localisation}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Titre & Statut */}
            <div className="text-left sm:text-right space-y-2">
              <span className="inline-block text-xs font-black tracking-widest uppercase px-3 py-1 bg-slate-100 text-slate-700 rounded-lg">
                FACTURE OFFICIELLE
              </span>
              <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                {currentFacture.numero_facture}
              </h1>

              {/* Tampon de Statut */}
              <div>
                {currentFacture.statut === 'paye' ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>FACTURE PAYÉE</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>EN ATTENTE DE RÈGLEMENT</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Grille Informations : Client & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
            {/* Facturé à */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Facturé à (Client)
              </span>
              <p className="text-sm font-bold text-slate-900">{currentFacture.client_nom || 'Client'}</p>
              {currentFacture.client_telephone && (
                <p className="text-xs text-slate-600 mt-1 flex items-center space-x-1">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{currentFacture.client_telephone}</span>
                </p>
              )}
              {currentFacture.client_localisation && (
                <p className="text-xs text-slate-600 mt-1 flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>{currentFacture.client_localisation}</span>
                </p>
              )}
            </div>

            {/* Dates & Mode de règlement */}
            <div className="space-y-1.5 sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Détails de facturation
              </span>
              <p className="text-xs text-slate-600">
                <span className="text-slate-400">Date d'émission :</span>{' '}
                <strong className="text-slate-800">
                  {currentFacture.date_facture ? new Date(currentFacture.date_facture).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}
                </strong>
              </p>
              {currentFacture.date_echeance && (
                <p className="text-xs text-slate-600">
                  <span className="text-slate-400">Date d'échéance :</span>{' '}
                  <strong className="text-slate-800">{new Date(currentFacture.date_echeance).toLocaleDateString('fr-FR')}</strong>
                </p>
              )}
              <p className="text-xs text-slate-600">
                <span className="text-slate-400">Règlement :</span>{' '}
                <span className="capitalize font-semibold text-slate-800">{(currentFacture.mode_paiement || 'especes').replace('_', ' ')}</span>
              </p>
            </div>
          </div>

          {/* Tableau des prestations */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Désignation / Service Rendu</th>
                  <th className="p-3.5 text-right w-36">Montant ({devise})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                <tr>
                  <td className="p-4 align-top">
                    <p className="text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">
                      {currentFacture.service_rendu || 'Prestation de service'}
                    </p>
                  </td>
                  <td className="p-4 text-right align-top font-bold text-sm text-slate-900 font-mono">
                    {formatMoney(currentFacture.montant || 0)}
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200">
                <tr>
                  <td className="p-4 text-right text-xs uppercase tracking-wider text-slate-600">
                    Total TTC à payer
                  </td>
                  <td className="p-4 text-right text-lg text-emerald-700 font-mono font-black">
                    {formatMoney(currentFacture.montant || 0)} {devise}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes et mentions légales */}
          {currentFacture.notes && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <strong className="block text-slate-700 mb-1">Notes :</strong>
              <p className="whitespace-pre-line">{currentFacture.notes}</p>
            </div>
          )}

          {/* Pied de page */}
          <div className="pt-6 border-t border-slate-200 text-center text-xs text-slate-400 space-y-1">
            <p>Merci pour votre confiance !</p>
            <p className="text-[10px]">Facture générée automatiquement via le logiciel de gestion de trésorerie.</p>
          </div>

        </div>

      </div>
    </div>
  );
};
