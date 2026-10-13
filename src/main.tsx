import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import App from './App'
import './index.css'
import { applyThemeMode, getSystemThemeMode } from './presentation/theme/themeMode'
import { LanguageProvider } from './presentation/texts/LanguageProvider'

applyThemeMode(getSystemThemeMode())

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <LanguageProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </LanguageProvider>
  </React.StrictMode>,
)