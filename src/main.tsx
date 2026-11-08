import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { LanguageProvider } from './i18n';
import { AuthProvider } from './context/AuthContext';
import { AnimalProvider } from './context/AnimalContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <AnimalProvider>
          <App />
        </AnimalProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);
