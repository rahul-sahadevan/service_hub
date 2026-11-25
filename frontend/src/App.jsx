import React from "react";
import { Route,Routes,Navigate } from "react-router-dom";
import Register from "./components/register/Register";
import Login from "./components/login/login";
import Plans from "./components/plans/plans";
import Dashboard from "./components/dashboard/dashboard";
import Subscriptions from "./components/subscriptions/subscriptions";
import Services from "./components/services/services";
import Packages from "./components/packages/packages";
import Integrations from "./components/integration/integrations";
import MainLayout from "./components/mainlayout";


const App = ()=>{

  return(
    <div>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Authenticated layout */}
        <Route
          path="/"
          element={
            <MainLayout>
              <Navigate to="/dashboard" replace />
            </MainLayout>
          }
        />

        <Route
          path="/dashboard"
          element={<MainLayout><Dashboard /></MainLayout>}
        />

        <Route
          path="/subscriptions"
          element={<MainLayout><Subscriptions /></MainLayout>}
        />

        <Route
          path="/packages"
          element={<MainLayout><Packages /></MainLayout>}
        />

        <Route
          path="/services"
          element={<MainLayout><Services /></MainLayout>}
        />

        <Route
          path="/integrations"
          element={<MainLayout><Integrations /></MainLayout>}
        />
      </Routes>
    </div>
  )
}


export default App