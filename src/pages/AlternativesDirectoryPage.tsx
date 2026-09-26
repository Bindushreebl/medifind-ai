import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle,
  ArrowRight,
  FileCheck,
  Building2,
  AlertTriangle
} from 'lucide-react';
import { api } from '../services/api';
import { Alternative, Medicine } from '../types';

export const AlternativesDirectoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [alternatives, setAlternatives] = useState<(Alternative & { medicine: Medicine; alternative_medicine: Medicine })[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await api.admin.getAlternatives();
        // Only show verified ones on the public directory
        setAlternatives(list.filter(a => a.verification_status === 'verified'));
      } catch (err) {
        console.error('Failed to load alternatives:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = alternatives.filter(a => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      a.medicine?.name.toLowerCase().includes(q) ||
      a.medicine?.generic_name.toLowerCase().includes(q) ||
      a.alternative_medicine?.name.toLowerCase().includes(q) ||
      a.alternative_medicine?.generic_name.toLowerCase().includes(q) ||
      a.pharmacist_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            Verified Equivalence Directory
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Pharmacist-Verified Equivalent Medicines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Bioequivalent formulations independently evaluated and verified by licensed pharmacists.
          </p>
        </div>

        {/* Strict Medical Warning Banner */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-300/80 flex items-start gap-3 text-xs text-amber-950 leading-relaxed shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-900">Mandatory Healthcare Advisory: </strong>
            Medicine substitutions should ONLY be made after consultation with a qualified doctor or licensed pharmacist.
            This directory does not automate drug swapping. It provides transparency into verified generic bioequivalence records.
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by primary medicine or verified equivalent brand (e.g. Crocin, Calpol, Pan 40)..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Alternatives List */}
        <div className="space-y-4">
          <div className="text-xs text-slate-500 px-1">
            Showing <strong>{filtered.length}</strong> pharmacist-verified equivalent relationships
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-44 bg-white rounded-xl border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-xs text-slate-500">
              No verified equivalent matches found.
            </div>
          ) : (
            filtered.map(alt => (
              <div
                key={alt.id}
                className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4 hover:border-blue-200 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  {/* Left: Original Medicine */}
                  <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                      Prescribed / Original Brand
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {alt.medicine?.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {alt.medicine?.generic_name} ({alt.medicine?.strength})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {alt.medicine?.dosage_form} · {alt.medicine?.manufacturer}
                    </p>
                    <Link
                      to={`/medicines/${alt.medicine_id}`}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      Check Availability <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Center arrow indicator */}
                  <div className="flex flex-col items-center justify-center shrink-0 text-slate-400">
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mb-1">
                      Bioequivalent
                    </span>
                    <ArrowRight className="w-5 h-5 text-emerald-600 hidden md:block" />
                  </div>

                  {/* Right: Verified Alternative */}
                  <div className="flex-1 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                    <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider block mb-1">
                      Pharmacist-Verified Alternative
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      {alt.alternative_medicine?.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {alt.alternative_medicine?.generic_name} ({alt.alternative_medicine?.strength})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {alt.alternative_medicine?.dosage_form} · {alt.alternative_medicine?.manufacturer}
                    </p>
                    <Link
                      to={`/medicines/${alt.alternative_medicine_id}`}
                      className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      Check Availability <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Verification Metadata Box */}
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200 text-xs space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between text-slate-600 text-[11px]">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Verified by: {alt.pharmacist_name}
                      {alt.pharmacist_license && (
                        <span className="font-mono text-slate-500 font-normal">[{alt.pharmacist_license}]</span>
                      )}
                    </span>
                    <span className="text-slate-400 font-mono">Date: {alt.verification_date}</span>
                  </div>

                  <p className="text-slate-700 leading-relaxed text-xs">
                    <strong>Pharmacist Evaluation:</strong> "{alt.notes}"
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
