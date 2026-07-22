import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Settings, LogOut, Search, Menu, X, Car, Box, ShieldAlert } from 'lucide-react';
import { useAuth } from '../hooks/use-auth';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';

export default function Layout() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Drivers', href: '/drivers', icon: Users },
    { name: 'Assets & Vehicles', href: '/assets', icon: Car },
    { name: 'Reports', href: '/reports', icon: FileText },
    { name: 'Approvals', href: '/approvals', icon: ShieldAlert },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 flex lg:hidden ${mobileMenuOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-slate-900/80 transition-opacity duration-300 ease-linear ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setMobileMenuOpen(false)} />
        <div className={`relative flex w-full max-w-xs flex-1 transform flex-col bg-slate-900 pb-4 pt-5 transition duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute right-0 top-0 -mr-12 pt-2">
            <button type="button" className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" onClick={() => setMobileMenuOpen(false)}>
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <div className="flex shrink-0 items-center px-4">
            <span className="text-xl font-bold text-white tracking-wider">CWDS</span>
          </div>
          <nav className="mt-8 h-full overflow-y-auto px-4 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  location.pathname === item.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:inset-y-0">
        <div className="flex grow flex-col overflow-y-auto bg-slate-900 pb-4 px-4">
          <div className="flex h-16 shrink-0 items-center">
            <Box className="h-8 w-8 text-indigo-500 mr-2" />
            <span className="text-xl font-bold text-white tracking-wide">Class Worldwide</span>
          </div>
          <nav className="mt-8 flex flex-1 flex-col space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium ${
                  location.pathname === item.href
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5 shrink-0" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center">
            <button
              type="button"
              className="border-r border-slate-200 px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <div className="ml-4 flex flex-1 md:ml-6">
              <div className="relative w-full max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  name="search"
                  id="search"
                  className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Search drivers, plates, IDs..."
                />
              </div>
            </div>
          </div>
          <div className="ml-4 flex items-center space-x-4 md:ml-6">
            <div className="flex items-center text-sm font-medium text-slate-700">
              <span className="hidden md:inline-block mr-4 capitalize bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full text-xs">
                {profile?.role || 'Guest'}
              </span>
              <span>{user?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-full bg-white p-1 text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="sr-only">Log out</span>
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
