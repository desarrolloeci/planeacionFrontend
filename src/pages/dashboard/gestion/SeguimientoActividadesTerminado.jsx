import { API_BASE_URL } from 'src/config/api';
import axios from 'axios';
import { getStorage } from 'minimal-shared/utils';
import React, { useState, useEffect } from 'react';
import { ArrowDown2, InfoCircle } from 'iconsax-react';

import {
    Accordion, AccordionSummary, AccordionDetails, Typography, Grid, TextField,
    MenuItem, Button, Box, Select, InputLabel, FormControl, CircularProgress
} from '@mui/material';

import DedicacionPersonal from './DedicacionPersonal';
import PresupuestoErogacion from './PresupuestoErogacion';

const estadoOpciones = [
    { id: '1', name: 'A tiempo' },
    { id: '2', name: 'Con retraso' },
    { id: '3', name: 'Finalizada' },
];

const formatearVigencia = (inicio, fin) => {
    const inicioFmt = new Date(inicio).toLocaleDateString('es-CO');
    const finFmt = new Date(fin).toLocaleDateString('es-CO');
    return `${inicioFmt} - ${finFmt}`;
};

const SeguimientoActividadesTerminado = ({ idSeguimiento, idProyecto }) => {
    const [loading, setLoading] = useState(true);
    const [actividades, setActividades] = useState([]);
    const seguimientosList = JSON.parse(getStorage("seguimientosList"));
    const seguimientoTerminado = getStorage("seguimientoTerminado") === 1;

    useEffect(() => {
        const fetchActividadesYSeguimiento = async () => {
            setLoading(true);
            try {
                const resActividades = await axios.get(
                    `${API_BASE_URL}/actividades/proyecto/${idProyecto}`
                );
                const actividadesBase = resActividades.data || [];

                

                const seguimientosProyecto = seguimientosList
                    .filter(s => s.idproyecto === idProyecto && s.idseguimiento !== idSeguimiento)
                    .sort((a, b) => new Date(b.fechaseg) - new Date(a.fechaseg));

                const seguimientoAnterior = seguimientosProyecto[0];
                let actividadesPrevias = [];

                if (seguimientoAnterior) {
                    const resPrev = await axios.get(
                        `${API_BASE_URL}/seg-actividad/seguimiento/${seguimientoAnterior.idseguimiento}`
                    );
                    actividadesPrevias = resPrev.data || [];
                }

                const actividadesConSeguimiento = await Promise.all(
                    actividadesBase.map(async (actividad) => {
                        const datosBase = {
                            id: actividad.idactividad,
                            nombre: actividad.nombreact,
                            descripcion: actividad.descripcionact,
                            vigencia: formatearVigencia(actividad.fechainiact, actividad.fechafinact),
                        };

                        const anterior = actividadesPrevias.find(a => a.idactividad === actividad.idactividad);
                        const avanceAnterior = anterior ? anterior.porcavanact : '';

                        try {
                            const resSeg = await axios.get(
                                `${API_BASE_URL}/seg-actividad/actividad/${actividad.idactividad}`
                            );
                            const seg1 = resSeg.data;

                            const seg = seg1.find(item => item.idseguimiento === idSeguimiento)

                            

                            return {
                                ...datosBase,
                                estado: seg.estadoejecactividad || '',
                                avance: seg.porcavanact || '',
                                avanceAnterior,
                                descripcion: seg.descripavance || '',
                                acciones: seg.accionesact || '',
                                idactividadseg: seg.idactividadseg
                            };
                        } catch (error) {
                            console.warn(`No hay seguimiento actual para actividad ID ${actividad.idactividad}`);
                            return {
                                ...datosBase,
                                estado: '',
                                avance: '',
                                avanceAnterior,
                                descripcion: '',
                                acciones: ''
                            };
                        }
                    })
                );

                setActividades(actividadesConSeguimiento);
            } catch (error) {
                console.error('Error al cargar actividades o seguimiento:', error);
                setActividades([]);
            } finally {
                setLoading(false);
            }
        };

        if (idProyecto && idSeguimiento) {
            fetchActividadesYSeguimiento();
        }
    }, [idProyecto, idSeguimiento]);

    const handleGuardarActividad = async (actividad) => {
        const payload = {
            idactividad: actividad.id,
            idseguimiento: idSeguimiento,
            estadoejecactividad: actividad.estado,
            descripavance: actividad.descripcion,
            accionesact: actividad.acciones,
            porcavanact: parseFloat(actividad.avance || 0),
        };

        try {
            if (actividad.idactividadseg && actividad.idactividadseg > 0) {
                await axios.put(
                    `${API_BASE_URL}/seg-actividad/${actividad.idactividadseg}`,
                    payload
                );
                alert('Seguimiento actualizado con éxito');
            } else {
                const res = await axios.post(
                    `${API_BASE_URL}/seg-actividad`,
                    payload
                );

                setActividades((prev) =>
                    prev.map((a) =>
                        a.id === actividad.id
                            ? { ...a, idactividadseg: res.data.idactividadseg }
                            : a
                    )
                );

                alert('Seguimiento guardado con éxito');
            }
        } catch (error) {
            console.error('Error al guardar seguimiento:', error);
            alert('Error al guardar seguimiento');
        }
    };

    const ActividadFormulario = ({ actividad, index, onGuardarActividad, seguimientoTerminadoA }) => {
        const [estado, setEstado] = useState(actividad.estado);
        const [avance, setAvance] = useState(actividad.avance);
        const [avanceAnterior] = useState(actividad.avanceAnterior);
        const [descripcion, setDescripcion] = useState(actividad.descripcion);
        const [acciones, setAcciones] = useState(actividad.acciones);



        const handleGuardarActividadClick = () => {
            const actividadActualizada = {
                ...actividad,
                estado,
                avance,
                avanceAnterior,
                descripcion,
                acciones,
            };
            onGuardarActividad(actividadActualizada);
        };

        return (
            <Accordion sx={{ mb: 2 }}>
                <AccordionSummary expandIcon={<ArrowDown2 size={20} variant="Outline" />}>
                    <Typography sx={{ display: 'flex', alignItems: 'center' }}>
                        <InfoCircle size={20} variant="Outline" style={{ marginRight: 8 }} />
                        {index + 1}. {actividad.nombre}
                    </Typography>
                </AccordionSummary>

                <AccordionDetails>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        <strong>Vigencia:</strong> {actividad.vigencia}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <FormControl fullWidth>
                                <InputLabel>Estado Ejecución Actividad</InputLabel>
                                <Select
                                    label="Estado Ejecución Actividad"
                                    value={estado}
                                    onChange={(e) => setEstado(e.target.value)}
                                    disabled
                                >
                                    {estadoOpciones.map((op) => (
                                        <MenuItem key={op.id} value={op.id}>
                                            {op.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Porcentaje de Avance Actividad"
                                type="number"
                                fullWidth
                                value={avance}
                                onChange={(e) => setAvance(e.target.value)}
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Porcentaje de Avance Anterior Seguimiento"
                                type="number"
                                fullWidth
                                value={avanceAnterior}
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Descripción del Avance de la Actividad"
                                fullWidth
                                multiline
                                rows={3}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                disabled
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Acciones a Tomar"
                                fullWidth
                                multiline
                                rows={2}
                                value={acciones}
                                onChange={(e) => setAcciones(e.target.value)}
                                disabled
                            />
                        </Grid>


                    </Grid>

                    <DedicacionPersonal idSeguimiento={idSeguimiento} idActividad={actividad.id} />


                </AccordionDetails>
            </Accordion>
        );
    };

    if (loading) return <CircularProgress />;

    return (
        <Box>
            {actividades.map((actividad, index) => (
                <ActividadFormulario
                    key={actividad.id || index}
                    actividad={actividad}
                    index={index}
                    onGuardarActividad={handleGuardarActividad}
                    seguimientoTerminadoA={seguimientoTerminado}
                />
            ))}
        </Box>
    );
};

export default SeguimientoActividadesTerminado;
