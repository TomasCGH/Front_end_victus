import { createContext, useEffect, useState } from "react";

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
            const res = await fetch("https://victus-api-9g73.onrender.com/victusresidenciasEasy/api/v1/administradores/todos");
            if (!res.ok) throw new Error("No se pudo obtener la lista de administradores");
      
            const data = await res.json();
            setAdmins(data.data || []);
            setFilteredAdmins(data.data || []);
            setError(null); // limpia cualquier error anterior
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
            const response = await fetch("/api/victusresidenciasEasy/api/v1/administradores/todos");
            const data = await response.json();
            const allAdmins = data.data;

            // Filtra por nombre
            const filtered = allAdmins.filter((admin) =>
                admin.name.toLowerCase().includes(name.toLowerCase())
            );

            return filtered;
        } catch (error) {
            console.error("Error filtrando administradores:", error);
            return [];
        }
    };


    // Crear nuevo administrador
    const createAdmin = async (newAdmin) => {
        try {
            const response = await fetch("https://victus-api-9g73.onrender.com/victusresidenciasEasy/api/v1/administradores/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newAdmin)
            });
            if (response.ok) {
                await getAdmin();
            }
        } catch (e) {
            console.error("Error al crear administrador:", e);
        }
    };

    // Eliminar un administrador por ID
    const deleteAdmin = async (id) => {
        try {
            const response = await fetch(`https://victus-api-9g73.onrender.com/victusresidenciasEasy/api/v1/administradores/${id}`, {
                method: "DELETE"
            });
            if (response.ok) {
                await getAdmin();
            }
        } catch (e) {
            console.error("Error al eliminar administrador:", e);
        }
    };

    // Modificar un administrador por ID
    const updateAdmin = async (id, updatedData) => {
        try {
            const response = await fetch(`https://victus-api-9g73.onrender.com/victusresidenciasEasy/api/v1/administradores/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(updatedData)
            });
            if (response.ok) {
                await getAdmin();
            }
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
