import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMsal } from "@azure/msal-react";
import "../cssComponents/AdminDashboard.css";
import RegistrarViviendaForm from "./RegistrarViviendaForm";
import LogoutButton from "./LogoutButton";

const buttonData = [
    { label: "Conjuntos", icon: "🏢", path: "/" },
    { label: "Zonas Comunes", icon: "🧱", path: "/CommonZone" },
    { label: "Agendas", icon: "📆", path: "/" },
    { label: "Administradores", icon: "👥", path: "/ManagementAdmin" },
    { label: "Porteros", icon: "🧍", path: "/" },
    { label: "Viviendas", icon: "🏠", path: "/viviendas" },
    { label: "Residentes", icon: "👨‍👩‍👧", path: "/" },
    { label: "Asignar Usuarios", icon: "✅", path: "/" },
];

function AdminDashboard() {
    const navigate = useNavigate();
    const [adminName, setAdminName] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { accounts, instance } = useMsal();
    const accountList = useMemo(
        () => (Array.isArray(accounts) ? accounts : []),
        [accounts]
    );
    const hasInstance = Boolean(instance);
    const activeAccount = useMemo(() => {
        if (!instance) {
            return accountList[0] ?? null;
        }
        return instance.getActiveAccount() ?? accountList[0] ?? null;
    }, [accountList, instance]);
    const isAdmin = useMemo(() => {
        const roles = Array.isArray(activeAccount?.idTokenClaims?.roles)
            ? activeAccount.idTokenClaims.roles
            : [];
        return roles.includes("Administrador");
    }, [activeAccount]);
    
    useEffect(() => {
        // Verificar si hay un administrador autenticado
        const currentAdmin = sessionStorage.getItem("currentAdmin");
        if (!hasInstance) {
            return;
        }
        if (activeAccount) {
            setAdminName(activeAccount?.name ?? activeAccount?.username ?? "Administrador");
            return;
        }

        if (currentAdmin) {
            const admin = JSON.parse(currentAdmin);
            setAdminName(`${admin.name} ${admin.lastName}`);
        } else {
            // Si no hay admin autenticado, redirigir al login
            navigate("/loginAdmin");
        }
    }, [activeAccount, hasInstance, navigate]);

    if (!hasInstance) {
        return null;
    }

    const handleModalClose = () => {
        setIsModalOpen(false);
    };

    const handleModalOpen = () => {
        setIsModalOpen(true);
    };

    return (
        <>
            <div className="admin-dashboard">
                <header className="admin-topbar">
                    <h2 className="adminNameTittle">Hola, <span>{adminName || "Administrador"}</span></h2>
                    <div className="admin-topbar-actions">
                        {isAdmin && (
                            <button className="ButtonAccept" onClick={handleModalOpen}>
                                Registrar Vivienda
                            </button>
                        )}
                        <LogoutButton className="ButtonAccept" />
                    </div>
                </header>

                <div className="admin-grid">
                    {buttonData.map((btn, index) => (
                        <div
                            key={index}
                            className="admin-card"
                            onClick={() => navigate(btn.path)}
                        >
                            <div className="admin-icon">{btn.icon}</div>
                            <p>{btn.label}</p>
                        </div>
                    ))}
                </div>
            </div>
            {isModalOpen && (
                <div className="modal-overlay" role="dialog" aria-modal="true">
                    <div className="modal-content">
                        <button className="modal-close" onClick={handleModalClose} aria-label="Cerrar">
                            ×
                        </button>
                        <RegistrarViviendaForm
                            onSuccess={handleModalClose}
                            onCancel={handleModalClose}
                        />
                    </div>
                </div>
            )}
        </>
    );
}

export default AdminDashboard;