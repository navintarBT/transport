import { IonApp } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './lib/auth'

import Login from './pages/Login'
import Home from './pages/Home'
import BranchStatus from './pages/BranchStatus'
import Finance from './pages/Finance'
import Profile from './pages/Profile'

function App() {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/home"
              element={
                <RequireAuth>
                  <Home />
                </RequireAuth>
              }
            />
            <Route
              path="/branches"
              element={
                <RequireAuth>
                  <BranchStatus />
                </RequireAuth>
              }
            />
            <Route
              path="/finance"
              element={
                <RequireAuth>
                  <Finance />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  )
}

export default App
