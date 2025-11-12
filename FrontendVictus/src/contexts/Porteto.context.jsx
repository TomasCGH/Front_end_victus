import { createContext, useEffect, useState } from "react";

// Datos locales para testing
const mockPorteros = [
    {
        id: "7803ce6c-6ade-4db1-a194-5eaff3fb58ca",
        name: "Andres Felipe",
        lastName: "Velez Alcaraz",
       
        contactNumber: "3057477830",
        email: "parkourandres97@gmail.com",
        password: "sideghparkour19"
    },
    {
        id: "9083f135-cff5-4dce-bb75-0643b5616a20",
        name: "Benito",
        lastName: "Camelas bien",
        idType: "Cc",
        idNumber: "1134444",
        contactNumber: "305668438",
        email: "todoslosdias@gmail.com",
        password: "1233394949"
    },
    {
        id: "f946a5ec-fee4-4913-a694-a0f22bb0a35a",
        name: "Carlos David",
        lastName: "Velez Alcaraz",
        idType: "CC",
        idNumber: "101724659",
        contactNumber: "3057477830",
        email: "andres.velez5136@uco.net.co",
        password: "mariconPowoer"
    },
    {
        id: "4cee3daf-f997-483f-b71a-d0f0a752740c",
        name: "Juan Daniel",
        lastName: "Rodriguez Giraldo",
        idType: "CC",
        idNumber: "546846",
        contactNumber: "3127068080",
        email: "juan.rodriguez9584@uco.net.co",
        password: "pepitoPerez"
    },
    {
        id: "8cbd91f8-bbda-4146-875e-c2f977b3b82e",
        name: "Juan Pablo",
        lastName: "Avendaño Duque",
        idType: "CC",
        idNumber: "10003400",
        contactNumber: "305 3719053",
        email: "juanpower1@gmail.com",
        password: "power1"
    },
    {
        id: "7f05b9c7-e709-4ec1-8c17-c0885812bd08",
        name: "Luis Miguel",
        lastName: "Avendaño Duque",
        idType: "CC",
        idNumber: "5969493",
        contactNumber: "305 389000",
        email: "Miguel@gmail.com",
        password: "power2"
    }
];

const PorteroContext = createContext();

function PorteroProviderWrapper(props) {
    const [porteros, setPorteros] = useState([]);
    const [filteredPorteros, setFilteredPorteros] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    // Simula la obtención de datos pero usa los datos locales
    const getAdmin = () => {
        try {
            // Simulamos un pequeño retraso para imitar una petición a API
            setTimeout(() => {
                setPorteros(mockPorteros);
                setFilteredPorteros(mockPorteros);
                setError(null);
                setLoading(false);
            }, 500);
        } catch (err) {
            console.error("Error al cargar los porteros:", err);
            setError("No se pudo cargar la lista de porteros. Intenta más tarde.");
            setLoading(false);
        }
    };

    useEffect(() => {
        getAdmin();
    }, []);

    // Buscar por nombre
    const filterPorteros = (name) => {
        const filtered = porteros.filter(portero =>
            portero.name.toLowerCase().includes(name.toLowerCase())
        );
        setFilteredPorteros(filtered);
    };

    const findPorterosByName = (name) => {
        // Simula una búsqueda pero usando datos locales
        return new Promise((resolve) => {
            setTimeout(() => {
                const filtered = mockPorteros.filter((portero) =>
                    portero.name.toLowerCase().includes(name.toLowerCase())
                );
                resolve(filtered);
            }, 300);
        });
    };

    // Crear nuevo portero
    const createPortero = (newPortero) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generamos un ID único
                const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const porteroWithId = { ...newPortero, id };

                // Actualizamos el estado con el nuevo portero
                setPorteros(prevPortero => [...prevPortero, porteroWithId]);
                setFilteredPorteros(prevFiltered => [...prevFiltered, porteroWithId]);

                // También actualizamos nuestros datos mock para mantener consistencia
                mockPorteros.push(porteroWithId);

                resolve({ success: true, data: porteroWithId });
            }, 300);
        });
    };

    // Eliminar un portero por ID
    const deletePortero = (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Filtramos el portero del estado
                const updatedPorteros = porteros.filter(portero => portero.id !== id);
                setPorteros(updatedPorteros);
                setFilteredPorteros(updatedPorteros);

                // También actualizamos nuestros datos mock
                const indexToRemove = mockPorteros.findIndex(portero => portero.id === id);
                if (indexToRemove !== -1) {
                    mockPorteros.splice(indexToRemove, 1);
                }

                resolve({ success: true });
            }, 300);
        });
    };

    // Modificar un portero por ID
    const updatePortero = (id, updatedData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Actualizamos en el estado
                const updatedPorteros = porteros.map(portero =>
                    portero.id === id ? { ...portero, ...updatedData } : portero
                );
                setPorteros(updatedPorteros);
                setFilteredPorteros(updatedPorteros);

                // También actualizamos nuestros datos mock
                const porteroIndex = mockPorteros.findIndex(portero => portero.id === id);
                if (porteroIndex !== -1) {
                    mockPorteros[porteroIndex] = { ...mockPorteros[porteroIndex], ...updatedData };
                }

                resolve({ success: true });
            }, 300);
        });
    };

    return (
        <PorteroContext.Provider value={{
            porteros,
            filteredPorteros,
            setPorteros,
            getAdmin,
            filterPorteros,
            createPortero,
            deletePortero,
            updatePortero,
            findPorterosByName,
            error,
            loading,
        }}>
            {props.children}
        </PorteroContext.Provider>
    );
}

export { PorteroContext, PorteroProviderWrapper };