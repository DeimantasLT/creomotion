import { useState, useEffect, useCallback } from 'react';

export interface InvoiceSettings {
  id: string;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyCode?: string; // Individualios veiklos numeris / Įmonės kodas
  vatNumber?: string; // PVM kodas
  isVatPayer: boolean; // Ar PVM mokėtojas
  vatRate: number; // PVM tarifas %
  email: string;
  phone?: string;
  website?: string;
  bankName?: string;
  bankAccount?: string;
  bankIban?: string;
  bankSwift?: string;
  invoicePrefix: string; // Serijos pradžia (pvz: CM)
  nextInvoiceNumber: number; // Kitas numeris
  defaultLanguage: 'lt' | 'en'; // Numatytoji kalba
  defaultDueDays: number; // Mokėjimo terminas dienomis
  defaultNotes?: string; // Numatytos pastabos
}

export function useInvoiceSettings() {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/invoices/settings');
      if (!response.ok) throw new Error('Failed to fetch settings');
      const data = await response.json();
      setSettings(data.settings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (data: Partial<InvoiceSettings>) => {
    try {
      const response = await fetch('/api/invoices/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update settings');
      const result = await response.json();
      setSettings(result.settings);
      return result.settings;
    } catch (err) {
      throw err;
    }
  }, []);

  // Generate next invoice number
  const generateInvoiceNumber = useCallback(() => {
    if (!settings) return null;
    const nextNum = settings.nextInvoiceNumber.toString().padStart(4, '0');
    return `${settings.invoicePrefix}-${nextNum}`;
  }, [settings]);

  // Increment invoice number after creating one
  const incrementInvoiceNumber = useCallback(async () => {
    if (!settings) return;
    const newNumber = settings.nextInvoiceNumber + 1;
    await updateSettings({ nextInvoiceNumber: newNumber });
  }, [settings, updateSettings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    generateInvoiceNumber,
    incrementInvoiceNumber,
  };
}

// Translations for invoice
export const invoiceTranslations = {
  lt: {
    invoice: 'SĄSKAITA FAKTŪRA',
    invoiceNumber: 'Serija ir Nr.',
    date: 'Data',
    dueDate: 'Mokėti iki',
    from: 'Pardavėjas',
    to: 'Pirkėjas',
    description: 'Prekės/Paslaugos pavadinimas',
    quantity: 'Kiekis',
    unitPrice: 'Kaina',
    amount: 'Suma',
    subtotal: 'Suma be PVM',
    vat: 'PVM',
    total: 'Viso sumokėti',
    paymentDetails: 'Mokėjimo informacija',
    bank: 'Bankas',
    iban: 'IBAN',
    swift: 'SWIFT/BIC',
    reference: 'Mokėjimo paskirtis',
    notes: 'Pastabos',
    thankYou: 'Ačiū už kvitai',
    companyCode: 'Įm. kodas / Individualios veiklos Nr.',
    vatCode: 'PVM kodas',
    issueDate: 'Išrašymo data',
  },
  en: {
    invoice: 'INVOICE',
    invoiceNumber: 'Invoice #',
    date: 'Date',
    dueDate: 'Due Date',
    from: 'From',
    to: 'Bill To',
    description: 'Description',
    quantity: 'Qty',
    unitPrice: 'Rate',
    amount: 'Amount',
    subtotal: 'Subtotal',
    vat: 'VAT',
    total: 'Total',
    paymentDetails: 'Payment Details',
    bank: 'Bank',
    iban: 'IBAN',
    swift: 'SWIFT/BIC',
    reference: 'Payment Reference',
    notes: 'Notes',
    thankYou: 'Thank you for your business',
    companyCode: 'Company Code / Business ID',
    vatCode: 'VAT Number',
    issueDate: 'Issue Date',
  },
};
