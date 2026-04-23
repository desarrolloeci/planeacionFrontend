import { API_BASE_URL } from 'src/config/api';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { ArrowDown2, DocumentDownload, Trash } from 'iconsax-react';
import { CloseCircle } from 'iconsax-react';
import { getStorage } from 'minimal-shared/utils';
import React, { useEffect, useState } from 'react';

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    TextField,
    Box,
    Button,
    Grid,
    Modal,
    IconButton,
    CircularProgress,
    TableCell,
    Table,
    TableHead,
    TableRow,
    TableBody,
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import responsablesLocal from 'src/assets/data/responsables.json';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SeguimientoMetas from './SeguimientoMetas';
import SeguimientoGeneral from './SeguimientoGeneral';
import EjecucionPresupuestal from './EjecucionPresupuestal';
import SeguimientoActividades from './SeguimientoActividades';
import SeguimientoMetasTerminado from './SeguimientoMetasTerminado';
import SeguimientoGeneralTerminado from './SeguimientoGeneralTerminado';
import SeguimientoActividadesTerminado from './SeguimientoActividadesTerminado';

const FormularioSeguimiento = () => {
    const navigate = useNavigate();

    const [refreshEjecucion, setRefreshEjecucion] = useState(0);


    const [proyecto, setProyecto] = useState(null);
    const [proyectoDetalle, setProyectoDetalle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [seguimientoAnterior, setSeguimientoAnterior] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const planes = JSON.parse(getStorage("planesList") || "[]");
    const estados = JSON.parse(getStorage("estadosGenList") || "[]");
    const snies = [{ id: 1, name: "Administrativo y operación" }];
    const unidadejecutora = JSON.parse(getStorage("unidadesList") || "[]");
    const [responsables, setResponsables] = useState([]);

    useEffect(() => {
        const fetchResponsables = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/responsables`);
                if (!response.ok) throw new Error("Error en el API");

                const data = await response.json();

                if (Array.isArray(data) && data.length > 0) {

                    const responsablesApi = data.map(r => ({
                        id: r.cod_emp?.trim(),
                        name: r.nombres?.trim()
                    }));
                    setResponsables(responsablesApi);
                } else {

                    const responsablesArchivo = responsablesLocal.map(r => ({
                        id: r.cod_emp?.trim(),
                        name: r.nombres?.trim()
                    }));
                    setResponsables(responsablesArchivo);
                }
            } catch (error) {
                console.error("Error al obtener responsables desde API, usando archivo local:", error);
                const responsablesArchivo = responsablesLocal.map(r => ({
                    id: r.cod_emp?.trim(),
                    name: r.nombres?.trim()
                }));
                setResponsables(responsablesArchivo);
            }
        };

        fetchResponsables();
    }, []);

    const getNombrePorId = (lista, id) => {
        const encontrado = lista.find(item => item.id === Number(id));
        return encontrado ? encontrado.name : '-';
    };

    const getNombrePorStr = (lista, id) => {

        
        

        if (!lista || lista.length === 0 || !id) return '-';

        const idNormalizado = String(id).trim();

        const encontrado = lista.find(item =>
            String(item.id).trim() === idNormalizado
        );

        return encontrado ? encontrado.name : '-';
    };

    useEffect(() => {
        const cargarProyecto = async () => {
            try {
                const data = JSON.parse(getStorage('proyectoParaEditar'));
                setProyecto(data);
                await handleDetalle(data.idproyecto);
                buscarSeguimientoAnterior(data.idproyecto, data.idSeg);
            } catch (error) {
                console.error("Error cargando proyecto:", error);
            } finally {
                setLoading(false);
            }
        };

        const handleDetalle = async (id) => {
            try {
                const response = await axios.get(`${API_BASE_URL}/proyectos/${id}`);
                setProyectoDetalle(response.data);
            } catch (error) {
                console.error("Error al cargar detalle del proyecto:", error);
            }
        };

        const buscarSeguimientoAnterior = (idProyecto, idSeguimientoActual) => {
            const seguimientosList = JSON.parse(getStorage("seguimientosList") || "[]");
            const seguimientosProyecto = seguimientosList
                .filter(s => s.idproyecto === idProyecto)
                .sort((a, b) => new Date(b.fechaseg) - new Date(a.fechaseg));

            if (seguimientosProyecto.length >= 2) {
                const anterior = seguimientosProyecto.find(s => s.idseguimiento !== idSeguimientoActual);
                if (anterior) setSeguimientoAnterior(anterior);
            }
        };

        cargarProyecto();
    }, []);

    const handleEnviarSeguimiento = async () => {
        if (!proyecto?.idSeg) {
            alert("No se encontró el ID de seguimiento.");
            return;
        }

        try {
            const { data: seguimiento } = await axios.get(`${API_BASE_URL}/seguimientos/${proyecto.idSeg}`);

            const seguimientoModificado = {
                ...seguimiento,
                estadoseg: 2,
                fechaenvioseg: new Date().toISOString().split('T')[0]
            };

            await axios.put(`${API_BASE_URL}/seguimientos/${proyecto.idSeg}`, seguimientoModificado);

            alert("Seguimiento enviado exitosamente.");
            navigate(-1)
        } catch (error) {
            console.error("Error al enviar seguimiento:", error);
            alert("Ocurrió un error al enviar el seguimiento.");
        }
    };

    const [archivos, setArchivos] = useState([]);
    const [loadingArchivos, setLoadingArchivos] = useState(true);
    const [nuevoArchivo, setNuevoArchivo] = useState(null);
    const [observacionArchivo, setObservacionArchivo] = useState("");

    useEffect(() => {
        const fetchArchivos = async () => {
            if (!proyecto?.idSeg) return;
            setLoadingArchivos(true);
            try {
                const res = await axios.get(`${API_BASE_URL}/archivos`);
                const archivosSeguimiento = res.data.filter(a => String(a.seguimiento) === String(proyecto.idSeg) && a.idactividad === 0);
                setArchivos(archivosSeguimiento);
            } catch (error) {
                console.error("Error cargando archivos:", error);
            } finally {
                setLoadingArchivos(false);
            }
        };
        fetchArchivos();
    }, [proyecto?.idSeg]);

    const handleArchivoSeleccionado = (e) => {
        setNuevoArchivo(e.target.files[0]);
    };

    const handleGuardarArchivo = async () => {
        if (!nuevoArchivo) {
            alert("Seleccione un archivo");
            return;
        }

        const formData = new FormData();
        formData.append("file", nuevoArchivo);
        formData.append("idproyecto", proyecto.idproyecto);
        formData.append("idactividad", 0);
        formData.append("observacion", observacionArchivo || "");
        formData.append("seguimiento", proyecto.idSeg);

        try {
            const res = await axios.post(`${API_BASE_URL}/archivos/upload`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setArchivos(prev => [...prev, res.data]);
            setNuevoArchivo(null);
            setObservacionArchivo("");
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



    if (loading) return <CircularProgress />;

    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading='Seguimiento'
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Seguimiento proyectos', href: paths.dashboard.gestion.gestionProyectosSeguimiento },
                    { name: 'Seguimiento' },
                ]}
                sx={{ mb: { xs: 3, md: 5 } }}
            />

            <Box sx={{ p: 2 }}>
                {proyecto && proyectoDetalle && (
                    <Box sx={{ backgroundColor: '#fff', p: 4, borderRadius: 3, boxShadow: 3, mb: 4 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}><Typography><strong>ID SEGUIMIENTO:</strong> {proyecto.idSeg}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>ID:</strong> {proyecto.idproyecto}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>Nombre:</strong> {proyecto.nombrepr}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>Plan:</strong> {getNombrePorId(planes, proyectoDetalle.idplan)}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>SNIES:</strong> {getNombrePorId(snies, proyectoDetalle.SNIESpr)}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>Unidad Ejecutora:</strong> {getNombrePorId(unidadejecutora, proyectoDetalle.unidadejecutora)}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>Director:</strong> {getNombrePorStr(responsables, proyectoDetalle.ccdirectorpr)}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>Responsable:</strong> {getNombrePorStr(responsables, proyectoDetalle.ccresponsablepr)}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>Fecha Inicio:</strong> {proyectoDetalle.fechainipr}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>Fecha Fin:</strong> {proyectoDetalle.fechafinpr}</Typography></Grid>
                            <Grid item xs={12} md={6}><Typography><strong>Fecha de Creación:</strong> {proyectoDetalle.fechacrea}</Typography></Grid>
                        </Grid>
                    </Box>
                )}

                {proyecto && (
                    <form>
                        <Accordion>
                            <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                                <Typography variant="h6">Seguimiento general del proyecto</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <SeguimientoGeneral idSeguimiento={proyecto.idSeg} />
                                <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    <input type="file" onChange={e => setNuevoArchivo(e.target.files[0])} />
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

                                { }
                                {loadingArchivos ? (
                                    <CircularProgress />
                                ) : archivos.length === 0 ? (
                                    <Typography>No hay archivos registrados para este seguimiento</Typography>
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
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                                <Typography variant="h6">Seguimiento actividades</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <SeguimientoActividades onPersonalUpdated={() => setRefreshEjecucion(prev => prev + 1)} idSeguimiento={proyecto.idSeg} idProyecto={proyecto.idproyecto} />
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                                <Typography variant="h6">Seguimiento de metas e indicadores</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <SeguimientoMetas idSeguimiento={proyecto.idSeg} idProyecto={proyecto.idproyecto} />
                            </AccordionDetails>
                        </Accordion>



                        { }
                        <Accordion>
                            <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                                <Typography variant="h6">Ejecución presupuestal</Typography>
                            </AccordionSummary>
                            <AccordionDetails>

                                <EjecucionPresupuestal refreshTrigger={refreshEjecucion} idSeguimiento={proyecto.idSeg} />

                            </AccordionDetails>
                        </Accordion>

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                            {proyecto.estadoSeg === "continuar seguimiento" && (
                                <Button variant="contained" color="primary" onClick={handleEnviarSeguimiento}>
                                    Enviar Seguimiento
                                </Button>
                            )}

                            {seguimientoAnterior && (
                                <Button variant="outlined" color="secondary" sx={{ ml: 2 }} onClick={() => setModalOpen(true)}>
                                    Ver Seguimiento Anterior
                                </Button>
                            )}
                        </Box>
                    </form>
                )}

                {seguimientoAnterior !== undefined && seguimientoAnterior !== null ?


                    < Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90%',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                        }}>
                            <IconButton
                                aria-label="close"
                                onClick={() => setModalOpen(false)}
                                sx={{ position: 'absolute', right: 8, top: 8 }}
                            >
                                <CloseCircle size="24" variant="Bold" color="#555" />
                            </IconButton>

                            <Typography variant="h6" gutterBottom>
                                Seguimiento anterior - {seguimientoAnterior?.fechaseg}
                            </Typography>

                            <Accordion defaultExpanded>
                                <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />}>
                                    <Typography variant="h6">SEGUIMIENTO GENERAL DEL PROYECTO</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <SeguimientoGeneralTerminado idSeguimiento={seguimientoAnterior.idseguimiento} />
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />}>
                                    <Typography variant="h6">SEGUIMIENTO ACTIVIDADES</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <SeguimientoActividadesTerminado idSeguimiento={seguimientoAnterior.idseguimiento} idProyecto={proyecto.idproyecto} />
                                </AccordionDetails>
                            </Accordion>

                            <Accordion>
                                <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />}>
                                    <Typography variant="h6">SEGUIMIENTO DE METAS E INDICADORES</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <SeguimientoMetasTerminado idSeguimiento={seguimientoAnterior.idseguimiento} idProyecto={proyecto.idproyecto} />
                                </AccordionDetails>
                            </Accordion>
                        </Box>
                    </Modal>
                    :
                    <></>
                }
            </Box>
        </DashboardContent >
    );
};

export default FormularioSeguimiento;
