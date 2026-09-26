import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  User as UserIcon,
  LogOut,
  Shield,
  Store,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export const Navbar: React.FC = () => {
  const { user, pharmacy, logout, switchDemoRole } = useAuth();
  const { unreadCount, setIsOpen, isOpen } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [demoSwitchOpen, setDemoSwitchOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const handleRoleSwitch = async (role: 'USER' | 'PHARMACY' | 'ADMIN') => {
    await switchDemoRole(role);
    setDemoSwitchOpen(false);
    if (role === 'PHARMACY') {
      navigate('/pharmacy-dashboard');
    } else if (role === 'ADMIN') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single Wordmark Brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10.5 4a1.5 1.5 0 0 1 3 0v6.5H20a1.5 1.5 0 0 1 0 3h-6.5V20a1.5 1.5 0 0 1-3 0v-6.5H4a1.5 1.5 0 0 1 0-3h6.5V4z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Medi<span className="text-blue-600">Find</span>
              </span>
            </Link>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              to="/medicines"
              className={`transition-colors hover:text-blue-600 ${
                isActive('/medicines') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Medicines
            </Link>
            <Link
              to="/pharmacies"
              className={`transition-colors hover:text-blue-600 ${
                isActive('/pharmacies') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Pharmacies
            </Link>
            <Link
              to="/compare"
              className={`transition-colors hover:text-blue-600 ${
                isActive('/compare') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Price Compare
            </Link>
            <Link
              to="/alternatives"
              className={`transition-colors hover:text-blue-600 ${
                isActive('/alternatives') ? 'text-blue-600 font-semibold' : ''
              }`}
            >
              Verified Alternatives
            </Link>

            {user?.role === 'USER' && (
              <>
                <Link
                  to="/dashboard"
                  className={`transition-colors hover:text-blue-600 ${
                    isActive('/dashboard') ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  My Dashboard
                </Link>
                <Link
                  to="/reservations"
                  className={`transition-colors hover:text-blue-600 ${
                    isActive('/reservations') ? 'text-blue-600 font-semibold' : ''
                  }`}
                >
                  Reservations
                </Link>
              </>
            )}

            {user?.role === 'PHARMACY' && (
              <Link
                to="/pharmacy-dashboard"
                className={`transition-colors hover:text-blue-600 ${
                  isActive('/pharmacy-dashboard') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Pharmacy Portal
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                className={`transition-colors hover:text-blue-600 ${
                  isActive('/admin') ? 'text-blue-600 font-semibold' : ''
                }`}
              >
                Admin Console
              </Link>
            )}
          </nav>

          {/* Zone 3: Actions & Auth */}
          <div className="flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoSwitchOpen(!demoSwitchOpen)}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                title="Switch demo persona for testing"
              >
                <span>Role: {user ? user.role : 'Guest'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {demoSwitchOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                  <div className="px-3 py-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    Switch Demo Persona
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('USER')}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 flex items-center justify-between"
                  >
                    <span>👤 Patient (User)</span>
                    {user?.role === 'USER' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('PHARMACY')}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 flex items-center justify-between"
                  >
                    <span>🏥 Pharmacy (Apollo)</span>
                    {user?.role === 'PHARMACY' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className="w-full text-left px-3 py-2 text-slate-700 hover:bg-blue-50 flex items-center justify-between"
                  >
                    <span>🛡️ System Admin</span>
                    {user?.role === 'ADMIN' && <span className="text-blue-600 font-bold">✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Bell */}
            {user && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white tabular-nums">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            {/* User Profile / Login */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-medium text-slate-800 hidden sm:inline max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-sm">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="font-semibold text-slate-900 truncate">{user.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[11px] text-blue-600 font-medium">
                        Role: {user.role} {pharmacy ? `· ${pharmacy.name}` : ''}
                      </span>
                    </div>

                    {user.role === 'USER' && (
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <UserIcon className="w-4 h-4 text-slate-500" />
                        My Dashboard
                      </Link>
                    )}

                    {user.role === 'PHARMACY' && (
                      <Link
                        to="/pharmacy-dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Store className="w-4 h-4 text-slate-500" />
                        Pharmacy Dashboard
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:bg-slate-50"
                      >
                        <Shield className="w-4 h-4 text-slate-500" />
                        Admin Analytics
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdownOpen(false);
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-2">
          <Link
            to="/medicines"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Medicines Search
          </Link>
          <Link
            to="/pharmacies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Find Pharmacies
          </Link>
          <Link
            to="/compare"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Price Comparison
          </Link>
          <Link
            to="/alternatives"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Pharmacist-Verified Alternatives
          </Link>
          {user && (
            <Link
              to="/reservations"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              My Reservations
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
