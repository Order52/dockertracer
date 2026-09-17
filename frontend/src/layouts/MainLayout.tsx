import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Grid2x2, UserCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    setIsMenuOpen(false);
    navigate('/login');
  };

  const handleAppsClick = () => {
    navigate('/');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
        <div 
          className="text-xl text-gray-600 cursor-pointer select-none" 
          onClick={handleAppsClick}
        >
          <span className="font-medium text-gray-800">The Huge</span> Space
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAppsClick}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
            title="Apps"
          >
            <Grid2x2 className="w-6 h-6" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
            >
              <UserCircle className="w-8 h-8" />
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 z-10 w-48 mt-2 bg-white border border-gray-200 rounded-md shadow-lg">
                <div className="py-1">
                  <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </button>
                  <button className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                    My account
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <main className="flex-grow bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
