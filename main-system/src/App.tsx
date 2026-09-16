import { IonApp } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './lib/auth'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ParcelEntry from './pages/ParcelEntry'
import Customers from './pages/Customers'
import FinancialReport from './pages/FinancialReport'
import Branches from './pages/Branches'
import Settings from './pages/Settings'

function App() {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              }
            />
            <Route
              path="/parcels/new"
              element={
                <RequireAuth>
                  <ParcelEntry />
                </RequireAuth>
              }
            />
            <Route
              path="/customers"
              element={
                <RequireAuth>
                  <Customers />
                </RequireAuth>
              }
            />
            <Route
              path="/finance"
              element={
                <RequireAuth>
                  <FinancialReport />
                </RequireAuth>
              }
            />
            <Route
              path="/branches"
              element={
                <RequireAuth>
                  <Branches />
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  )
}

export default App
