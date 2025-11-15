import { Route, Routes } from "react-router-dom"
import HomePage from "./HomePage"
import LoginAdminPage from "./LoginAdminPage"
import ShowAdmins from "./ShowAdmins"
import AdminManagement from "../components/AdminManagement"
import CommonZone from "../components/CommonZone"
import Loading from "../loaders/LoadingCircle"
import ProtectedRoute from "../auth/ProtectedRoute"
import AccesoDenegado from "./AccesoDenegado"
import SelectionDashboard from "./SelectionDashboard"
import ConjuntosResidencialesPage from "./ConjuntosResidencialesPage"
import ConjuntoDetailPage from "./ConjuntoDetailPage"
import DepartamentoPage from "./DepartamentoPage"
import CiudadPage from "./CiudadPage"
// import Loading from "../loaders/LoadingText"


function Pages() {
  return (
    <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/loginAdmin" element={<LoginAdminPage />} />
        <Route
          path="/ShowAdmins"
          element={
            <ProtectedRoute>
              <ShowAdmins />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ManagementAdmin"
          element={
            <ProtectedRoute>
              <AdminManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/CommonZone"
          element={
            <ProtectedRoute>
              <CommonZone />
            </ProtectedRoute>
          }
        />
  <Route path="/conjuntos" element={<ConjuntosResidencialesPage />} />
  <Route path="/conjuntos/:id" element={<ConjuntoDetailPage />} />
  <Route path="/catalogos/departamentos" element={<DepartamentoPage />} />
  <Route path="/catalogos/ciudades" element={<CiudadPage />} />
  <Route path="/dashboard" element={<SelectionDashboard />} />
        <Route path="/acceso-denegado" element={<AccesoDenegado />} />
        <Route path="/Loading" element={<Loading />} />
        <Route path="*" element={<HomePage />} />


    </Routes>
  )
}

export default Pages
