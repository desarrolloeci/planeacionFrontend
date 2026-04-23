import { API_BASE_URL } from 'src/config/api';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { useNavigate } from 'react-router';
import React, { useEffect, useState } from 'react';
import { ArrowDown2, ArrowLeft } from 'iconsax-react';
import { getStorage, getStorage as getStorageValue } from 'minimal-shared/utils';

import { Box, Typography, Grid, Paper, Button, Modal, Collapse } from '@mui/material';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';
import responsablesLocal from 'src/assets/data/responsables.json';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import DetalleActividad from './DetalleActividad';
import EjecucionPresupuestal from './EjecucionPresupuestal';
import AccionesAdministrador from './AccionesAdministrador';
import SeguimientoMetasTerminado from './SeguimientoMetasTerminado';
import SeguimientoGeneralTerminado from './SeguimientoGeneralTerminado';
import SeguimientoActividadesTerminado from './SeguimientoActividadesTerminado';
import { toast } from 'sonner';

export default function DetalleSeguimiento() {

    const navigate = useNavigate();

    const [openDetallesActividad, setOpenDetallesActividad] = useState({});

    const toggleDetalleActividad = (idactividad) => {
        setOpenDetallesActividad(prev => ({
            ...prev,
            [idactividad]: !prev[idactividad]
        }));
    };

    const handleVolver = () => {
        navigate(-1);
    };

    const [proyecto, setProyecto] = useState(null);
    const [loading, setLoading] = useState(true);
    var sumaErogacion = 0;
    var sumaPersonal = 0;
    var sumaTotal = 0;

    const planes = JSON.parse(getStorage("planesList"))
    const estados = JSON.parse(getStorage("estadosGenList"))
    const snies = [{ id: 1, name: "Administrativo y operación" }];
    const unidadejecutora = JSON.parse(getStorage("unidadesList"))
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

    const [modalOpen, setModalOpen] = useState(false);
    const [seguimientoSeleccionado, setSeguimientoSeleccionado] = useState(null);

    const seguimientosList = JSON.parse(getStorage("seguimientosList") || "[]");

    const handleOpenModal = (seguimiento) => {
        setSeguimientoSeleccionado(seguimiento);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSeguimientoSeleccionado(null);
    };

    const getEstadoResumen = (estadoseg) => (
        estadoseg === 2 ? 'Terminado' : 'Incompleto'
    );

    const ejes = JSON.parse(getStorage("ejesList"))

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

    const getNombrePorSec = (lista, id) => {


        const encontrado = lista.find(item => item.secuencial === Number(id));

        return encontrado ? encontrado.name : '-';
    };

    const [erogacionesPorActividad, setErogacionesPorActividad] = useState({});


    const fetchErogaciones = async (idactividad) => {
        try {
            const response = await fetch(`${API_BASE_URL}/erogacion-pl/actividad/${idactividad}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error al obtener erogaciones para actividad ${idactividad}:`, error);
            return [];
        }
    };

    useEffect(() => {
        const cargarProyecto = async () => {
            try {
                const data = await JSON.parse(getStorageValue('proyectoParaEditar'));
                if (data !== null) {
                    setProyecto(data);

                    const erogacionesData = {};
                    for (const act of data.actividades || []) {
                        const erogaciones = await fetchErogaciones(act.idactividad);
                        erogacionesData[act.idactividad] = erogaciones;
                    }
                    setErogacionesPorActividad(erogacionesData);
                }
            } catch (error) {
                console.error('Error al cargar el proyecto:', error);
            } finally {
                setLoading(false);
            }
        };

        cargarProyecto();
    }, []);

    const exportarPDF = async () => {
        try {
            const url = `${API_BASE_URL}/reportes/presupuesto/${proyecto.idproyecto}`



            const response = await fetch(`${url}`, {
                method: "GET",
                headers: { Accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            });

            if (!response.ok) throw new Error("Error al generar el reporte");

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Resumen del proyecto.xlsx";
            link.click();
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error generando el reporte");
        } finally {
            console.log("error")
        }
    };

    const exportarExcel = async () => {

        try {
            const url = `${API_BASE_URL}/reportes/excel/proyecto/${proyecto.idproyecto}`



            const response = await fetch(`${url}`, {
                method: "GET",
                headers: { Accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            });

            if (!response.ok) throw new Error("Error al generar el reporte");

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "Resumen del proyecto.xlsx";
            link.click();
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error generando el reporte");
        } finally {
            console.log("error")
        }
    };




    if (loading) return <p>Cargando...</p>;
    if (!proyecto) return <p>No se encontró el proyecto.</p>;

    const tdStyle = { border: '1px solid #ccc', padding: '8px' };



    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Detalle proyecto"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: "Detalle proyecto" },
                ]}

                sx={{ mb: { xs: 3, md: 5 } }}
            />
            <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
                <Button
                    variant="outlined"
                    color="secondary"
                    startIcon={<ArrowLeft size="20" />}
                    onClick={handleVolver}
                >
                    Volver
                </Button>
                <Button variant="contained" color="primary" onClick={exportarExcel}>
                    Generar resumen del proyecto
                </Button>
                <Button variant="contained" color="primary" onClick={exportarPDF}>
                    Generar detalle de presupuesto
                </Button>
            </Box>
            <Paper sx={{ p: 4 }} id="detalle-proyecto-pdf">
                { }
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />}>
                        <Typography variant="h6">Datos Básicos</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={12}><strong>ID:</strong> {proyecto.idproyecto}</Grid>
                            <Grid item xs={12} md={6}><strong>Nombre:</strong> {proyecto.nombrepr}</Grid>
                            <Grid item xs={12} md={6}><strong>Estado:</strong> {getNombrePorSec(estados, proyecto.estadopr)}</Grid>
                            <Grid item xs={12} md={6}><strong>Plan:</strong> {getNombrePorId(planes, proyecto.idplan)}</Grid>
                            <Grid item xs={12} md={6}><strong>SNIES:</strong> {getNombrePorId(snies, proyecto.SNIESpr)}</Grid>
                            <Grid item xs={12} md={6}><strong>Unidad Ejecutora:</strong> {getNombrePorId(unidadejecutora, proyecto.unidadejecutora)}</Grid>
                            <Grid item xs={12} md={6}><strong>Director:</strong> {getNombrePorStr(responsables, proyecto.ccdirectorpr)}</Grid>
                            <Grid item xs={12} md={6}><strong>Responsable:</strong> {getNombrePorStr(responsables, proyecto.ccresponsablepr)}</Grid>
                            <Grid item xs={12} md={6}><strong>Fecha Inicio:</strong> {proyecto.fechainipr}</Grid>
                            <Grid item xs={12} md={6}><strong>Fecha Fin:</strong> {proyecto.fechafinpr}</Grid>
                            <Grid item xs={12} md={6}><strong>Fecha de Creación:</strong> {proyecto.fechacrea}</Grid>
                        </Grid>
                    </AccordionDetails>
                </Accordion>

                { }
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6">Justificación</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>{proyecto.justificacionpr || '-'}</Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6">Objetivos</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography>
                            <strong>General:</strong>{" "}
                            {proyecto.objetivos?.find(item => item.tipoob === 1)?.descripcionob || '-'}
                        </Typography>
                        <Typography><strong>Específicos:</strong></Typography>
                        <ul>
                            {proyecto.objetivos?.filter(item => item.tipoob === 2).length > 0 ? (
                                proyecto.objetivos
                                    .filter(item => item.tipoob === 2)
                                    .map((o, i) => <li key={i}>{o.descripcionob}</li>)
                            ) : (
                                <li>No hay objetivos específicos registrados</li>
                            )}
                        </ul>
                    </AccordionDetails>
                </Accordion>

                { }
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6">Metas</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <ul>
                            {proyecto.objetivos?.filter(item => item.tipoob === 3).length > 0 ? (
                                proyecto.objetivos
                                    .filter(item => item.tipoob === 3)
                                    .map((o, i) => <li key={i}>{o.descripcionob}</li>)
                            ) : (
                                <li>No hay metas registradas</li>
                            )}
                        </ul>
                    </AccordionDetails>
                </Accordion>

                { }
                {proyecto.indicadores?.length > 0 && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Indicadores</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={tdStyle}>Nombre</th>
                                        <th style={tdStyle}>Periodicidad</th>
                                        <th style={tdStyle}>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proyecto.indicadores.map((ind, i) => (
                                        <tr key={i}>
                                            <td style={tdStyle}>{ind.nombreind}</td>
                                            <td style={tdStyle}>{ind.periodicidadind}</td>
                                            <td style={tdStyle}>{ind.descripcioncal}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </AccordionDetails>
                    </Accordion>
                )}

                { }
                { }
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6">Actividades</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {proyecto.actividades?.map((act) => (
                            <Accordion key={act.idactividad} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#EB2F2F' }}>
                                    <Typography variant="subtitle1">{act.nombreact}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography><strong>Fechas:</strong> {act.fechainiact} a {act.fechafinact}</Typography>
                                    <Typography><strong>Descripción:</strong> {act.descripcionact || '-'}</Typography>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => toggleDetalleActividad(act.idactividad)}
                                        sx={{ mt: 1, mb: 2 }}
                                    >
                                        {openDetallesActividad[act.idactividad] ? 'Ocultar detalles' : 'Ver detalles'}
                                    </Button>

                                    <Collapse in={openDetallesActividad[act.idactividad]}>
                                        <DetalleActividad actividad={act} />
                                    </Collapse>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </AccordionDetails>
                </Accordion>

                { }
                {proyecto.archivos?.length > 0 && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Documentos Adjuntos</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={tdStyle}>#</th>
                                        <th style={tdStyle}>Nombre Archivo</th>
                                        <th style={tdStyle}>Observación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proyecto.archivos.map((doc, i) => (
                                        <tr key={i}>
                                            <td style={tdStyle}>{i + 1}</td>
                                            <td style={tdStyle}>{doc.nombreorig}</td>
                                            <td style={tdStyle}>{doc.observacion}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </AccordionDetails>
                    </Accordion>
                )}

                { }
                {proyecto.ejes?.length > 0 && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Ejes Estratégicos Seleccionados</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {proyecto.ejes.map((item, i) => (
                                <Box key={i} mt={2}>
                                    <Typography><strong>Eje:</strong> {ejes.find(item2 => item2.id === item.idejeprograma).name}</Typography>
                                    <Typography><strong>Objetivo:</strong></Typography>
                                    <Typography>{ejes.find(item2 => item2.id === item.idejeprograma).objective}</Typography>
                                </Box>
                            ))}
                        </AccordionDetails>
                    </Accordion>
                )}

                { }
                {proyecto.factores?.length > 0 && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Factores de Evaluación</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={tdStyle}>Fin</th>
                                        <th style={tdStyle}>Factor</th>
                                        <th style={tdStyle}>Característica</th>
                                        <th style={tdStyle}>Eje Relacionado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {proyecto.factores.map((item, i) => (
                                        <tr key={i}>
                                            <td style={tdStyle}>{item.idfin}</td>
                                            <td style={tdStyle}>{item.idfactor}</td>
                                            <td style={tdStyle}>{item.nombrecaract}</td>
                                            <td style={tdStyle}>{ejes.find(item2 => item2.id === item.eje).name}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </AccordionDetails>
                    </Accordion>
                )}

                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6">Resumen de Presupuesto del Proyecto</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                            <thead>
                                <tr>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', background: '#f0f0f0' }}>Actividades / Año</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', background: '#f0f0f0' }}>SubTotal Dedicación</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', background: '#f0f0f0' }}>SubTotal Erogación</th>
                                    <th style={{ border: '1px solid #ccc', padding: '8px', background: '#f0f0f0' }}>Total Actividad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {


                                    proyecto.actividades?.map((act, idx) => {
                                        const totalDedicacion = act.totalDedicacion || 0;
                                        const totalErogacion = erogacionesPorActividad[act.idactividad]?.reduce((sum, e) => sum + (e.valor || 0), 0) || 0;
                                        const totalActividad = totalDedicacion + totalErogacion;

                                        sumaErogacion += totalErogacion;
                                        sumaPersonal += totalDedicacion;
                                        sumaTotal += totalActividad;

                                        return (
                                            <tr key={idx}>
                                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>{act.nombreact}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>${totalDedicacion.toLocaleString()}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '8px' }}>${totalErogacion.toLocaleString()}</td>
                                                <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>${totalActividad.toLocaleString()}</td>
                                            </tr>
                                        );
                                    })}
                                <tr>
                                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>Total</td>
                                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>
                                        ${sumaPersonal.toLocaleString()}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>
                                        ${sumaErogacion.toLocaleString()}
                                    </td>
                                    <td style={{ border: '1px solid #ccc', padding: '8px', fontWeight: 'bold' }}>
                                        ${sumaTotal.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </AccordionDetails>
                </Accordion>

                { }
                {seguimientosList?.filter(seg => seg.idproyecto === proyecto.idproyecto).length > 0 && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Historial de Seguimientos</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={tdStyle}>ID Seg.</th>
                                        <th style={tdStyle}>Fecha de Seguimiento</th>
                                        <th style={tdStyle}>Estado</th>
                                        <th style={tdStyle}>Avance (%)</th>
                                        <th style={tdStyle}>Detalle</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {seguimientosList
                                        .filter(seg => seg.idproyecto === proyecto.idproyecto)
                                        .map((seg, idx) => (
                                            <tr key={idx}>
                                                <td style={tdStyle}>{seg.idseguimiento}</td>
                                                <td style={tdStyle}>{seg.fechaseg}</td>
                                                <td style={tdStyle}>{getEstadoResumen(seg.estadoseg)}</td>

                                                <td style={tdStyle}>{seg.prcntavanceproyseg}%</td>
                                                <td style={tdStyle}>
                                                    <Button variant="outlined" size="small" onClick={() => handleOpenModal(seg)}>
                                                        Ver
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table>
                        </AccordionDetails>
                    </Accordion>
                )}


            </Paper>

            <AccionesAdministrador proyecto={proyecto} />

            {seguimientoSeleccionado !== null ?
                <Modal open={modalOpen} onClose={handleCloseModal}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            maxHeight: '90vh',
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: 2,
                            overflowY: 'auto',
                        }}
                    >
                        <Accordion defaultExpanded>
                            <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />}>
                                <Typography variant="h6">SEGUIMIENTO GENERAL DEL PROYECTO</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <SeguimientoGeneralTerminado idSeguimiento={seguimientoSeleccionado.idseguimiento} />
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />}>
                                <Typography variant="h6">SEGUIMIENTO ACTIVIDADES</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <SeguimientoActividadesTerminado idSeguimiento={seguimientoSeleccionado.idseguimiento} idProyecto={proyecto.idproyecto} />
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />}>
                                <Typography variant="h6">SEGUIMIENTO DE METAS E INDICADORES</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <SeguimientoMetasTerminado idSeguimiento={seguimientoSeleccionado.idseguimiento} idProyecto={proyecto.idproyecto} />
                            </AccordionDetails>
                        </Accordion>

                        { }
                        <Accordion>
                            <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />}>
                                <Typography variant="h6">EJECUCIÓN PRESUPUESTAL</Typography>
                            </AccordionSummary>
                            <AccordionDetails>

                                <EjecucionPresupuestal idSeguimiento={seguimientoSeleccionado.idseguimiento} />

                            </AccordionDetails>
                        </Accordion>

                        <Box mt={2} display="flex" justifyContent="flex-end">
                            <Button variant="contained" onClick={handleCloseModal}>Cerrar</Button>
                        </Box>
                    </Box>
                </Modal>
                :
                <></>
            }

        </DashboardContent>
    );
}
