'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Save, Building2, CreditCard, Globe, Percent, FileText, Hash, CheckCircle } from 'lucide-react';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';

export default function InvoiceSettingsManager() {
  const { settings, loading, error: hookError, updateSettings } = useInvoiceSettings();
  const [formData, setFormData] = useState({
    companyName: '',
    companyAddress: '',
    companyCity: '',
    companyCountry: 'Lithuania',
    companyCode: '',
    vatNumber: '',
    isVatPayer: false,
    vatRate: 21,
    email: '',
    phone: '',
    website: '',
    bankName: '',
    bankIban: '',
    bankSwift: '',
    invoicePrefix: 'CM',
    nextInvoiceNumber: 1,
    defaultLanguage: 'lt' as 'lt' | 'en',
    defaultDueDays: 14,
    defaultNotes: '',
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Update formData when settings load
  useEffect(() => {
    if (settings) {
      setFormData({
        companyName: settings.companyName || '',
        companyAddress: settings.companyAddress || '',
        companyCity: settings.companyCity || '',
        companyCountry: settings.companyCountry || 'Lithuania',
        companyCode: settings.companyCode || '',
        vatNumber: settings.vatNumber || '',
        isVatPayer: settings.isVatPayer || false,
        vatRate: settings.vatRate || 21,
        email: settings.email || '',
        phone: settings.phone || '',
        website: settings.website || '',
        bankName: settings.bankName || '',
        bankIban: settings.bankIban || '',
        bankSwift: settings.bankSwift || '',
        invoicePrefix: settings.invoicePrefix || 'CM',
        nextInvoiceNumber: settings.nextInvoiceNumber || 1,
        defaultLanguage: settings.defaultLanguage || 'lt',
        defaultDueDays: settings.defaultDueDays || 14,
        defaultNotes: settings.defaultNotes || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      await updateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Nepavyko išsaugoti');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="w-8 h-8 border-2 border-[#ff006e] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Info */}
        <div className="bg-[#141414] rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-[#ff006e]" />
            <h3 className="text-lg font-bold text-white">Įmonės informacija / Company Info</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Pavadinimas / Company Name *
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="CREO MOTION"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Adresas / Address *
              </label>
              <input
                type="text"
                value={formData.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="123 Design Street"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Miestas / City *
              </label>
              <input
                type="text"
                value={formData.companyCity}
                onChange={(e) => handleChange('companyCity', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="Vilnius"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Šalis / Country *
              </label>
              <input
                type="text"
                value={formData.companyCountry}
                onChange={(e) => handleChange('companyCountry', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="Lithuania"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Įmonės kodas / Individualios veiklos Nr.
              </label>
              <input
                type="text"
                value={formData.companyCode}
                onChange={(e) => handleChange('companyCode', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="123456789"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                PVM kodas / VAT Number
              </label>
              <input
                type="text"
                value={formData.vatNumber}
                onChange={(e) => handleChange('vatNumber', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="LT123456789"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                El. paštas / Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="invoice@creomotion.lt"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Tel. / Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="+370 600 00000"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Svetainė / Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="www.creomotion.lt"
              />
            </div>
          </div>
        </div>

        {/* VAT Settings */}
        <div className="bg-[#141414] rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <Percent className="w-5 h-5 text-[#ffbe0b]" />
            <h3 className="text-lg font-bold text-white">PVM nustatymai / VAT Settings</h3>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 bg-[#0a0a0a] rounded border border-white/10">
            <input
              type="checkbox"
              id="isVatPayer"
              checked={formData.isVatPayer}
              onChange={(e) => handleChange('isVatPayer', e.target.checked)}
              className="w-5 h-5 accent-[#ff006e]"
            />
            <label htmlFor="isVatPayer" className="text-white cursor-pointer">
              <span className="font-bold">Esu PVM mokėtojas / I am VAT payer</span>
              <p className="text-sm text-white/60 mt-1">
                Pažymėkite, jei esate registruoti PVM mokėtojai
              </p>
            </label>
          </div>

          {formData.isVatPayer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                  PVM tarifas / VAT Rate (%) *
                </label>
                <input
                  type="number"
                  value={formData.vatRate}
                  onChange={(e) => handleChange('vatRate', parseFloat(e.target.value))}
                  className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                  min="0"
                  max="100"
                  step="0.01"
                  required={formData.isVatPayer}
                />
              </div>
            </div>
          )}
        </div>

        {/* Bank Details */}
        <div className="bg-[#141414] rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard className="w-5 h-5 text-[#3a86ff]" />
            <h3 className="text-lg font-bold text-white">Banko rekvizitai / Bank Details</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Bankas / Bank Name
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleChange('bankName', e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                placeholder="Swedbank"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                IBAN
              </label>
              <input
                type="text"
                value={formData.bankIban}
                onChange={(e) => handleChange('bankIban', e.target.value.toUpperCase())}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none font-mono"
                placeholder="LT12 7300 0000 0000 0000"
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                SWIFT/BIC
              </label>
              <input
                type="text"
                value={formData.bankSwift}
                onChange={(e) => handleChange('bankSwift', e.target.value.toUpperCase())}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none font-mono"
                placeholder="HABALT22"
              />
            </div>
          </div>
        </div>

        {/* Invoice Defaults */}
        <div className="bg-[#141414] rounded-lg p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-6">
            <FileText className="w-5 h-5 text-[#8338ec]" />
            <h3 className="text-lg font-bold text-white">Sąskaitų nustatymai / Invoice Defaults</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                <Hash className="w-3 h-3 inline mr-1" />
                Serijos pradžia / Prefix *
              </label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value.toUpperCase())}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none font-mono"
                placeholder="CM"
                maxLength={5}
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Kitas numeris / Next Number *
              </label>
              <input
                type="number"
                value={formData.nextInvoiceNumber}
                onChange={(e) => handleChange('nextInvoiceNumber', parseInt(e.target.value))}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
                Terminas / Due Days *
              </label>
              <input
                type="number"
                value={formData.defaultDueDays}
                onChange={(e) => handleChange('defaultDueDays', parseInt(e.target.value))}
                className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none"
                min="1"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
              <Globe className="w-3 h-3 inline mr-1" />
              Numatytoji kalba / Default Language
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleChange('defaultLanguage', 'lt')}
                className={`px-6 py-3 rounded font-bold transition-all ${
                  formData.defaultLanguage === 'lt'
                    ? 'bg-[#ff006e] text-[#0a0a0a]'
                    : 'bg-[#0a0a0a] border border-white/10 text-white hover:border-white/30'
                }`}
              >
                🇱🇹 Lietuvių
              </button>
              <button
                type="button"
                onClick={() => handleChange('defaultLanguage', 'en')}
                className={`px-6 py-3 rounded font-bold transition-all ${
                  formData.defaultLanguage === 'en'
                    ? 'bg-[#ff006e] text-[#0a0a0a]'
                    : 'bg-[#0a0a0a] border border-white/10 text-white hover:border-white/30'
                }`}
              >
                🇬🇧 English
              </button>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs text-white/60 uppercase tracking-wider mb-2">
              Numatytos pastabos / Default Notes
            </label>
            <textarea
              value={formData.defaultNotes}
              onChange={(e) => handleChange('defaultNotes', e.target.value)}
              rows={3}
              className="w-full bg-[#0a0a0a] border border-white/10 text-white px-4 py-3 rounded focus:border-[#ff006e] outline-none resize-none"
              placeholder="Ačiū už pasitikėjimą! / Thank you for your trust!"
            />
          </div>

          <div className="mt-6 p-4 bg-[#0a0a0a] rounded border border-[#ff006e]/30">
            <p className="text-sm text-white/60">
              <span className="text-[#ff006e] font-bold">Kitos sąskaitos numeris:</span>{' '}
              <span className="font-mono text-white">{formData.invoicePrefix}-{formData.nextInvoiceNumber.toString().padStart(4, '0')}</span>
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {saveError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            ❌ Klaida: {saveError}
          </div>
        )}
        {saveSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            ✅ Išsaugota sėkmingai!
          </motion.div>
        )}

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={saving}
          whileHover={{ scale: saving ? 1 : 1.02 }}
          whileTap={{ scale: saving ? 1 : 0.98 }}
          className="w-full py-4 bg-[#ff006e] text-[#0a0a0a] rounded-xl font-bold text-lg uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#ff1a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-[#0a0a0a] border-t-transparent rounded-full animate-spin" />
              Saugojama...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Išsaugoti / Save Settings
            </>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}
