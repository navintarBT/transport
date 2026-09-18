import { IonApp, IonRouterOutlet } from '@ionic/react'
import { IonReactRouter } from '@ionic/react-router'
import { Redirect, Route } from 'react-router-dom'
import { AuthProvider, RequireAuth } from './lib/auth'

import Login from './pages/Login'
import Home from './pages/Home'
import BranchStatus from './pages/BranchStatus'
import Scan from './pages/Scan'
import Calculator from './pages/Calculator'
import Finance from './pages/Finance'
import Profile from './pages/Profile'

function App() {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/home">
              <RequireAuth>
                <Home />
              </RequireAuth>
            </Route>
            <Route exact path="/branches">
              <RequireAuth>
                <BranchStatus />
              </RequireAuth>
            </Route>
            <Route exact path="/scan">
              <RequireAuth>
                <Scan />
              </RequireAuth>
            </Route>
            <Route exact path="/calculator">
              <RequireAuth>
                <Calculator />
              </RequireAuth>
            </Route>
            <Route exact path="/finance">
              <RequireAuth>
                <Finance />
              </RequireAuth>
            </Route>
            <Route exact path="/profile">
              <RequireAuth>
                <Profile />
              </RequireAuth>
            </Route>
            <Route exact path="/">
              <Redirect to="/home" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  )
}

export default App
