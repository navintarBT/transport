import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Navigate, Route } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './lib/auth'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ParcelEntry from './pages/ParcelEntry'
import Parcels from './pages/Parcels'
import PendingPickup from './pages/PendingPickup'
import Customers from './pages/Customers'
import FinancialReport from './pages/FinancialReport'
import Branches from './pages/Branches'
import Settings from './pages/Settings'

function App() {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
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
              path="/receive"
              element={
                <RequireAuth>
                  <ParcelEntry />
                </RequireAuth>
              }
            />
            <Route
              path="/parcels"
              element={
                <RequireAuth>
                  <Parcels />
                </RequireAuth>
              }
            />
            <Route
              path="/pending"
              element={
                <RequireAuth>
                  <PendingPickup />
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
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  )
}

export default App
