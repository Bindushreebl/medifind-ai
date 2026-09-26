import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, Building2, PhoneCall, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Safety Disclaimer Banner */}
        <div className="mb-10 p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex items-start gap-3.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-semibold text-white">Important Healthcare Safety Notice: </span>
            MediFind is an availability discovery and pharmacy connection platform. It does NOT diagnose medical conditions,
            prescribe medicines, or recommend drug substitutions. Medicine substitutions must only be made after consultation
            with a qualified doctor or pharmacist. All alternative options shown are strictly limited to pharmacist-verified bioequivalent formulations.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800 text-sm">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                +
              </div>
              <span className="text-lg font-bold text-white tracking-tight">MediFind</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time medicine availability, local pharmacy price transparency, and verified equivalent alternatives.
            </p>
            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Demo Mode Active · 8 Pharmacies Connected</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Explore</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/medicines" className="hover:text-white transition-colors">
                  Search Medicines
                </Link>
              </li>
              <li>
                <Link to="/pharmacies" className="hover:text-white transition-colors">
                  Find Nearby Pharmacies
                </Link>
              </li>
              <li>
                <Link to="/compare" className="hover:text-white transition-colors">
                  Compare Pharmacy Prices
                </Link>
              </li>
              <li>
                <Link to="/alternatives" className="hover:text-white transition-colors">
                  Pharmacist-Verified Options
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Access Portals</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Patient Dashboard
                </Link>
              </li>
              <li>
                <Link to="/pharmacy-dashboard" className="hover:text-white transition-colors">
                  Pharmacy Inventory Manager
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition-colors">
                  Clinical & Admin Analytics
                </Link>
              </li>
              <li>
                <Link to="/reservations" className="hover:text-white transition-colors">
                  Medicine Pickup Tracking
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Helpline & Verification</h4>
            <p className="text-xs text-slate-400">
              Need assistance finding urgent medication? Our local pharmacy network support team is here to help.
            </p>
            <div className="pt-2 space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-blue-400" />
                <span>1800-420-FIND (Toll Free)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>support@medifind-demo.org</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <p>© {new Date().getFullYear()} MediFind Health Technologies. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400 text-xs">
            <span>Clinical Verification Standard ISO-15189</span>
            <span>·</span>
            <span>Zero Prescription Alteration Guarantee</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
