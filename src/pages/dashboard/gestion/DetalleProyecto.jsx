import { API_BASE_URL } from 'src/config/api';
import jsPDF from 'jspdf';
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import html2canvas from 'html2canvas';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router';
import React, { useEffect, useState } from 'react';
import { ArrowDown2, ArrowLeft, DocumentDownload, Trash } from 'iconsax-react';
import { getStorage, getStorage as getStorageValue } from 'minimal-shared/utils';

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Modal,
    IconButton,
    TableContainer,
    Divider
} from '@mui/material';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,

    Table as WTable,
    TableRow as WTableRow,
    TableCell as WTableCell,

    WidthType,
    BorderStyle,
    AlignmentType,
    VerticalAlign,
    HeadingLevel
} from "docx";
import { Box, Typography, Grid, Paper, Button, Collapse, TableRow, Table, TableHead, TableCell, TableBody } from '@mui/material';

import { paths } from 'src/routes/paths';

import sniesLocal from 'src/assets/data/snies.json';
import { DashboardContent } from 'src/layouts/dashboard';
import responsablesLocal from 'src/assets/data/responsables.json';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import DetalleActividad from './DetalleActividad';
import AccionesAdministrador from './AccionesAdministrador';
import EjecucionPresupuestal from './EjecucionPresupuestal';
import SeguimientoMetasTerminado from './SeguimientoMetasTerminado';
import SeguimientoGeneralTerminado from './SeguimientoGeneralTerminado';
import SeguimientoActividadesTerminado from './SeguimientoActividadesTerminado';
import { toast } from 'sonner';

export default function DetalleProyecto() {

    const rojoHeader = '#8B0000';
    const rojoTotal = '#7A0000';
    const grisFila = '#F7F7F7';

    const [openDetallesActividad, setOpenDetallesActividad] = useState({});
    const rubros = JSON.parse(getStorage("rubrosList"));

    const [modalOpen, setModalOpen] = useState(false);
    const [modalResumenOpen, setModalResumenOpen] = useState(false);
    const [modalResumen, setModalResumen] = useState(false);
    const [modalPresupuestoPlaneadoOpen, setModalPresupuestoPlaneadoOpen] = useState(false);

    const [dedicaciones, setDedicaciones] = useState();
    const [erogaciones, setErogaciones] = useState();
    const [indicadoresAct, setIndicadoresAct] = useState();

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




    const usuario = JSON.parse(getStorage("user"));
    const esGestionador = usuario?.perfil === 'Gestionador';

    const API_URL = `${API_BASE_URL}/proyectos`;

    const cargarDetalleActividad = async (idactividad) => {




        try {

            const resPersonal = await fetch(`${API_BASE_URL}/personal/actividad/${idactividad}`);
            const personalList = await resPersonal.json();



            const personalConDatos = await Promise.all(
                personalList.map(async (p) => {
                    const resHoras = await fetch(
                        `${API_BASE_URL}/horas-personal/personal/${p.idpersonal}`
                    );
                    const horasList = await resHoras.json();


                    const resDedicacion = await fetch(
                        `${API_BASE_URL}/dedicacion-semanal/actividad/${idactividad}/personal/${p.idpersonal}`
                    );
                    const dedicacionList = await resDedicacion.json();

                    return {
                        ...p,
                        horas: horasList || [],
                        dedicaciones: dedicacionList || [],
                    };
                })
            );


            const resErog = await fetch(`${API_BASE_URL}/erogacion-pl/actividad/${idactividad}`);
            const erogList = await resErog.json();


            const resInd = await fetch(`${API_BASE_URL}/indicadores/actividad/${idactividad}`);
            const indList = await resInd.json();




            setDedicaciones(prev => ({ ...prev, [idactividad]: personalConDatos }));
            setErogaciones(prev => ({ ...prev, [idactividad]: erogList }));
            setIndicadoresAct(prev => ({ ...prev, [idactividad]: indList }));

        } catch (error) {
            console.error('Error cargando detalle actividad', error);
        }
    };






    const fetchProyecto = async (id) => {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) throw new Error("Error al obtener el proyecto");
        return await response.json();
    };



    const updateProyecto = async (proyectoActualizado) => {
        const response = await fetch(`${API_URL}/${proyectoActualizado.idproyecto}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(proyectoActualizado),
        });
        if (!response.ok) throw new Error("Error al actualizar el proyecto");
        return await response.json();
    };


    const handleIniciarEjecucion = async () => {
        try {
            const proyectoData = await fetchProyecto(proyecto.idproyecto);


            const historialPrevio = proyectoData.observacionadmin || "";


            const fechaHoy = new Date().toLocaleString('es-CO');
            const nuevaEntrada = `[${fechaHoy}] - Sistema: Se ha iniciado la ejecución del proyecto.`;


            const historialActualizado = historialPrevio
                ? `${historialPrevio}\n${nuevaEntrada}`
                : nuevaEntrada;

            const proyectoActualizado = {
                ...proyectoData,
                estadopr: 5,
                observacionadmin: historialActualizado,
            };

            await updateProyecto(proyectoActualizado);
            navigate(-1);
        } catch (error) {
            console.error("Error al iniciar ejecución:", error);
            alert("Hubo un error al iniciar la ejecución del proyecto.");
        }
    };




    const handleFinalizarProyecto = async () => {
        try {
            const proyectoData = await fetchProyecto(proyecto.idproyecto);


            const historialPrevio = proyectoData.observacionadmin || "";
            const fechaHoy = new Date().toLocaleString('es-CO');
            const nuevaEntrada = `[${fechaHoy}] - Sistema: El proyecto ha sido finalizado.`;

            const historialActualizado = historialPrevio
                ? `${historialPrevio}\n${nuevaEntrada}`
                : nuevaEntrada;

            const proyectoActualizado = {
                ...proyectoData,
                estadopr: 6,
                observacionadmin: historialActualizado,
            };

            await updateProyecto(proyectoActualizado);
            navigate(-1);
        } catch (error) {
            console.error("Error al finalizar proyecto:", error);
            alert("Hubo un error al finalizar el proyecto.");
        }
    };

    const handleEnviarODI = async () => {
        try {
            const proyectoData = await fetchProyecto(proyecto.idproyecto);


            const historialPrevio = proyectoData.observacionadmin || "";
            const fechaHoy = new Date().toLocaleString('es-CO');
            const nuevaEntrada = `[${fechaHoy}] - Sistema: Se envía a la ODI para revisión.`;

            const historialActualizado = historialPrevio
                ? `${historialPrevio}\n${nuevaEntrada}`
                : nuevaEntrada;

            const proyectoActualizado = {
                ...proyectoData,
                estadopr: 45,
                observacionadmin: historialActualizado,
            };

            await updateProyecto(proyectoActualizado);
            navigate(-1);
        } catch (error) {
            console.error("Error al actualizar proyecto:", error);
            alert("Hubo un error al actualizar el proyecto.");
        }
    };
    const navigate = useNavigate();

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
    const [snies, setSnies] = useState([]);
    const unidadejecutora = JSON.parse(getStorage("unidadesList"))
    const [responsables, setResponsables] = useState([]);

    const [archivos, setArchivos] = useState([]);
    const [loadingArchivos, setLoadingArchivos] = useState(true);



    useEffect(() => {
        const fetchArchivosProyecto = async () => {
            if (!proyecto?.idproyecto) return;
            try {
                setLoadingArchivos(true);
                const res = await fetch(`${API_BASE_URL}/archivos`);
                const data = await res.json();
                const archivosProyecto = data.filter(
                    (a) =>
                        String(a.idproyecto) === String(proyecto.idproyecto) &&
                        Number(a.idactividad) === 0 &&
                        Number(a.seguimiento) === 0
                );
                setArchivos(archivosProyecto);
            } catch (error) {
                console.error("Error cargando archivos del proyecto:", error);
            } finally {
                setLoadingArchivos(false);
            }
        };

        fetchArchivosProyecto();
    }, [proyecto?.idproyecto])


    const ejes = JSON.parse(getStorage("ejesList"))

    const fetchResponsables = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/responsables`);
            if (!response.ok) throw new Error("Error al obtener responsables");
            const data = await response.json();
            if (data && data.length > 0) {
                setResponsables(data);
            } else {
                setResponsables(responsablesLocal);
            }
        } catch (error) {
            console.warn("Usando archivo local de responsables:", error);
            setResponsables(responsablesLocal);
        }
    };

    const fetchSnies = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/snies`);
            if (!response.ok) throw new Error("Error al obtener SNIES");
            const data = await response.json();
            if (data && data.length > 0) {
                setSnies(data);
            } else {
                setSnies(sniesLocal);
            }
        } catch (error) {
            console.warn("Usando archivo local de SNIES:", error);
            setSnies(sniesLocal);
        }
    };

    const getNombrePorId = (lista, id) => {


        const encontrado = lista.find(item => item.id === Number(id));

        return encontrado ? encontrado.name : '-';
    };

    const getNombrePorStr = (lista, id) => {
        if (!lista || lista.length === 0 || !id) return '-';
        const encontrado = lista.find(item =>
            String(item.cod_emp).trim() === String(id).trim()
        );
        return encontrado ? encontrado.nombres : '-';
    };


    const getNombrePorSec = (lista, id) => {




        const encontrado = lista.find(item => item.id === Number(id));

        return encontrado ? encontrado.name : '-';
    };

    const [erogacionesPorActividad, setErogacionesPorActividad] = useState({});
    const [dedicacionPorActividad, setDedicacionPorActividad] = useState({});


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

    const fetchDedicaciones = async (idactividad) => {
        try {

            const resPersonal = await fetch(`${API_BASE_URL}/personal/actividad/${idactividad}`);
            const personalList = await resPersonal.json();

            const personalConDedicacion = await Promise.all(
                personalList.map(async (p) => {
                    try {

                        const resHoras = await fetch(
                            `${API_BASE_URL}/horas-personal/personal/${p.idpersonal}`
                        );
                        const horasList = await resHoras.json();


                        const totalHoras = horasList.reduce(
                            (s, h) => s + (Number(h.horas) || 0),
                            0
                        );

                        if (totalHoras === 0) return [];


                        return horasList.map(h => ({
                            agno: h.id.agno,
                            valor: Math.round(
                                ((Number(h.horas) || 0) / totalHoras) * (Number(p.valorprs) || 0)
                            )
                        }));

                    } catch (err) {
                        console.error(`Error procesando personal ${p.idpersonal}`, err);
                        return [];
                    }
                })
            );


            const dedicacionPorAnio = {};

            personalConDedicacion.flat().forEach(d => {
                dedicacionPorAnio[d.agno] =
                    (dedicacionPorAnio[d.agno] || 0) + d.valor;
            });

            return Object.entries(dedicacionPorAnio).map(([agno, valor]) => ({
                agno: Number(agno),
                valor
            }));

        } catch (error) {
            console.error(`Error al obtener dedicación para actividad ${idactividad}:`, error);
            return [];
        }
    };

    const toggleDetalleActividad = (idactividad) => {
        setOpenDetallesActividad(prev => ({
            ...prev,
            [idactividad]: !prev[idactividad]
        }));
    };

    const logoBase64 = "data:image/png;base64,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";

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

    const getNombreSnies = (lista, codigo) => {
        const encontrado = lista.find(item => Number(item.cod_cco) === Number(codigo));
        return encontrado ? encontrado.nom_cco : '-';
    };


    useEffect(() => {
        fetchResponsables();
        fetchSnies();

        const cargarProyecto = async () => {
            try {
                const data = await JSON.parse(getStorageValue('proyectoParaEditar'));
                if (data !== null) {

                    setProyecto(data);

                    data?.actividades?.forEach(act => {
                        cargarDetalleActividad(act.idactividad);
                    });

                    const erogacionesData = {};
                    for (const act of data.actividades || []) {
                        const erogaciones5 = await fetchErogaciones(act.idactividad);
                        erogacionesData[act.idactividad] = erogaciones5;
                    }

                    setErogacionesPorActividad(erogacionesData);

                    const dedicacionData = {};
                    for (const act of data.actividades || []) {
                        const dedicaciones1 = await fetchDedicaciones(act.idactividad);
                        dedicacionData[act.idactividad] = dedicaciones1;
                    }



                    setDedicacionPorActividad(dedicacionData)
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


    if (loading) return <p>Cargando...</p>;
    if (!proyecto) return <p>No se encontró el proyecto.</p>;

    const tdStyle = { border: '1px solid #ccc', padding: '8px' };


    const construirFilasPresupuesto = () => {
        const filas = [];

        Object.entries(erogacionesPorActividad).forEach(([idActividad, erogaciones4]) => {
            const actividad = proyecto.actividades.find(
                a => Number(a.idactividad) === Number(idActividad)
            );

            const rubrosAgrupados = {};

            erogaciones4.forEach(er => {
                if (!rubrosAgrupados[er.rubropl]) {
                    rubrosAgrupados[er.rubropl] = {
                        actividad: actividad?.nombreact || '-',
                        rubro: er.rubropl,
                        valores: {},
                        observacion: er.observacionpl || ''
                    };
                }

                rubrosAgrupados[er.rubropl].valores[er.agno] =
                    (rubrosAgrupados[er.rubropl].valores[er.agno] || 0) + er.valor;
            });

            Object.values(rubrosAgrupados).forEach(r => filas.push(r));
        });

        return filas;
    };

    const exportarExcelPresupuestoRubro = async () => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Presupuesto por Rubro');


        const years = new Set();
        Object.values(erogacionesPorActividad).forEach(e =>
            e.forEach(r => years.add(r.agno))
        );
        const yearsOrdenados = [...years].sort();

        const totalColumnas = 2 + yearsOrdenados.length + 2;


        const border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
        };


        sheet.addRow([]);

        const tituloRow = sheet.addRow(['Detalle del presupuesto por Rubro']);
        sheet.mergeCells(tituloRow.number, 1, tituloRow.number, totalColumnas);
        tituloRow.getCell(1).font = { bold: true, size: 14 };
        tituloRow.getCell(1).alignment = { horizontal: 'center' };

        const infoRow = sheet.addRow([
            `ID Proyecto: ${proyecto.idproyecto}   |   Nombre del Proyecto: ${proyecto.nombrepr}`
        ]);
        sheet.mergeCells(infoRow.number, 1, infoRow.number, totalColumnas);
        infoRow.getCell(1).alignment = { horizontal: 'center' };

        sheet.addRow([]);


        sheet.columns = [
            { width: 40 },
            { width: 30 },
            ...yearsOrdenados.map(() => ({ width: 18 })),
            { width: 35 },
            { width: 20 },
        ];


        const headerRow = sheet.addRow([
            'Actividad',
            'Rubro',
            ...yearsOrdenados.map(y => y.toString()),
            'Observación',
            'Total por actividad',
        ]);

        headerRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF7A0000' },
            };
            cell.alignment = { horizontal: 'center' };
            cell.border = border;
        });


        const filas = [];

        Object.entries(erogacionesPorActividad).forEach(([idActividad, erogaciones2]) => {
            const actividad = proyecto.actividades.find(
                a => Number(a.idactividad) === Number(idActividad)
            );

            const rubrosAgrupados = {};

            erogaciones2.forEach(er => {
                if (!rubrosAgrupados[er.rubropl]) {
                    rubrosAgrupados[er.rubropl] = {
                        actividad: actividad?.nombreact || '',
                        rubro: rubros.find(r => r.id === parseInt(er.rubropl))?.name || '',
                        valores: {},
                        observacion: er.observacionpl || '',
                    };
                }

                rubrosAgrupados[er.rubropl].valores[er.agno] =
                    (rubrosAgrupados[er.rubropl].valores[er.agno] || 0) + er.valor;
            });

            Object.values(rubrosAgrupados).forEach(r => filas.push(r));
        });

        const totalesPorAnio = {};
        yearsOrdenados.forEach(y => (totalesPorAnio[y] = 0));

        filas.forEach(f => {
            const row = sheet.addRow([
                f.actividad,
                f.rubro,
                ...yearsOrdenados.map(y => {
                    totalesPorAnio[y] += f.valores[y] || 0;
                    return f.valores[y] || 0;
                }),
                f.observacion,
                yearsOrdenados.reduce((s, y) => s + (f.valores[y] || 0), 0),
            ]);

            row.eachCell(cell => {
                cell.border = border;
                if (typeof cell.value === 'number') {
                    cell.numFmt = '#,##0';
                    cell.alignment = { horizontal: 'right' };
                }
            });
        });


        const totalRow = sheet.addRow([
            'Valores totales por año',
            '',
            ...yearsOrdenados.map(y => totalesPorAnio[y]),
            '',
            '',
        ]);

        totalRow.eachCell((cell, col) => {
            cell.border = border;
            cell.font = { bold: true };
            if (col > 2 && col <= 2 + yearsOrdenados.length) {
                cell.numFmt = '#,##0';
                cell.alignment = { horizontal: 'right' };
            }
        });


        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            }),
            'Detalle_presupuesto_por_rubro.xlsx'
        );
    };

    const getYears = () => {
        const years = new Set();

        Object.values(erogacionesPorActividad).forEach(lista =>
            lista.forEach(e => years.add(e.agno))
        );

        Object.values(dedicacionPorActividad).forEach(lista =>
            lista.forEach(d => years.add(d.agno))
        );

        return [...years].sort();
    };

    const getErogacion = (idActividad, anio) => {
        const lista = erogacionesPorActividad[idActividad] || [];
        return lista.find(e => e.agno === anio)?.valor || 0;
    };

    const getDedicacion = (idActividad, anio) => {
        const lista = dedicacionPorActividad[idActividad] || [];
        return lista.find(d => d.agno === anio)?.valor || 0;
    };

    const getNombreActividad = (idActividad) =>
        proyecto?.actividades?.find(
            act => Number(act.idactividad) === Number(idActividad)
        )?.nombreact || `Actividad ${idActividad}`;

    const getTotalErogacionAnio = (anio) =>
        Object.keys(erogacionesPorActividad).reduce(
            (sum, idActividad) => sum + getErogacion(idActividad, anio),
            0
        );


    const getTotalDedicacionAnio = (anio) =>
        Object.keys(erogacionesPorActividad).reduce(
            (sum, idActividad) => sum + getDedicacion(idActividad, anio),
            0
        );


    const exportarExcelPresupuestoPlaneado = async () => {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Presupuesto Planeado');

        const years = getYears();
        const totalColumnas = 1 + years.length * 2 + 3;


        const border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };



        worksheet.addRow([]);

        const tituloRow = worksheet.addRow(['Presupuesto Planeado del Proyecto']);
        worksheet.mergeCells(tituloRow.number, 1, tituloRow.number, totalColumnas);
        tituloRow.getCell(1).font = { bold: true, size: 14 };
        tituloRow.getCell(1).alignment = { horizontal: 'center' };

        const infoRow = worksheet.addRow([
            `ID Proyecto: ${proyecto?.idproyecto} | Nombre del Proyecto: ${proyecto?.nombrepr}`
        ]);
        worksheet.mergeCells(infoRow.number, 1, infoRow.number, totalColumnas);
        infoRow.getCell(1).alignment = { horizontal: 'center' };

        worksheet.addRow([]);



        worksheet.columns = [
            { width: 40 },
            ...years.flatMap(() => [
                { width: 20 },
                { width: 22 }
            ]),
            { width: 22 },
            { width: 22 },
            { width: 22 }
        ];



        const headerRow1 = ['Actividad / Año'];
        years.forEach(y => headerRow1.push(y, y));
        headerRow1.push('Subtotal', 'Subtotal', 'Total Actividad');

        const rowHeader1 = worksheet.addRow(headerRow1);

        const headerRow2 = [''];
        years.forEach(() =>
            headerRow2.push('Presupuesto Erogación', 'Dedicación Personal')
        );
        headerRow2.push(
            'Presupuesto Erogación',
            'Dedicación Personal',
            'Total Actividad'
        );

        const rowHeader2 = worksheet.addRow(headerRow2);


        worksheet.mergeCells(rowHeader1.number, 1, rowHeader2.number, 1);

        let colIndex = 2;
        years.forEach(() => {
            worksheet.mergeCells(rowHeader1.number, colIndex, rowHeader1.number, colIndex + 1);
            colIndex += 2;
        });

        worksheet.mergeCells(rowHeader1.number, colIndex, rowHeader1.number, colIndex + 1);
        worksheet.mergeCells(rowHeader1.number, colIndex + 2, rowHeader1.number, colIndex + 2);


        [rowHeader1, rowHeader2].forEach(row => {
            row.eachCell(cell => {
                cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF7A0000' }
                };
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
                cell.border = border;
            });
        });



        Object.keys(erogacionesPorActividad).forEach(idActividad => {
            const row = [];
            let subtotalErogacion = 0;
            let subtotalDedicacion = 0;

            row.push(getNombreActividad(idActividad));

            years.forEach(year => {
                const erogacion = getErogacion(idActividad, year);
                const dedicacion = getDedicacion(idActividad, year);

                subtotalErogacion += erogacion;
                subtotalDedicacion += dedicacion;

                row.push(erogacion, dedicacion);
            });

            row.push(subtotalErogacion, subtotalDedicacion);
            row.push(subtotalErogacion + subtotalDedicacion);

            const dataRow = worksheet.addRow(row);

            dataRow.eachCell(cell => {
                cell.border = border;
                if (typeof cell.value === 'number') {
                    cell.numFmt = '"$"#,##0';
                    cell.alignment = { horizontal: 'right' };
                }
            });
        });



        const totalRow = ['Valores totales del proyecto'];

        let totalErogacionProyecto = 0;
        let totalDedicacionProyecto = 0;

        years.forEach(year => {
            const te = getTotalErogacionAnio(year);
            const td = getTotalDedicacionAnio(year);

            totalErogacionProyecto += te;
            totalDedicacionProyecto += td;

            totalRow.push(te, td);
        });

        totalRow.push(totalErogacionProyecto, totalDedicacionProyecto);
        totalRow.push(totalErogacionProyecto + totalDedicacionProyecto);

        const totalRowExcel = worksheet.addRow(totalRow);

        totalRowExcel.eachCell(cell => {
            cell.font = { bold: true };
            cell.border = border;
            if (typeof cell.value === 'number') {
                cell.numFmt = '"$"#,##0';
                cell.alignment = { horizontal: 'right' };
            }
        });



        const buffer = await workbook.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            `Presupuesto_Planeado_Proyecto_${proyecto?.idproyecto}.xlsx`
        );
    };

    const exportarResumenProyectoExcel = async () => {
        const wb = new ExcelJS.Workbook();
        const ws = wb.addWorksheet('Resumen Proyecto');

        let row = 1;

        const addTitle = (text) => {
            ws.mergeCells(row, 1, row, 14);

            const titleCell = ws.getCell(row, 1);

            titleCell.value = text;
            titleCell.font = {
                bold: true,
                color: { argb: 'FFFFFFFF' }
            };

            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF7A0000' }
            };

            titleCell.alignment = {
                horizontal: 'center',
                vertical: 'middle'
            };

            row++;
        };

        const addKeyValue = (key, value) => {
            const keyCell = ws.getCell(row, 1);
            const valueCell = ws.getCell(row, 2);

            keyCell.value = key;
            valueCell.value = value ?? '-';

            keyCell.font = {
                bold: true,
                color: { argb: 'FFFFFFFF' }
            };

            keyCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF7A0000' }
            };

            row++;
        };

        const addKeyValues = (key, values = []) => {
            if (!values.length) return;

            const startRow = row;

            values.forEach((value, index) => {
                const keyCell = ws.getCell(row, 1);


                ws.mergeCells(row, 2, row, 14);
                const valueCell = ws.getCell(row, 2);

                if (index === 0) {
                    keyCell.value = key;
                    keyCell.font = {
                        bold: true,
                        color: { argb: 'FFFFFFFF' }
                    };
                    keyCell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FF7A0000' }
                    };
                    keyCell.alignment = {
                        vertical: 'top',
                        horizontal: 'left'
                    };
                }

                valueCell.value = value || '-';
                valueCell.alignment = {
                    wrapText: true,
                    vertical: 'top'
                };

                row++;
            });


            if (values.length > 1) {
                ws.mergeCells(startRow, 1, row - 1, 1);
            }
        };

        const addKeyValueLong = (key, value) => {
            const startRow = row;

            const keyCell = ws.getCell(row, 1);
            keyCell.value = key;
            keyCell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            keyCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF7A0000' }
            };
            keyCell.alignment = { vertical: 'top' };


            ws.mergeCells(row, 2, row, 14);
            const valueCell = ws.getCell(row, 2);
            valueCell.value = value || '-';
            valueCell.alignment = { wrapText: true, vertical: 'top' };

            row += 1;
        };

        addTitle('RESUMEN DEL PROYECTO');
        addKeyValueLong('ID Proyecto', proyecto.idproyecto);
        addKeyValueLong('Nombre del Proyecto', proyecto.nombrepr);


        addTitle('DATOS GENERALES');
        addKeyValueLong('Plan', getNombrePorId(planes, proyecto.idplan));
        addKeyValueLong('Responsable', getNombrePorStr(responsables, proyecto.ccresponsablepr));
        addKeyValueLong('Unidad Ejecutora', getNombrePorId(unidadejecutora, proyecto.unidadejecutora));
        addKeyValueLong('SNIES', getNombreSnies(snies, proyecto.sniespr));
        addKeyValueLong('Estado', getNombrePorSec(estados, proyecto.estadopr));

        addKeyValues(
            'OBJETIVOS',
            proyecto.objetivos
                .filter(o => o.tipoob !== 3)
                .map(o => `• ${o.descripcionob}`)
        );




        addKeyValues(
            'METAS',
            proyecto.objetivos
                .filter(o => o.tipoob === 3)
                .map(o => `• ${o.descripcionob}`)
        );

        addKeyValues(
            'INDICADORES DEL PROYECTO',
            proyecto.indicadores.map(i =>
                `Indicador: ${i.nombreind} | Periodicidad: ${i.periodicidadind} | Descripción: ${i.descripcioncal}`
            )
        );

        addKeyValueLong('JUSTIFICACIÓN', proyecto.justificacionpr);




        ws.columns = [
            { width: 12 },
            { width: 12 },
            { width: 30 },
            { width: 20 },

            { width: 18 },
            { width: 8 },
            { width: 8 },
            { width: 8 },

            { width: 18 },
            { width: 8 },
            { width: 14 },
            { width: 20 },
        ];

        row++;

        ws.mergeCells(`A${row}:M${row}`);
        const titleCell = ws.getCell(`A${row}`);

        titleCell.value = 'Actividades';
        titleCell.font = { bold: true, size: 14, color: { argb: 'FFFFFFFF' } };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        titleCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '8B0000' }
        };

        row++;


        ws.mergeCells(`F${row}:I${row}`);
        ws.mergeCells(`J${row}:M${row}`);


        ws.getCell(`A${row}`).value = 'Actividad';
        ws.getCell(`B${row}`).value = 'Fecha inicio';
        ws.getCell(`C${row}`).value = 'Fecha fin';
        ws.getCell(`D${row}`).value = 'Descripción';
        ws.getCell(`E${row}`).value = 'Responsable';

        ws.getCell(`G${row}`).value = 'Dedicación de personal';
        ws.getCell(`J${row}`).value = 'Erogación';


        const headerRow = ws.getRow(row);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '8B0000' }
        };

        row++;


        proyecto.actividades.forEach(act => {

            const ded = dedicaciones[act.idactividad] || [];
            const ero = erogaciones[act.idactividad] || [];
            const ind = indicadoresAct[act.idactividad] || [];

            const dedRows = ded.flatMap(d => d.horas?.map(h => ({ ...d, h })) || []);
            const maxRows = Math.max(dedRows.length, ero.length, ind.length, 1);

            const startRow = row;


            ws.getCell(`A${row}`).value = act.nombreact;
            ws.getCell(`B${row}`).value = act.fechainiact;
            ws.getCell(`C${row}`).value = act.fechafinact;
            ws.getCell(`D${row}`).value = act.descripcionact;
            ws.getCell(`E${row}`).value =
                getNombrePorStr(responsables, act.responsableact);

            ws.getCell(`F${row}`).value = 'Nombre /Cargo';
            ws.getCell(`G${row}`).value = 'Año';
            ws.getCell(`H${row}`).value = 'Horas';
            ws.getCell(`I${row}`).value = 'Cant';

            ws.getCell(`J${row}`).value = 'Rubro';
            ws.getCell(`K${row}`).value = 'Año';
            ws.getCell(`L${row}`).value = 'Valor';
            ws.getCell(`M${row}`).value = 'Observación';

            ws.getRow(row).font = { bold: true };
            ws.getRow(row).fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'EFEFEF' }
            };





            row++;


            for (let i = 0; i < maxRows; i++) {

                const d = dedRows[i];
                const e = ero[i];
                const x = ind[i];



                ws.addRow([
                    '', '', '', '', '',

                    d
                        ? (d.nombreparticpprs !== 'Sin definir'
                            ? getNombrePorStr(responsables, d.nombreparticpprs.trim())
                            : d.cargoparticprs)
                        : '',
                    d?.h?.id?.agno || '',
                    d?.h?.horas || '',
                    d?.h?.cantPer || '',

                    e ? rubros.find(r => r.id === parseInt(e.rubropl))?.name : '',
                    e?.agno || '',
                    e ? Number(e.valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP' }) : '',
                    e?.observacionpl || ''
                ]);

                row++;
            }


            ws.mergeCells(`A${startRow}:A${row - 1}`);
            ws.mergeCells(`B${startRow}:B${row - 1}`);
            ws.mergeCells(`C${startRow}:C${row - 1}`);
            ws.mergeCells(`D${startRow}:D${row - 1}`);


        });

        ws.eachRow(row1 => {
            row1.eachCell(cell => {
                cell.alignment = {
                    wrapText: true,
                    vertical: 'top'
                };
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });

        const buffer = await wb.xlsx.writeBuffer();
        saveAs(
            new Blob([buffer]),
            `Resumen_Proyecto_${proyecto.idproyecto}.xlsx`
        );
    };



    const exportarResumenProyectoWord = async () => {

        const borderNone = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
        const rojoInstitucional = "7A0000";


        const createHeaderCell = (text) => new WTableCell({
            children: [new Paragraph({
                children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
                alignment: AlignmentType.CENTER
            })],
            shading: { fill: rojoInstitucional },
            verticalAlign: VerticalAlign.CENTER,
        });


        const actividadesRows = [

            new WTableRow({
                children: [
                    new WTableCell({
                        children: [new Paragraph({
                            children: [new TextRun({ text: "ACTIVIDADES DEL PROYECTO", bold: true, size: 28, color: "FFFFFF" })],
                            alignment: AlignmentType.CENTER
                        })],
                        columnSpan: 7,
                        shading: { fill: "8B0000" },
                    })
                ]
            }),

            new WTableRow({
                children: [
                    createHeaderCell("Actividad"),
                    createHeaderCell("Inicio/Fin"),
                    createHeaderCell("Descripción"),
                    createHeaderCell("Responsable"),
                    createHeaderCell("Dedicación Pers."),
                    createHeaderCell("Erogación"),
                ]
            })
        ];


        proyecto.actividades.forEach(act => {
            const ded = dedicaciones[act.idactividad] || [];
            const ero = erogaciones[act.idactividad] || [];


            const dedText = ded.flatMap(d => d.horas?.map(h =>
                `• ${d.nombreparticpprs !== 'Sin definir' ? getNombrePorStr(responsables, d.nombreparticpprs) : d.cargoparticprs} (${h.id.agno}): ${h.horas}h`
            ) || []).join('\n');


            const eroText = ero.map(e => {
                const rubroNom = rubros.find(r => r.id === parseInt(e.rubropl))?.name || 'N/A';
                const valor = Number(e.valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
                return `• ${rubroNom} (${e.agno}): ${valor}`;
            }).join('\n');

            actividadesRows.push(new WTableRow({
                children: [
                    new WTableCell({ children: [new Paragraph(act.nombreact)] }),
                    new WTableCell({ children: [new Paragraph(`${act.fechainiact}\nal\n${act.fechafinact}`)] }),
                    new WTableCell({ children: [new Paragraph(act.descripcionact)] }),
                    new WTableCell({ children: [new Paragraph(getNombrePorStr(responsables, act.responsableact))] }),
                    new WTableCell({ children: [new Paragraph({ text: dedText || '-', spacing: { before: 100 } })] }),
                    new WTableCell({ children: [new Paragraph({ text: eroText || '-', spacing: { before: 100 } })] }),
                ]
            }));
        });


        const doc = new Document({
            sections: [{
                properties: {},
                children: [

                    new Paragraph({
                        text: "RESUMEN DEL PROYECTO",
                        heading: HeadingLevel.HEADING_1,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 }
                    }),


                    new Paragraph({ children: [new TextRun({ text: "ID Proyecto: ", bold: true }), new TextRun(proyecto.idproyecto.toString())] }),
                    new Paragraph({ children: [new TextRun({ text: "Nombre: ", bold: true }), new TextRun(proyecto.nombrepr)] }),
                    new Paragraph({ children: [new TextRun({ text: "Estado: ", bold: true }), new TextRun(getNombrePorSec(estados, proyecto.estadopr))] }),

                    new Paragraph({ text: "", spacing: { after: 200 } }),

                    new Paragraph({
                        text: "JUSTIFICACIÓN",
                        heading: HeadingLevel.HEADING_2,
                    }),
                    new Paragraph({
                        text: proyecto.justificacionpr,
                        alignment: AlignmentType.JUSTIFIED,
                        spacing: { after: 300 }
                    }),


                    new WTable({
                        columnWidths: [2000, 1500, 2500, 1500, 2500, 2500],
                        rows: actividadesRows,
                        width: { size: 100, type: WidthType.PERCENTAGE }
                    }),
                ],
            }],
        });


        const buffer = await Packer.toBlob(doc);
        saveAs(buffer, `Resumen_Proyecto_${proyecto.idproyecto}.docx`);
    };


    return (
        <DashboardContent>
            <CustomBreadcrumbs
                heading="Detalle proyecto"
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Proyectos activos', href: paths.dashboard.gestion.gestionProyectosActivos },
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
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModalResumen(true)}
                >
                    Ver resumen del proyecto
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => setModalResumenOpen(true)}
                >
                    Ver detalle por rubro
                </Button>
                <Button
                    variant="contained"
                    sx={{ bgcolor: rojoHeader, '&:hover': { bgcolor: rojoTotal } }}
                    onClick={() => setModalPresupuestoPlaneadoOpen(true)}
                >
                    Ver detalle presupuesto planeado
                </Button>


            </Box>
            <Paper sx={{ pb: 4 }} id="detalle-proyecto-pdf">
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
                            <Grid item xs={12} md={6}><strong>SNIES:</strong> {getNombreSnies(snies, proyecto.sniespr)}</Grid>
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
                        <Typography><strong>General:</strong> {proyecto.objetivos.find(item => item.tipoob === 1)?.descripcionob}</Typography>
                        <Typography><strong>Específicos:</strong></Typography>
                        <ul>
                            {proyecto.objetivos.filter(item => item.tipoob === 2).map((o, i) => <li key={i}>{o.descripcionob}</li>)}
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
                            {proyecto.objetivos.filter(item => item.tipoob === 3).map((o, i) => <li key={i}>{o.descripcionob}</li>)}
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
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Periodicidad</TableCell>
                                        <TableCell>Descripción</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {proyecto.indicadores.map((ind, i) => (
                                        <TableRow key={i}>
                                            <TableCell >{ind.nombreind}</TableCell>
                                            <TableCell >{ind.periodicidadind}</TableCell>
                                            <TableCell >{ind.descripcioncal}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionDetails>
                    </Accordion>
                )}

                { }
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6">Actividades</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        {proyecto.actividades?.map((act) => (
                            <Accordion key={act.idactividad} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#c46060ff' }}>
                                    <Typography variant="subtitle1">{act.nombreact}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography><strong>Fechas:</strong> {act.fechainiact.split("T")[0]} a {act.fechafinact.split("T")[0]}</Typography>
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
                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Documentos Adjuntos</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {loadingArchivos ? (
                                <Typography>Cargando archivos...</Typography>
                            ) : archivos.length === 0 ? (
                                <Typography>No hay documentos adjuntos para este proyecto.</Typography>
                            ) : (
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>#</TableCell>
                                            <TableCell>Nombre Archivo</TableCell>
                                            <TableCell>Observación</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {archivos.map((doc, i) => (
                                            <TableRow key={doc.idarchivo}>
                                                <TableCell>{i + 1}</TableCell>
                                                <TableCell>{doc.nombreorig}</TableCell>
                                                <TableCell>{doc.observacion}</TableCell>
                                                <TableCell align="right">
                                                    { }
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() =>
                                                            window.open(`${API_BASE_URL}/archivos/download/${doc.idarchivo}`, "_blank")
                                                        }
                                                    >
                                                        <DocumentDownload size={18} />
                                                    </IconButton>

                                                    { }
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={async () => {
                                                            if (!window.confirm("¿Desea eliminar este archivo?")) return;
                                                            try {
                                                                await fetch(`${API_BASE_URL}/archivos/${doc.idarchivo}`, {
                                                                    method: "DELETE",
                                                                });
                                                                setArchivos(prev => prev.filter(a => a.idarchivo !== doc.idarchivo));
                                                                toast.success("Archivo eliminado correctamente");
                                                            } catch (error) {
                                                                console.error("Error eliminando archivo:", error);
                                                                toast.error("No se pudo eliminar el archivo");
                                                            }
                                                        }}
                                                    >
                                                        <Trash size={18} />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </AccordionDetails>
                    </Accordion>
                )}

                { }
                {proyecto.ejes?.length > 0 && (
                    <Accordion>
                        <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                            <Typography variant="h6">Alineación institucional</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            {proyecto.ejes.map((item, i) => (
                                <Box key={i} mt={2}>
                                    <Typography><strong>Eje:</strong> {ejes.find(item2 => item2.id === item.idejeprograma).name}</Typography>
                                    <Typography><strong>Objetivo:</strong></Typography>
                                    <Typography>{ejes.find(item2 => item2.id === item.idejeprograma).objective}</Typography>
                                </Box>
                            ))}
                            <Divider />

                            <Typography variant="h6">Factores de Evaluación</Typography>

                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Fin</TableCell>
                                        <TableCell>Factor</TableCell>
                                        <TableCell>Característica</TableCell>
                                        <TableCell>Eje Relacionado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {proyecto.factores.map((item, i) => (
                                        <TableRow key={i}>
                                            <TableCell >{item.idfin}</TableCell>
                                            <TableCell >{item.idfactor}</TableCell>
                                            <TableCell >{item.nombrecaract}</TableCell>
                                            <TableCell >{ejes.find(item2 => item2.id === Number(item.eje)).name}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionDetails>
                    </Accordion>
                )}

                { }


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


                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" variant="Outline" />} sx={{ bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6">Resumen de Presupuesto del Proyecto</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell> Actividades / Año</TableCell>
                                    <TableCell> SubTotal Dedicación</TableCell>
                                    <TableCell> SubTotal Erogación</TableCell>
                                    <TableCell> Total Actividad</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {


                                    proyecto.actividades.map((act, idx) => {
                                        const totalDedicacion = dedicacionPorActividad[act.idactividad]?.reduce((sum, e) => sum + (e.valor || 0), 0) || 0;
                                        const totalErogacion = erogacionesPorActividad[act.idactividad]?.reduce((sum, e) => sum + (e.valor || 0), 0) || 0;
                                        const totalActividad = totalDedicacion + totalErogacion;

                                        sumaErogacion += totalErogacion;
                                        sumaPersonal += totalDedicacion;
                                        sumaTotal += totalActividad;

                                        return (
                                            <TableRow key={idx}>
                                                <TableCell >{act.nombreact}</TableCell>
                                                <TableCell >${totalDedicacion.toLocaleString()}</TableCell>
                                                <TableCell >${totalErogacion.toLocaleString()}</TableCell>
                                                <TableCell >${totalActividad.toLocaleString()}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                <TableRow>
                                    <TableCell >Total</TableCell>
                                    <TableCell >
                                        ${sumaPersonal.toLocaleString()}
                                    </TableCell>
                                    <TableCell >
                                        ${sumaErogacion.toLocaleString()}
                                    </TableCell>
                                    <TableCell >
                                        ${sumaTotal.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                </Accordion>


            </Paper>




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
            {!esGestionador && (
                <AccionesAdministrador proyecto={proyecto} />
            )}
            { }
            {!esGestionador && (
                <Box display="flex" justifyContent="center" mt={3}>
                    {getNombrePorSec(estados, proyecto.estadopr) === "En Ejecución" ? (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleFinalizarProyecto}
                        >
                            Finalizar proyecto
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleIniciarEjecucion}
                        >
                            Iniciar ejecución del proyecto
                        </Button>
                    )}
                </Box>
            )}

            {esGestionador && (
                <Box display="flex" justifyContent="center" mt={3}>
                    {getNombrePorSec(estados, proyecto.estadopr) === "En Planeación" ? (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleEnviarODI}
                        >
                            Enviar a la ODI
                        </Button>
                    ) : (
                        <></>
                    )}
                </Box>
            )}


            <Modal
                open={modalResumenOpen}
                onClose={() => setModalResumenOpen(false)}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '96%',
                        maxWidth: 1450,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 2,
                        p: 3,
                        maxHeight: '92vh',
                        overflowY: 'auto',
                    }}
                >
                    { }
                    <Typography align="center" fontWeight="bold">
                        Detalle del presupuesto por Rubro.
                    </Typography>

                    <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                        <strong>ID Proyecto:</strong> {proyecto.idproyecto} <br />
                        <strong>Nombre del Proyecto:</strong> {proyecto.nombrepr}
                    </Typography>
                    <Box display="flex" justifyContent="flex-end" my={3}>

                        <Button
                            variant="contained"
                            startIcon={<DocumentDownload />}
                            onClick={exportarExcelPresupuestoRubro}
                        >
                            Exportar a Excel
                        </Button>
                    </Box>
                    { }
                    <TableContainer
                        component={Paper}
                        variant="outlined"
                        sx={{
                            border: '1px solid #000',
                        }}
                    >
                        <Table
                            size="small"
                            sx={{
                                borderCollapse: 'collapse',
                                '& th, & td': {
                                    border: '1px solid #000',
                                },
                            }}
                        >
                            <TableHead>
                                <TableRow sx={{ bgcolor: rojoTotal }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>Actividad</TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>Rubro</TableCell>

                                    {(() => {
                                        const years = new Set();
                                        Object.values(erogacionesPorActividad).forEach(e =>
                                            e.forEach(r => years.add(r.agno))
                                        );
                                        return [...years].sort().map(y => (
                                            <TableCell
                                                key={y}
                                                align="right"
                                                sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}
                                            >
                                                {y}
                                            </TableCell>
                                        ));
                                    })()}

                                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>
                                        Observación
                                    </TableCell>
                                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }} align="right">
                                        Total por actividad
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {(() => {
                                    const filas = [];
                                    const years = new Set();

                                    Object.values(erogacionesPorActividad).forEach(e =>
                                        e.forEach(r => years.add(r.agno))
                                    );
                                    const yearsOrdenados = [...years].sort();

                                    Object.entries(erogacionesPorActividad).forEach(
                                        ([idActividad, erogaciones1]) => {
                                            const actividad = proyecto.actividades.find(
                                                a => Number(a.idactividad) === Number(idActividad)
                                            );

                                            const rubros1 = {};

                                            erogaciones1.forEach(er => {
                                                if (!rubros1[er.rubropl]) {
                                                    rubros1[er.rubropl] = {
                                                        actividad: actividad?.nombreact || '-',
                                                        rubro: er.rubropl,
                                                        valores: {},
                                                        observacion: er.observacionpl || '',
                                                    };
                                                }
                                                rubros1[er.rubropl].valores[er.agno] =
                                                    (rubros1[er.rubropl].valores[er.agno] || 0) + er.valor;
                                            });

                                            Object.values(rubros1).forEach(r =>
                                                filas.push({ ...r, yearsOrdenados })
                                            );
                                        }
                                    );


                                    const totalesPorAnio = {};
                                    yearsOrdenados.forEach(y => (totalesPorAnio[y] = 0));

                                    filas.forEach(f =>
                                        yearsOrdenados.forEach(
                                            y => (totalesPorAnio[y] += f.valores[y] || 0)
                                        )
                                    );

                                    return (
                                        <>
                                            {filas.map((fila, i) => {
                                                const totalFila = fila.yearsOrdenados.reduce(
                                                    (s, y) => s + (fila.valores[y] || 0),
                                                    0
                                                );

                                                return (
                                                    <TableRow
                                                        key={i}
                                                        sx={{ bgcolor: i % 2 === 0 ? grisFila : '#fff' }}
                                                    >
                                                        <TableCell sx={{ bgcolor: rojoTotal, color: "#FFF" }}>{fila.actividad}</TableCell>
                                                        <TableCell sx={{ bgcolor: rojoTotal, color: "#FFF" }}>{rubros.find(r => r.id === parseInt(fila.rubro))?.name || ''}</TableCell>

                                                        {fila.yearsOrdenados.map(y => (
                                                            <TableCell key={y} align="right">
                                                                {(fila.valores[y] || 0).toLocaleString()}
                                                            </TableCell>
                                                        ))}

                                                        <TableCell>{fila.observacion}</TableCell>
                                                        <TableCell align="right" fontWeight="bold">
                                                            {totalFila.toLocaleString()}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}

                                            { }
                                            <TableRow >
                                                <TableCell
                                                    colSpan={2}
                                                    sx={{
                                                        color: '#fff',
                                                        fontWeight: 'bold',
                                                        bgcolor: rojoTotal,
                                                    }}
                                                >
                                                    Valores totales por año
                                                </TableCell>

                                                {yearsOrdenados.map(y => (
                                                    <TableCell
                                                        key={y}
                                                        align="right"
                                                        sx={{ color: '#000', fontWeight: 'bold' }}
                                                    >
                                                        {totalesPorAnio[y].toLocaleString()}
                                                    </TableCell>
                                                ))}

                                                <TableCell />
                                                <TableCell />
                                            </TableRow>
                                        </>
                                    );
                                })()}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    { }
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                        <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() => setModalResumenOpen(false)}
                        >
                            Cerrar
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Modal
                open={modalPresupuestoPlaneadoOpen}
                onClose={() => setModalPresupuestoPlaneadoOpen(false)}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '96%',
                        maxWidth: 1450,
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 2,
                        p: 3,
                        maxHeight: '92vh',
                        overflowY: 'auto'
                    }}
                >
                    { }
                    <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Detalle del presupuesto planeado
                    </Typography>

                    <Typography align="center" sx={{ fontSize: 13 }}>
                        ID Proyecto: {proyecto?.idproyecto}
                    </Typography>
                    <Typography align="center" sx={{ fontSize: 13, mb: 2 }}>
                        Nombre del Proyecto: {proyecto?.nombrepr}
                    </Typography>

                    <Box display="flex" justifyContent="flex-end" mb={1}>
                        <Button
                            variant="contained"
                            startIcon={<DocumentDownload />}
                            onClick={exportarExcelPresupuestoPlaneado}
                        >
                            Descargar Detalle Presupuesto
                        </Button>
                    </Box>

                    { }
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                { }
                                <TableRow sx={{ bgcolor: rojoHeader }}>
                                    <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoHeader }}>
                                        Actividad / Año
                                    </TableCell>

                                    {getYears().map(year => (
                                        <TableCell
                                            key={year}
                                            align="center"
                                            colSpan={2}
                                            sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoHeader }}
                                        >
                                            {year}
                                        </TableCell>
                                    ))}

                                    <TableCell align="center" colSpan={2} sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoHeader }}>
                                        Subtotal
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoHeader }}>
                                        Total Actividad
                                    </TableCell>
                                </TableRow>

                                { }
                                <TableRow sx={{ bgcolor: rojoTotal }}>
                                    <TableCell sx={{ color: '#FFF', fontSize: 12, bgcolor: rojoHeader }} />

                                    {getYears().flatMap(year => (
                                        <React.Fragment key={year}>
                                            <TableCell sx={{ color: '#000', fontSize: 12 }}>
                                                Presupuesto Erogación
                                            </TableCell>
                                            <TableCell sx={{ color: '#000', fontSize: 12 }}>
                                                Dedicación Personal
                                            </TableCell>
                                        </React.Fragment>
                                    ))}

                                    { }
                                    <TableCell sx={{ color: '#000', fontSize: 12 }}>
                                        Presupuesto Erogación
                                    </TableCell>
                                    <TableCell sx={{ color: '#000', fontSize: 12 }}>
                                        Dedicación Personal
                                    </TableCell>

                                    { }
                                    <TableCell sx={{ color: '#000', fontSize: 12 }}>
                                        Total Actividad
                                    </TableCell>

                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {Object.keys(erogacionesPorActividad).map((idActividad, idx) => {
                                    let subtotalPersonal = 0;
                                    let subtotalErogacion = 0;

                                    return (
                                        <TableRow
                                            key={idActividad}
                                            sx={{ bgcolor: idx % 2 === 0 ? grisFila : '#fff' }}
                                        >
                                            { }
                                            <TableCell sx={{ color: '#FFF', fontSize: 12, bgcolor: rojoHeader }}>
                                                {getNombreActividad(idActividad)}
                                            </TableCell>

                                            { }
                                            {getYears().flatMap(year => {
                                                const dedicacion = getDedicacion(idActividad, year);
                                                const erogacion = getErogacion(idActividad, year);

                                                subtotalPersonal += dedicacion;
                                                subtotalErogacion += erogacion;

                                                return [
                                                    <TableCell
                                                        key={`${idActividad}-${year}-p`}
                                                        align="right"
                                                    >
                                                        ${dedicacion.toLocaleString('es-CO')}
                                                    </TableCell>,
                                                    <TableCell
                                                        key={`${idActividad}-${year}-e`}
                                                        align="right"
                                                    >
                                                        ${erogacion.toLocaleString('es-CO')}
                                                    </TableCell>
                                                ];
                                            })}

                                            { }
                                            <TableCell align="right">
                                                ${subtotalPersonal.toLocaleString('es-CO')}
                                            </TableCell>
                                            <TableCell align="right">
                                                ${subtotalErogacion.toLocaleString('es-CO')}
                                            </TableCell>

                                            { }
                                            <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                                ${(subtotalPersonal + subtotalErogacion).toLocaleString('es-CO')}
                                            </TableCell>

                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            { }
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: rojoTotal, color: "#FFF" }}>
                                    Valores totales del proyecto
                                </TableCell>

                                {getYears().flatMap(year => {
                                    const totalErogacion = getTotalErogacionAnio(year);
                                    const totalDedicacion = getTotalDedicacionAnio(year);

                                    return [
                                        <TableCell key={`tot-${year}-e`} align="right" sx={{ fontWeight: 'bold' }}>
                                            ${totalErogacion.toLocaleString('es-CO')}
                                        </TableCell>,
                                        <TableCell key={`tot-${year}-p`} align="right" sx={{ fontWeight: 'bold' }}>
                                            ${totalDedicacion.toLocaleString('es-CO')}
                                        </TableCell>
                                    ];
                                })}

                                { }
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    ${getYears()
                                        .reduce((s, y) => s + getTotalErogacionAnio(y), 0)
                                        .toLocaleString('es-CO')}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    ${getYears()
                                        .reduce((s, y) => s + getTotalDedicacionAnio(y), 0)
                                        .toLocaleString('es-CO')}
                                </TableCell>

                                { }
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                                    ${(
                                        getYears().reduce((s, y) => s + getTotalErogacionAnio(y), 0) +
                                        getYears().reduce((s, y) => s + getTotalDedicacionAnio(y), 0)
                                    ).toLocaleString('es-CO')}
                                </TableCell>
                            </TableRow>

                        </Table>
                    </TableContainer>

                    { }
                    <Box textAlign="right" mt={2}>
                        <Button
                            variant="outlined"
                            onClick={() => setModalPresupuestoPlaneadoOpen(false)}
                        >
                            Cerrar
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Modal
                open={modalResumen}
                onClose={() => setModalResumen(false)}
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '96%',
                        maxWidth: 1450,
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        borderRadius: 2
                    }}
                >
                    { }
                    <Box sx={{ p: 2 }}>
                        <Typography
                            variant="h6"
                            sx={{ color: '#000', fontWeight: 'bold', textAlign: 'center' }}
                        >
                            Resumen del Proyecto
                        </Typography>

                        <Typography sx={{ color: '#000', textAlign: 'center' }}>
                            ID Proyecto: {proyecto?.idproyecto}
                        </Typography>

                        <Typography sx={{ color: '#000', textAlign: 'center' }}>
                            Nombre del Proyecto: {proyecto?.nombrepr}
                        </Typography>
                    </Box>

                    { }
                    <TableContainer component={Paper} sx={{ m: 2 }}>
                        <Table size="small">
                            <TableBody>
                                {[
                                    ['Identificador del Proyecto', proyecto?.idproyecto],
                                    ['Nombre del Proyecto', proyecto?.nombrepr],
                                    ['Plan', getNombrePorId(planes, proyecto?.idplan)],
                                    ['Responsable', getNombrePorStr(responsables, proyecto?.ccresponsablepr)],
                                    ['Unidad Ejecutora', getNombrePorId(unidadejecutora, proyecto?.unidadejecutora)],
                                    ['SNIES', getNombreSnies(snies, proyecto?.sniespr)],
                                    ['Estado del Proyecto', getNombrePorSec(estados, proyecto?.estadopr)],
                                ].map(([label, value], index) => (
                                    <TableRow key={index}>
                                        <TableCell
                                            sx={{
                                                bgcolor: rojoTotal,
                                                color: '#fff',
                                                fontWeight: 'bold',
                                                width: '30%',
                                            }}
                                        >
                                            {label}
                                        </TableCell>
                                        <TableCell>{value || '-'}</TableCell>
                                    </TableRow>
                                ))}





                                <TableRow>
                                    <TableCell
                                        sx={{
                                            bgcolor: rojoTotal,
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        Objetivos
                                    </TableCell>
                                    <TableCell>
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {proyecto.objetivos
                                                .filter(item => item.tipoob !== 3)
                                                .map((o, i) => (
                                                    <li key={i}>{o.descripcionob}</li>
                                                ))}
                                        </ul>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell
                                        sx={{
                                            bgcolor: rojoTotal,
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        Metas
                                    </TableCell>
                                    <TableCell>
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {proyecto.objetivos
                                                .filter(item => item.tipoob === 3)
                                                .map((o, i) => (
                                                    <li key={i}>{o.descripcionob}</li>
                                                ))}
                                        </ul>
                                    </TableCell>
                                </TableRow>

                                <TableRow>
                                    <TableCell
                                        sx={{
                                            bgcolor: rojoTotal,
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        Indicadores
                                    </TableCell>
                                    <TableCell>
                                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                                            {proyecto.indicadores
                                                .map((o, i) => (
                                                    <li key={i}><strong>Indicador:</strong> {o.nombreind} <strong>Periodicidad:</strong> {o.periodicidadind} <strong>Descripcion:</strong> {o.descripcioncal}</li>
                                                ))}
                                        </ul>
                                    </TableCell>


                                </TableRow>

                                { }
                                <TableRow>
                                    <TableCell
                                        sx={{
                                            bgcolor: rojoTotal,
                                            color: '#fff',
                                            fontWeight: 'bold',
                                            verticalAlign: 'top'
                                        }}
                                    >
                                        Justificación
                                    </TableCell>
                                    <TableCell>
                                        {proyecto?.justificacionpr || '-'}
                                    </TableCell>
                                </TableRow>

                            </TableBody>
                        </Table>
                    </TableContainer>



                    { }
                    <Box sx={{ mt: 3, mx: 2 }}>
                        { }
                        <Box sx={{ bgcolor: rojoHeader, p: 1 }}>
                            <Typography sx={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
                                Actividades
                            </Typography>
                        </Box>

                        <TableContainer component={Paper}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: rojoTotal }}>
                                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>
                                            Actividad
                                        </TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>
                                            Fecha Inicio
                                        </TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>
                                            Fecha Fin
                                        </TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>
                                            Descripción Actividad
                                        </TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>
                                            Responsable
                                        </TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>
                                            Dedicacion de personal
                                        </TableCell>
                                        <TableCell sx={{ color: '#fff', fontWeight: 'bold', bgcolor: rojoTotal }}>
                                            Erogacion
                                        </TableCell>

                                    </TableRow>
                                </TableHead>

                                <TableBody>
                                    {proyecto.actividades && proyecto.actividades.length > 0 ? (
                                        proyecto.actividades.map((act, i) => {

                                            const ded = dedicaciones?.[act.idactividad] || [];
                                            const ero = erogaciones?.[act.idactividad] || [];
                                            const ind = indicadoresAct?.[act.idactividad] || [];

                                            return (
                                                <React.Fragment key={i}>
                                                    { }
                                                    <TableRow>
                                                        <TableCell sx={{ verticalAlign: 'top' }}>{act.nombreact}</TableCell>
                                                        <TableCell sx={{ verticalAlign: 'top' }}>{act.fechainiact}</TableCell>
                                                        <TableCell sx={{ verticalAlign: 'top' }}>{act.fechafinact}</TableCell>
                                                        <TableCell sx={{ verticalAlign: 'top' }}>{act.descripcionact}</TableCell>
                                                        <TableCell sx={{ verticalAlign: 'top' }}>
                                                            {getNombrePorStr(responsables, act.responsableact)}
                                                        </TableCell>
                                                        <TableCell>
                                                            {ded.length > 0 ? (
                                                                <Table size="small" sx={{ mt: 1 }}>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Nombre / Cargo</TableCell>
                                                                            <TableCell>Año</TableCell>
                                                                            <TableCell>Horas</TableCell>
                                                                            <TableCell>Cant.</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {ded.map((d, idx) =>
                                                                            d.horas?.map((h, j) => (
                                                                                <TableRow key={`${idx}-${j}`}>
                                                                                    <TableCell>
                                                                                        {d.nombreparticpprs !== 'Sin definir'
                                                                                            ? getNombrePorStr(responsables, d.nombreparticpprs)
                                                                                            : d.cargoparticprs}
                                                                                    </TableCell>
                                                                                    <TableCell>{h.id.agno}</TableCell>
                                                                                    <TableCell>{h.horas ?? '-'}</TableCell>
                                                                                    <TableCell>{h.cantPer ?? '-'}</TableCell>
                                                                                </TableRow>
                                                                            ))
                                                                        )}
                                                                    </TableBody>
                                                                </Table>
                                                            ) : (
                                                                <Typography color="text.secondary">
                                                                    No hay dedicación registrada
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {ero.length > 0 ? (
                                                                <Table size="small" sx={{ mt: 1 }}>
                                                                    <TableHead>
                                                                        <TableRow>
                                                                            <TableCell>Rubro</TableCell>
                                                                            <TableCell>Año</TableCell>
                                                                            <TableCell>Valor</TableCell>
                                                                            <TableCell>Observación</TableCell>
                                                                        </TableRow>
                                                                    </TableHead>
                                                                    <TableBody>
                                                                        {ero.map((e, idx) => (
                                                                            <TableRow key={idx}>
                                                                                <TableCell>
                                                                                    {rubros.find(r => r.id === parseInt(e.rubropl))?.name}
                                                                                </TableCell>
                                                                                <TableCell>{e.agno}</TableCell>
                                                                                <TableCell>
                                                                                    {Number(e.valor).toLocaleString('es-CO', {
                                                                                        style: 'currency',
                                                                                        currency: 'COP',
                                                                                    })}
                                                                                </TableCell>
                                                                                <TableCell>{e.observacionpl}</TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            ) : (
                                                                <Typography color="text.secondary">
                                                                    No hay erogaciones registradas
                                                                </Typography>
                                                            )}
                                                        </TableCell>

                                                    </TableRow>



                                                </React.Fragment>
                                            );
                                        })
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} align="center">
                                                No hay actividades registradas
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>



                    { }
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: 2,
                            p: 2,
                            mt: 2,
                        }}
                    >
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setModalResumen(false)}
                        >
                            Cerrar
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={exportarResumenProyectoExcel}
                        >
                            Exportar a Excel
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            onClick={exportarResumenProyectoWord}
                        >
                            Exportar a Word
                        </Button>
                    </Box>
                </Box>
            </Modal>

        </DashboardContent>
    );
}
