import ViviendasDashboard from "../components/ViviendasDashboard";
import ProtectedRoute from "../auth/ProtectedRoute";

// Dashboard final protegido: reutiliza el componente existente ViviendasDashboard
export default function DashboardViviendas() {
  return (
    <ProtectedRoute>
      <ViviendasDashboard />
    </ProtectedRoute>
  );
}
