import { createContext, useEffect, useState } from "react";

    const mockCommonZones = [
        {
            id: "7803ce6c-6ade-5db1-a194-5eaff3fb58ca",
            name: "Piscina",
            description: "Es un espacio deportivo y lúdico",
            peopleCapacity: "50",
            usageTime: "60",
            usingTimeUnit: "Minutos",
            rule: "Para reservar la psicina debe contar con 1 dia de anterioridad"
        },
        {
            id: "8803ce6c-6ade-5db1-a194-5eaff3fb58ca",
            name: "Gimnasio",
            description: "Espacio que cuenta con diferentes maquinas para la ejercitación",
            peopleCapacity: "20",
            usageTime: "120",
            usingTimeUnit: "Minutos",
            rule: "Usar la maquinaria con toalla y mantener la higiene"
        },
        {
            id: "9803ce6c-6ade-5db1-a194-5eaff3fb58ca",
            name: "Pisciona Adultos",
            description: "Es un espacio deportivo y lúdico",
            peopleCapacity: "15",
            usageTime: "1",
            usingTimeUnit: "Hora",
            rule: "Para reservar la psicina debe contar con 1 dia de anterioridad"
        },
        {
            id: "a803ce6c-6ade-5db1-a194-5eaff3fb58ca",
            name: "Salón de Eventos",
            description: "Un espacio amplio para celebrar reuniones sociales y familiares.",
            peopleCapacity: "100",
            usageTime: "4",
            usingTimeUnit: "Hora",
            rule: "Reservar con al menos 3 días de anticipación. No se permite el uso de pirotecnia."
        }
    ]


const CommonZoneContext = createContext();

function CommonZoneProviderWrapper(props) {
    const [commonZones, setCommonZones] = useState([]);
    const [filteredCommonZones, setFilteredCommonZones] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    // Obtener todos los administradores
    const getCommonZone = () => {
        try {
            setTimeout(() => {
                setCommonZones(mockCommonZones);
                setFilteredCommonZones(mockCommonZones);
                setError(null); 
                setLoading(false);
            },500);
        } catch (err) {
          console.error("Error al cargar Zonas Comunes:", err);
          setError("No se pudo cargar la lista de Zonas Comunes. Intenta más tarde.");
          setLoading(false);
        }
    };

    useEffect(() => {
        getCommonZone();
    }, []);

    // Buscar por nombre
    const filterCommonZones = (name) => {
        const filtered = commonZones.filter(commonZone =>
            commonZone.name.toLowerCase().includes(name.toLowerCase())
        );
        setFilteredCommonZones(filtered);
    };

    const findCommonZonesByName = async (name) => {
        return new Promise((resolve) => {
        setTimeout(() => {
            const filtered = mockCommonZones.filter((commonZone) =>
                commonZone.name.toLowerCase().includes(name.toLowerCase())
            );
            resolve(filtered);
        }, 300);
        });
        
    };


    // Crear nuevo administrador
    const createCommonZone = async (newCommonZone) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Generamos un ID único
                const id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                const commonZoneWithId = { ...newCommonZone, id };
                
                // Actualizamos el estado con el nuevo CommonZoneistrador
                setCommonZones(prevCommonZones => [...prevCommonZones, commonZoneWithId]);
                setFilteredCommonZones(prevFiltered => [...prevFiltered, commonZoneWithId]);
                
                // También actualizamos nuestros datos mock para mantener consistencia
                mockCommonZones.push(commonZoneWithId);
                
                resolve({ success: true, data: commonZoneWithId });
            }, 300);
        });
    };

    // Eliminar un administrador por ID
    const deleteCommonZone = async (id) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Filtramos el administrador del estado
                const updatedCommonZones = commonZones.filter(commonZone => commonZone.id !== id);
                setCommonZones(updatedCommonZones);
                setFilteredCommonZones(updatedCommonZones);
                
                // También actualizamos nuestros datos mock
                const indexToRemove = mockCommonZones.findIndex(commonZone => commonZone.id === id);
                if (indexToRemove !== -1) {
                mockCommonZones.splice(indexToRemove, 1);
                }
                
                resolve({ success: true });
            }, 300);
        });
    };

    // Modificar un administrador por ID
    const updateCommonZone = async (id, updatedData) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Actualizamos en el estado
                const updatedCommonZones = commonZones.map(commonZone => 
                commonZone.id === id ? { ...commonZone, ...updatedData } : commonZone
                );
                setCommonZones(updatedCommonZones);
                setFilteredCommonZones(updatedCommonZones);
                
                // También actualizamos nuestros datos mock
                const commonZoneIndex = mockCommonZones.findIndex(commonZone => commonZone.id === id);
                if (commonZoneIndex !== -1) {
                mockCommonZones[commonZoneIndex] = { ...mockCommonZones[commonZoneIndex], ...updatedData };
                }
                
                resolve({ success: true });
            }, 300);
        });
    };

    return (
        <CommonZoneContext.Provider value={{
            commonZones,
            filteredCommonZones,
            setCommonZones,
            getCommonZone,
            filterCommonZones,
            createCommonZone,
            deleteCommonZone,
            updateCommonZone,
            findCommonZonesByName,
            error,
            loading,
        }}>
            {props.children}
        </CommonZoneContext.Provider>
    );
}

export { CommonZoneContext, CommonZoneProviderWrapper };
