import React, { useEffect, useState } from 'react';
import { getStorage as getStorageValue } from 'minimal-shared/utils';

import NuevoProyecto from './NuevoProyecto';

export default function EditarProyecto() {
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const cargarProyecto = async () => {
            try {
                const data = await JSON.parse(getStorageValue('proyectoParaEditar'));
                if (data !== null) {
                    setInitialData(data);
                }
            } catch (error) {
                console.error('Error cargando el proyecto desde AsyncStorage:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarProyecto();
    }, []);

    if (loading) return <p>Cargando proyecto...</p>;
    if (!initialData) return <p>No se encontró el proyecto para editar.</p>;

    return <NuevoProyecto modoEdicion datosIniciales={initialData} />;
}
