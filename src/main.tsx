import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App' // .tsx extension ki zaroorat nahi hoti import mein
import './index.css' // Agar css file hai to, warna hata dein

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)