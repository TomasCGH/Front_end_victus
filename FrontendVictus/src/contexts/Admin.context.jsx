import { createContext, useEffect, useState } from "react";
import {
    AdministradoresService,
} from "../services/administradoresService";

const AdminContext = createContext();

function AdminProviderWrapper(props) {
    const [admins, setAdmins] = useState([]);
    const [filteredAdmins, setFilteredAdmins] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    // Obtener todos los administradores
        const getAdmin = async () => {
                try {
                        setLoading(true);
                        const data = await AdministradoresService.fetchAdministradores();
                        setAdmins(data || []);
                        setFilteredAdmins(data || []);
                        setError(null);
                    } catch (err) {
                        console.error("Error al cargar administradores:", err);
                        setError("No se pudo cargar la lista de administradores. Intenta más tarde.");
                    } finally {
                        setLoading(false);
                    }
        };

    useEffect(() => {
        getAdmin();
    }, []);

    // Buscar por nombre
    const filterAdmins = (name) => {
        const filtered = admins.filter(admin =>
            admin.name.toLowerCase().includes(name.toLowerCase())
        );
        setFilteredAdmins(filtered);
    };

    const findAdminsByName = async (name) => {
        try {
            return await AdministradoresService.findAdministradoresByName(name);
        } catch (error) {
            console.error("Error filtrando administradores:", error);
            return [];
        }
    };


    // Crear nuevo administrador
    const createAdmin = async (newAdmin) => {
        try {
            await AdministradoresService.createAdministrador(newAdmin);
            await getAdmin();
        } catch (e) {
            console.error("Error al crear administrador:", e);
        }
    };

    // Eliminar un administrador por ID
    const deleteAdmin = async (id) => {
        try {
            await AdministradoresService.deleteAdministrador(id);
            await getAdmin();
        } catch (e) {
            console.error("Error al eliminar administrador:", e);
        }
    };

    // Modificar un administrador por ID
    const updateAdmin = async (id, updatedData) => {
        try {
            await AdministradoresService.updateAdministrador(id, updatedData);
            await getAdmin();
        } catch (e) {
            console.error("Error al actualizar administrador:", e);
        }
    };

    return (
        <AdminContext.Provider value={{
            admins,
            filteredAdmins,
            setAdmins,
            getAdmin,
            filterAdmins,
            createAdmin,
            deleteAdmin,
            updateAdmin,
            findAdminsByName,
            error,
            loading,
        }}>
            {props.children}
        </AdminContext.Provider>
    );
}

export { AdminContext, AdminProviderWrapper };
