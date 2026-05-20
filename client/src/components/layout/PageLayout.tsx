import React from 'react';

type PageLayoutProps = {
  children: React.ReactNode;
  variant?: 'auth' | 'app';
};

export const PageLayout: React.FC<PageLayoutProps> = ({ children, variant = 'auth' }) => {
  const isAuth = variant === 'auth';

  return (
    <div
      className={
        isAuth
          ? 'min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4'
          : 'min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
      }
    >
      {isAuth ? <div className="w-full max-w-md">{children}</div> : <div className="max-w-6xl mx-auto p-6">{children}</div>}
    </div>
  );
};
