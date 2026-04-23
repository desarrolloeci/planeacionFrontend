import { API_BASE_URL } from 'src/config/api';
import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';


const centrosCosto = [
    { codigo: '1208010709', nombre: 'Centro Operativo A' },
    { codigo: '1208010710', nombre: 'Centro Operativo B' },
];

const rubrosData = [
    { id: '3004', nombre: 'Rubro A1', ccosto: '1208010709', tiporub: '1' },
    { id: '3005', nombre: 'Rubro A2', ccosto: '1208010709', tiporub: '2' },
    { id: '4001', nombre: 'Rubro B1', ccosto: '1208010710', tiporub: '1' },
];

const EjecucionPresupuestal = ({ idSeguimiento, refreshTrigger }) => {
    const [erogaciones, setErogaciones] = useState([]);
    const [dedicacionPersonal, setDedicacionPersonal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (idSeguimiento) {
            calcularDedicacionPersonal();
        }
    }, [refreshTrigger]);

    const formatearMoneda = (valor) =>
        new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
        }).format(valor || 0);

    const getNombreCentroCosto = (codigo) => {
        const centro = centrosCosto.find((c) => c.codigo === String(codigo));
        return centro ? centro.nombre : `Centro ${codigo}`;
    };

    const getNombreRubro = (codigo, ccosto) => {
        const rubro = rubrosData.find(
            (r) => r.id === String(codigo) && r.ccosto === String(ccosto)
        );
        return rubro ? rubro.nombre : `Rubro ${codigo}`;
    };

    useEffect(() => {
        const fetchErogaciones = async () => {
            try {
                const response = await fetch(
                    `${API_BASE_URL}/seg-erogacion/seguimiento/${idSeguimiento}`
                );
                if (!response.ok) throw new Error('Error al obtener erogaciones');
                const data = await response.json();
                setErogaciones(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (idSeguimiento) {
            fetchErogaciones();
        }
    }, [idSeguimiento]);

    const calcularDedicacionPersonal = async () => {
        try {
            const resSeg = await fetch(`${API_BASE_URL}/segpersonal`);
            if (!resSeg.ok) throw new Error('Error al obtener seg-personal');
            const segData = await resSeg.json();

            const registrosFiltrados = segData.filter(
                (item) => item.idseguimiento === idSeguimiento
            );

            const cachePersonal = {};

            const detalles = await Promise.all(
                registrosFiltrados.map(async (item) => {
                    const id = item.idpersonal;

                    if (!cachePersonal[id]) {
                        try {
                            const resPers = await fetch(`${API_BASE_URL}/personal/${id}`);
                            if (!resPers.ok) throw new Error('Error al obtener personal');
                            const persona = await resPers.json();

                            const resHoras = await fetch(`${API_BASE_URL}/horas-personal/personal/${id}`);
                            const horasData = resHoras.ok ? await resHoras.json() : [];

                            const totalHorasPlaneadas = horasData.reduce(
                                (sum, h) => sum + (h.horas || 0) * (h.cantPer || 1),
                                0
                            );

                            const valorHora =
                                totalHorasPlaneadas > 0
                                    ? (persona.valorprs || 0) / totalHorasPlaneadas
                                    : 0;

                            cachePersonal[id] = valorHora;
                        } catch (err) {
                            console.warn(`Error obteniendo valor hora para personal ${id}:`, err);
                            cachePersonal[id] = 0;
                        }
                    }

                    const valorHora = cachePersonal[id];
                    const horasSeg = item.horaseg || 0;

                    return valorHora * horasSeg;
                })
            );

            const total = detalles.reduce((acc, val) => acc + val, 0);
            setDedicacionPersonal(total);
        } catch (e) {
            console.error('Error en cálculo de dedicación personal:', e);
            setDedicacionPersonal(0);
        }
    };


    if (loading) {
        return (
            <Box p={3}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Typography variant="h6" gutterBottom>
                Presupuesto de Erogación oficial.

            </Typography>

            {erogaciones.length > 0 ? (
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell>Centro de Costo</TableCell>
                                <TableCell>Rubro</TableCell>
                                <TableCell>Año</TableCell>
                                <TableCell>Apropiación</TableCell>
                                <TableCell>Saldo</TableCell>
                                <TableCell>Adición/Cambio Año</TableCell>
                                <TableCell>Aprobación Final</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {erogaciones.map((erog, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{getNombreCentroCosto(erog.ccosto)}</TableCell>
                                    <TableCell>
                                        {getNombreRubro(erog.rubro, erog.ccosto)}
                                    </TableCell>
                                    <TableCell>{erog.agno}</TableCell>
                                    <TableCell>{formatearMoneda(erog.apropiacion)}</TableCell>
                                    <TableCell>{formatearMoneda(erog.saldo)}</TableCell>
                                    <TableCell>{formatearMoneda(erog.adicioncambioagno)}</TableCell>
                                    <TableCell>{formatearMoneda(erog.aprfinal)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                    No hay erogaciones registradas para este seguimiento.
                </Alert>
            )}



            <Typography variant="h6" mt={4} gutterBottom>
                Dedicación de Personal Ejecutada
            </Typography>
            <Typography variant="body1" mb={3}>
                Total calculado por seguimiento: {formatearMoneda(dedicacionPersonal)}
            </Typography>
        </Box>
    );
};

export default EjecucionPresupuestal;
