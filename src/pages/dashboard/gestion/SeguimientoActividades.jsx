import { API_BASE_URL } from 'src/config/api';
import axios from 'axios';
import { getStorage } from 'minimal-shared/utils';
import React, { useState, useEffect } from 'react';
import { ArrowDown2, InfoCircle, DocumentDownload, Trash } from 'iconsax-react';

import {
    Accordion, AccordionSummary, AccordionDetails, Typography, Grid, TextField,
    MenuItem, Button, Box, Select, InputLabel, FormControl, CircularProgress, Table,
    TableHead, TableRow, TableCell, TableBody, IconButton
} from '@mui/material';

import DedicacionPersonal from './DedicacionPersonal';
import PresupuestoErogacion from './PresupuestoErogacion';

const estadoOpciones = [
    { id: '1', name: 'A tiempo' },
    { id: '2', name: 'Atrasado' },
    { id: '3', name: 'Cancelado' },
    { id: '4', name: 'Suspendido' },
];

const formatearVigencia = (inicio, fin) => {
    const inicioFmt = new Date(inicio).toLocaleDateString('es-CO');
    const finFmt = new Date(fin).toLocaleDateString('es-CO');
    return `${inicioFmt} - ${finFmt}`;
};

const SeguimientoActividades = ({ idSeguimiento, idProyecto, onPersonalUpdated }) => {
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
                                estado: seg?.estadoejecactividad || '',
                                avance: seg?.porcavanact || '',
                                avanceAnterior,
                                descripcion: seg?.descripavance || '',
                                acciones: seg?.accionesact || '',
                                idactividadseg: seg?.idactividadseg
                            };
                        } catch (error) {
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


        const [archivos, setArchivos] = useState([]);
        const [loadingArchivos, setLoadingArchivos] = useState(true);
        const [nuevoArchivo, setNuevoArchivo] = useState(null);
        const [observacionArchivo, setObservacionArchivo] = useState("");

        useEffect(() => {
            const fetchArchivos = async () => {
                setLoadingArchivos(true);
                try {
                    const res = await axios.get(`${API_BASE_URL}/archivos`);
                    const archivosFiltrados = res.data.filter(a =>
                        a.idactividad === actividad.id &&
                        a.idproyecto === idProyecto &&
                        String(a.seguimiento) === String(idSeguimiento)
                    );
                    setArchivos(archivosFiltrados);
                } catch (error) {
                    console.error("Error cargando archivos:", error);
                } finally {
                    setLoadingArchivos(false);
                }
            };

            fetchArchivos();
        }, [actividad.id, idProyecto, idSeguimiento]);

        const handleGuardarArchivo = async () => {
            if (!nuevoArchivo) {
                alert("Seleccione un archivo");
                return;
            }

            const formData = new FormData();
            formData.append("file", nuevoArchivo);
            formData.append("idproyecto", idProyecto);
            formData.append("idactividad", actividad.id);
            formData.append("observacion", observacionArchivo || "");
            formData.append("seguimiento", idSeguimiento);

            try {
                const res = await axios.post(`${API_BASE_URL}/archivos/upload`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });


                setArchivos(prev => [...prev, res.data]);
                setNuevoArchivo(null);
                setObservacionArchivo("");
                alert("Archivo guardado con éxito");
            } catch (error) {
                console.error("Error guardando archivo:", error);
                alert("No se pudo guardar el archivo");
            }
        };

        const handleEliminarArchivo = async (idarchivo) => {
            if (!window.confirm("¿Desea eliminar este archivo?")) return;
            try {
                await axios.delete(`${API_BASE_URL}/archivos/${idarchivo}`);
                setArchivos(prev => prev.filter(a => a.idarchivo !== idarchivo));
            } catch (error) {
                console.error("Error eliminando archivo:", error);
                alert("No se pudo eliminar el archivo");
            }
        };

        const handleDescargarArchivo = (archivo) => {

            window.open(`${API_BASE_URL}/archivos/download/${archivo.idarchivo}`, "_blank");
        };

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
                                    disabled={seguimientoTerminadoA}
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
                                disabled={seguimientoTerminadoA}
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
                                disabled={seguimientoTerminadoA}
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
                                disabled={seguimientoTerminadoA}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleGuardarActividadClick}
                                disabled={seguimientoTerminadoA}
                            >
                                Guardar Seguimiento Actividad
                            </Button>
                        </Grid>
                    </Grid>

                    <DedicacionPersonal onUpdated={onPersonalUpdated} idSeguimiento={idSeguimiento} idActividad={actividad.id} />

                    { }
                    <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Archivos de la Actividad
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <input type="file" onChange={e => setNuevoArchivo(e.target.files[0])} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                            <TextField
                                label="Observación"
                                value={observacionArchivo}
                                onChange={e => setObservacionArchivo(e.target.value)}
                                fullWidth
                            />
                            <Button variant="contained" color="primary" onClick={handleGuardarArchivo}>
                                Guardar Archivo
                            </Button>
                        </Box>

                        {loadingArchivos ? (
                            <CircularProgress />
                        ) : archivos.length === 0 ? (
                            <Typography>No hay archivos registrados para esta actividad.</Typography>
                        ) : (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Observación</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {archivos.map(a => (
                                        <TableRow key={a.idarchivo}>
                                            <TableCell>{a.nombreorig}</TableCell>
                                            <TableCell>{a.observacion}</TableCell>
                                            <TableCell align="right">
                                                <IconButton color="primary" size="small" onClick={() => handleDescargarArchivo(a)}>
                                                    <DocumentDownload size={16} />
                                                </IconButton>
                                                <IconButton color="error" size="small" onClick={() => handleEliminarArchivo(a.idarchivo)}>
                                                    <Trash size={16} />
                                                </IconButton>

                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Box>
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

export default SeguimientoActividades;
