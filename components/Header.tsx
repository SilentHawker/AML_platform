
import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { useAuth } from '../hooks/useAuth';
import { getTenants } from '../services/policyService';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface HeaderProps {
  isAuthenticated: boolean;
  userEmail?: string;
  userRole?: 'client' | 'manager' | 'admin';
  onLogout: () => void;
}

const TenantSwitcher: React.FC = () => {
    const { startImpersonation, stopImpersonation, impersonatedTenant } = useAuth();
    const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTenants(getTenants());
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (tenantId: string, tenantName: string) => {
        startImpersonation(tenantId, tenantName);
        setIsOpen(false);
    };
    
    const handleAdminView = () => {
        stopImpersonation();
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md transition-colors"
            >
                {impersonatedTenant ? `Viewing: ${impersonatedTenant.tenantName}` : "Admin View"}
                <ChevronDownIcon className="h-4 w-4 ml-1" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                        <a 
                            href="#" 
                            onClick={(e) => { e.preventDefault(); handleAdminView(); }} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-semibold"
                        >
                            Admin Panel
                        </a>
                        <div className="border-t border-gray-100 my-1"></div>
                        <p className="px-4 pt-2 pb-1 text-xs text-gray-500 font-semibold uppercase">View as Client</p>
                        {tenants.map(tenant => (
                            <a 
                                key={tenant.id}
                                href="#"
                                onClick={(e) => { e.preventDefault(); handleSelect(tenant.id, tenant.name); }}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                                {tenant.name}
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const Header: React.FC<HeaderProps> = ({ isAuthenticated, userEmail, userRole, onLogout }) => {
  const { stopImpersonation, impersonatedTenant } = useAuth();
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 md:px-8 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-800">AML SafetyNet</h1>
          </div>
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-6 border-l border-gray-200 pl-6">
              {userRole !== 'admin' && (
                <button
                  className="text-sm font-semibold text-blue-600"
                  aria-current="page"
                >
                  Dashboard
                </button>
              )}
              {userRole === 'admin' && (
                <>
                  {impersonatedTenant && (
                    <button
                      className="text-sm font-semibold text-blue-600"
                      aria-current="page"
                    >
                      Dashboard
                    </button>
                  )}
                  <button
                    onClick={(e) => {e.preventDefault(); stopImpersonation();}}
                    className={`text-sm font-medium transition-colors ${!impersonatedTenant ? 'text-blue-600 font-semibold' : 'text-gray-500 hover:text-blue-600'}`}
                  >
                    Admin Panel
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isAuthenticated && userEmail && (
            <>
              <span className="text-sm text-gray-600 hidden md:block">{userEmail}</span>
              {userRole === 'admin' && <TenantSwitcher />}
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors duration-200 text-sm"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
