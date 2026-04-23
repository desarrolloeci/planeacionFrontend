import { API_BASE_URL } from 'src/config/api';
import axios from 'axios';
import { useNavigate } from 'react-router';
import { getStorage } from 'minimal-shared/utils';
import React, { useEffect, useState } from 'react';
import { Add, ArrowDown2, ArrowLeft, CloseCircle, DocumentDownload, Edit, Eye, Star, TickCircle, Trash } from 'iconsax-react';

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
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import {
    Box,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
    TextField,
    Paper,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Grid,
    Checkbox,
    FormControlLabel,
    DialogActions,
    DialogContent,
    DialogTitle,
    Dialog,
    Radio,
    RadioGroup,
    Divider,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Card,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Autocomplete,
    IconButton,
    Tooltip,
    Alert,
    TableContainer,
    Modal,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter, usePathname } from 'src/routes/hooks';

import sniesLocal from 'src/assets/data/snies.json';
import cargosLocal from 'src/assets/data/cargos.json';
import { DashboardContent } from 'src/layouts/dashboard';
import responsablesLocal from 'src/assets/data/responsables.json';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DetalleActividad from './DetalleActividad';
import ModalDedicacionSemanal from './ModalDedicacionSemanal';
import TablaDedicacionSemanal from './TablaDedicacionSemanal';

const steps = [
    'Datos Básicos',
    'Alineación estratégica',
    'Objetivos y metas',
    'Actividades y Presupuesto',
    'Documentos Adjuntos',
    'Resumen'
];

export default function NuevoProyecto({ modoEdicion = false, datosIniciales = null }) {

    const navigate = useNavigate();

    const fines = JSON.parse(getStorage("factoresList"))
    const finesEvaluacion = fines.filter(item => item.relacionfin === "0" && item.idplan === 2)

    const estados = JSON.parse(getStorage("estadosGenList"))
    const [dedicacionSeleccionada, setDedicacionSeleccionada] = useState('');
    const [cantidad, setCantidad] = useState(1);
    const [horasPorAnio, setHorasPorAnio] = useState({});
    const [cantidadPorAnio, setCantidadPorAnio] = useState({});

    const [openModalDedicacion, setOpenModalDedicacion] = useState(false);
    const [dedicacionActual, setDedicacionActual] = useState(null);

    const formatoPesos = new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
    });

    const [indicadorEditando, setIndicadorEditando] = useState({
        nombreind: '',
        periodicidadind: '',
        descripcioncal: '',
    });

    var sumaErogacion = 0;
    var sumaPersonal = 0;
    var sumaTotal = 0;

    const [modalResumenOpen, setModalResumenOpen] = useState(false);
    const [modalResumen, setModalResumen] = useState(false);
    const [modalPresupuestoPlaneadoOpen, setModalPresupuestoPlaneadoOpen] = useState(false);

    const rojoHeader = '#8B0000';
    const rojoTotal = '#7A0000';
    const grisFila = '#F7F7F7';

    const [proyecto, setProyecto] = useState(() => {
        if (modoEdicion && datosIniciales) {
            return {
                ...datosIniciales,
                fechainipr: datosIniciales.fechainipr?.split('T')[0] || '',
                fechafinpr: datosIniciales.fechafinpr?.split('T')[0] || '',
                fechacrea: datosIniciales.fechacrea?.split('T')[0] || new Date().toISOString().split('T')[0],
                ccdirectorpr: datosIniciales.ccdirectorpr || '',
                ccresponsablepr: datosIniciales.ccresponsablepr || ''
            };
        }
        return {
            nombrepr: '',
            idplan: '',
            sniespr: '',
            unidadejecutora: '',
            ccdirectorpr: '',
            ccresponsablepr: '',
            fechainipr: '',
            fechafinpr: '',
            fechacrea: new Date().toISOString().split('T')[0],
            justificacionpr: '',
            objetivos: [],
            indicadores: [],
            actividades: [],
            archivos: [],
            ejes: [],
            factores: []
        };
    });


    const getNombrePersona = (codEmp) => {
        const persona = responsables.find(r => r.cod_emp === codEmp);
        return persona ? persona.nombres : '';
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

                        var retorno = horasList.map(h => ({
                            agno: h.id.agno,
                            valor: Math.round(
                                ((Number(h.horas) || 0) / totalHoras) * (Number(p.valorprs) || 0)
                            )
                        }));



                        return retorno



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

    const getNombreCargo = (codCargo) => {
        const cargo = cargos.find(c => c.cod_car === codCargo);
        return cargo ? cargo.nom_car : '';
    };

    const getNombrePorSec = (lista, id) => {




        const encontrado = lista.find(item => item.id === Number(id));

        return encontrado ? encontrado.name : '-';
    };

    const handleAgregarPersonal = async () => {
        if (!dedicacionSeleccionada) {
            showSnackbar('Debe seleccionar una persona o cargo válido', 'error');
            return;
        }

        const totalHoras = anios.reduce((acc, anio) => acc + Number(horasPorAnio[anio] || 0), 0);
        let totalCantidad = anios.reduce((acc, anio) => acc + Number(cantidadPorAnio[anio] || 0), 0);



        if (tipoPersonal === 'persona') totalCantidad = 1;
        if (tipoPersonal === 'cargo' && totalCantidad <= 0) {
            showSnackbar('Debe ingresar una cantidad válida de personas por año', 'error');
            return;
        }

        let valorprs = 0;
        let nombreparticpprs = '';
        let cargoparticprs = '';

        if (tipoPersonal === 'persona') {
            const persona = responsables.find(r => r.cod_emp === dedicacionSeleccionada);
            if (persona) {
                const valorHora = parseFloat((persona.usrValHora || "0").replace(',', '.')) || 0;
                valorprs = totalHoras * valorHora;
                nombreparticpprs = persona.cod_emp;
                cargoparticprs = persona.codCar
                    ? cargos.find(c => c.cod_car.trim() === persona.codCar.trim())?.nom_car || ''
                    : '';
            }
        } else if (tipoPersonal === 'cargo') {
            const cargoSeleccionado = cargos.find(c => c.cod_car === dedicacionSeleccionada);
            if (cargoSeleccionado) {
                valorprs = (Number(cargoSeleccionado.usrValHora || 0) * totalCantidad * totalHoras);
                nombreparticpprs = "Sin definir";
                cargoparticprs = cargoSeleccionado.nom_car;
            }
        }

        const nuevoPersonal = {
            tipo: tipoPersonal,
            nombreparticpprs,
            cargoparticprs,
            valorprs,
            idactividad: actividadEnEdicion?.idactividad,
            horas: anios.map(anio => ({
                agno: anio,
                horas: Number(horasPorAnio[anio] || 1),
                CantPer: Number(cantidadPorAnio[anio] || 1),
            })),
        };

        try {

            const dataPersonal = {
                idpersonal: 0,
                nombreparticpprs: nuevoPersonal.nombreparticpprs,
                cargoparticprs: nuevoPersonal.cargoparticprs,
                valorprs: nuevoPersonal.valorprs,
                idactividad: nuevoPersonal.idactividad,
                estado: 1,
            };

            const resPersonal = await fetch(`${API_BASE_URL}/personal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataPersonal),
            });

            if (!resPersonal.ok) throw new Error("Error creando personal");
            const creado = await resPersonal.json();
            const idPersonal = creado.idpersonal;


            for (const registro of nuevoPersonal.horas) {
                const { agno, horas, CantPer } = registro;

                const bodyHoras = {
                    id: { idPersonal, agno },
                    horas,
                    cantPer: CantPer,
                };

                const resHoras = await fetch(`${API_BASE_URL}/horas-personal`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(bodyHoras),
                });

                if (!resHoras.ok) throw new Error(`Error guardando horas para ${agno}`);
            }


            const nuevoConId = { ...nuevoPersonal, idpersonal: idPersonal };
            setActividadEnEdicion(prev => ({
                ...prev,
                personal: [...(prev.personal || []), nuevoConId],
            }));

            showSnackbar("Dedicación de personal guardada correctamente", "success");
        } catch (error) {
            console.error("Error guardando dedicación:", error);
            showSnackbar("Error al guardar la dedicación de personal", "error");
        }


        setDedicacionSeleccionada('');
        setHorasPorAnio({});
        setCantidadPorAnio({});
    };

    const handleAgregarPersonalFinal = async (nuevoPersonal) => {


        const esEdicion = !!nuevoPersonal.idpersonal;
        const idPersonal = nuevoPersonal.idpersonal;



        try {
            if (!actividadEnEdicion?.idactividad) {
                showSnackbar("Debe guardar la actividad antes de agregar dedicaciones", "warning");
                return;
            }

            let valorprs = 0;
            let nombreparticpprs = "";
            let cargoparticprs = "";

            const totalHoras =
                nuevoPersonal.horas?.reduce((acc, h) => acc + Number(h.horas || 0), 0) || 0;
            const totalCantidad =
                nuevoPersonal.horas?.reduce((acc, h) => acc + Number(h.CantPer || 0), 0) || 0;




            if (nuevoPersonal.tipo === "persona") {
                const persona = responsables.find((r) => r.cod_emp === nuevoPersonal.idpersona);

                if (persona) {

                    const valorHora =
                        parseFloat((persona.usrValHora || "0").replace(",", ".")) || 0;

                    valorprs = totalHoras * valorHora;
                    nombreparticpprs = persona.cod_emp;
                    cargoparticprs = persona.codCar
                        ? cargos.find((c) => c.cod_car.trim() === persona.codCar.trim())?.nom_car || ""
                        : "";
                }
            } else if (nuevoPersonal.tipo === "cargo") {
                const cargoSeleccionado = cargos.find((c) => c.cod_car === nuevoPersonal.idcargo);
                if (cargoSeleccionado) {
                    valorprs =
                        Number(cargoSeleccionado.usrValHora || 0) * totalCantidad * totalHoras;
                    nombreparticpprs = "Sin definir";
                    cargoparticprs = cargoSeleccionado.nom_car;
                }
            }

            const dataPersonal = {
                idactividad: actividadEnEdicion.idactividad,
                nombreparticpprs,
                cargoparticprs,
                valorprs,
                tipo: nuevoPersonal.tipo,
                estado: 1,
            };



            let idPersonalCreado = idPersonal;

            if (esEdicion) {
                const resUpdate = await fetch(`${API_BASE_URL}/personal/${idPersonal}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataPersonal),
                });
                if (!resUpdate.ok) throw new Error("Error actualizando registro en /personal");
            } else {
                const resCreate = await fetch(`${API_BASE_URL}/personal`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dataPersonal),
                });
                if (!resCreate.ok) throw new Error("Error creando registro en /personal");
                const creado = await resCreate.json();
                idPersonalCreado = creado.idpersonal;
            }


            for (const h of nuevoPersonal.horas || []) {
                const horasPayload = {
                    id: { idPersonal: idPersonalCreado, agno: h.agno },
                    horas: h.horas,
                    cantPer: h.CantPer || 1,
                };







                let metodoHoras = "POST";
                let urlHoras = `${API_BASE_URL}/horas-personal`;

                if (esEdicion) {
                    try {



                        const esAnioExistente = h.existente === true;

                        if (esAnioExistente) {
                            metodoHoras = "PUT";
                            urlHoras = `${API_BASE_URL}/horas-personal/${idPersonalCreado}/${h.agno}`;
                        }
                    } catch (e) {
                        metodoHoras = "POST";
                    }
                }

                const resHoras = await fetch(urlHoras, {
                    method: metodoHoras,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(horasPayload),
                });


                if (!resHoras.ok && metodoHoras === "PUT") {
                    await fetch(`${API_BASE_URL}/horas-personal`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(horasPayload),
                    });
                } else if (!resHoras.ok) {
                    throw new Error(`Error procesando horas para ${h.agno}`);
                }
            }




            for (const d of nuevoPersonal.dedicaciones || []) {
                const dedicacionPayload = {
                    idactividad: actividadEnEdicion.idactividad,
                    idpersonal: idPersonalCreado,
                    idpersona: nuevoPersonal.idpersona || null,
                    idcargo: nuevoPersonal.idcargo || null,
                    agno: d.agno,
                    horasPorSemana: Number(d.horasPorSemana),
                    semanasCalculadas: d.semanasCalculadas,
                    horasTotales: d.horasTotales,
                    tipo: nuevoPersonal.tipo,
                    updatedBy: "frontend",
                    fechaInicio: d.fechaInicioAnual,
                    fechaFin: d.fechaFinAnual
                };

                const esDedicacionExistente = !!d.iddedicacion;
                const method = esDedicacionExistente ? "PUT" : "POST";
                const url = esDedicacionExistente
                    ? `${API_BASE_URL}/dedicacion-semanal/${d.iddedicacion}`
                    : `${API_BASE_URL}/dedicacion-semanal`;

                const resDedicacion = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dedicacionPayload),
                });

                if (!resDedicacion.ok)
                    throw new Error(
                        `Error ${esDedicacionExistente ? "actualizando" : "creando"} dedicación semanal para ${d.agno}`
                    );
            }


            setActividadEnEdicion((prev) => ({
                ...prev,
                personal: esEdicion
                    ? prev.personal.map((p) =>
                        p.idpersonal === idPersonalCreado
                            ? { ...p, ...nuevoPersonal, valorprs, nombreparticpprs, cargoparticprs }
                            : p
                    )
                    : [...(prev.personal || []), { ...nuevoPersonal, idpersonal: idPersonalCreado, valorprs, nombreparticpprs, cargoparticprs }],
            }));

            showSnackbar(`Dedicación ${esEdicion ? "actualizada" : "registrada"} correctamente`, "success");

            setDedicacionSeleccionada("");
            setHorasPorAnio({});
            setCantidadPorAnio({});
            setDedicacionActual(null);
            setOpenModalDedicacion(false);


        } catch (error) {
            console.error("Error al guardar dedicación:", error);
            showSnackbar("Error al guardar la dedicación", "error");
        }
    };


    const handleActualizarHorasPersonal = async (index, anio, campo, nuevoValor) => {
        const personal = actividadEnEdicion.personal[index];
        const horasActuales = personal.horas.find(h => h.agno === anio);

        if (!horasActuales) return;


        const valorNumerico = isNaN(Number(nuevoValor)) || nuevoValor === '' ? 0 : Number(nuevoValor);


        const horasPrevias = Number(horasActuales.horas) || 0;
        const cantidadPrevia = Number(horasActuales.CantPer) || 0;





        const nuevasHoras = campo === "horas" ? valorNumerico : horasPrevias;
        const nuevaCantidad = campo === "CantPer" ? valorNumerico : cantidadPrevia;



        try {

            if (personal.idpersonal) {
                const body = {
                    horas: nuevasHoras,
                    cantPer: nuevaCantidad,
                };

                const res = await fetch(`${API_BASE_URL}/horas-personal/${personal.idpersonal}/${anio}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!res.ok) throw new Error(`Error actualizando año ${anio}`);
            }


            setActividadEnEdicion((prev) => {
                const actualizados = [...prev.personal];
                const personalEditado = { ...personal };

                personalEditado.horas = personalEditado.horas.map((h) =>
                    h.agno === anio
                        ? { ...h, horas: nuevasHoras, CantPer: nuevaCantidad }
                        : h
                );


                const totalHoras = personalEditado.horas.reduce((sum, h) => sum + (Number(h.horas) || 0), 0);
                const totalCantidad = personalEditado.horas.reduce((sum, h) => sum + (Number(h.CantPer) || 0), 0);





                let valorHora = 0;
                if (personal.tipo === "persona") {
                    const persona = responsables.find(r => r.cod_emp === personal.nombreparticpprs);
                    if (persona) valorHora = parseFloat((persona.usrValHora || "0").replace(",", ".")) || 0;
                } else if (personal.tipo === "cargo") {
                    const cargo = cargos.find(c => c.nom_car === personal.cargoparticprs);
                    if (cargo) valorHora = Number(cargo.usrValHora) || 0;
                }




                personalEditado.valorprs = totalHoras * valorHora * (personal.tipo === "cargo" ? totalCantidad : 1);

                actualizados[index] = personalEditado;
                return { ...prev, personal: actualizados };
            });

            showSnackbar("Valor actualizado correctamente", "success");
        } catch (error) {
            console.error("Error actualizando horas:", error);
            showSnackbar("Error al actualizar horas o cantidad", "error");
        }
    };



    const handleEliminarPersonal = async (index) => {
        const personalAEliminar = actividadEnEdicion.personal[index];

        if (!personalAEliminar) return;

        const confirmar = window.confirm(
            "¿Está seguro de eliminar este personal?\n\nSe eliminarán también todas las horas asociadas."
        );

        if (!confirmar) return;

        try {
            if (personalAEliminar.idpersonal) {

                for (const h of personalAEliminar.horas || []) {
                    const resHora = await fetch(
                        `${API_BASE_URL}/horas-personal/${personalAEliminar.idpersonal}/${h.agno}`,
                        {
                            method: 'DELETE',
                            headers: { 'Content-Type': 'application/json' },
                        }
                    );

                    if (!resHora.ok) {
                        throw new Error(`Error eliminando horas del año ${h.agno}`);
                    }
                }


                const resPersonal = await fetch(
                    `${API_BASE_URL}/personal/${personalAEliminar.idpersonal}`,
                    {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                    }
                );

                if (!resPersonal.ok) {
                    throw new Error("Error al eliminar personal");
                }

                showSnackbar('Personal y sus horas eliminados correctamente.', 'success');
            }


            setActividadEnEdicion(prev => ({
                ...prev,
                personal: prev.personal.filter((_, i) => i !== index)
            }));

        } catch (error) {
            console.error('Error eliminando personal y horas:', error);
            showSnackbar('Error al eliminar personal y sus horas.', 'error');
        }
    };

    useEffect(() => {





    }, []);


    const router = useRouter();

    const [tipoPersonal, setTipoPersonal] = useState('persona');



    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = (_, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar({ ...snackbar, open: false });
    };


    const thStyle = { border: '1px solid #ccc', padding: '8px', background: '#f0f0f0' };
    const tdStyle = { border: '1px solid #ccc', padding: '8px' };
    const tdStyleCenter = { border: '1px solid #ccc', padding: '8px', textAlign: 'center' };

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [idProyecto, setIdProyecto] = useState();

    const planes = JSON.parse(getStorage("planesList"))


    const [snies, setSnies] = useState([]);

    const unidadejecutora = JSON.parse(getStorage("unidadesList"))


    const [responsables, setResponsables] = useState([]);

    useEffect(() => {
        const fetchResponsables = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/responsables`);
                if (!res.ok) throw new Error("Error al consultar API de responsables");
                const data = await res.json();



                let responsablesOrdenados = [];

                if (Array.isArray(data) && data.length > 0) {
                    responsablesOrdenados = [...data].sort((a, b) =>
                        a.nombres.localeCompare(b.nombres, "es", { sensitivity: "base" })
                    );
                } else {
                    console.warn("API sin datos. Cargando responsables desde archivo local.");
                    responsablesOrdenados = [...responsablesLocal].sort((a, b) =>
                        a.nombres.localeCompare(b.nombres, "es", { sensitivity: "base" })
                    );
                }

                setResponsables(responsablesOrdenados);
            } catch (error) {
                console.warn("Fallo al consultar API. Cargando responsables locales:", error);
                const localesOrdenados = [...responsablesLocal].sort((a, b) =>
                    a.nombres.localeCompare(b.nombres, "es", { sensitivity: "base" })
                );
                setResponsables(localesOrdenados);
            }
        };

        fetchResponsables();
    }, []);


    useEffect(() => {
        const fetchSnies = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/snies`);
                if (!res.ok) throw new Error("Error al consultar API de SNIES");
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {

                    const sniesFormateados = data.map(item => ({
                        id: item.cod_cco,
                        name: item.nom_cco,
                        est_cco: item.est_cco,
                        cod_cco_Extr: item.cod_cco_Extr
                    }));
                    setSnies(sniesFormateados);
                } else {
                    console.warn("API sin datos. Cargando SNIES desde archivo local.");
                    setSnies(sniesLocal.map(item => ({
                        id: item.cod_cco,
                        name: item.nom_cco,
                        est_cco: item.est_cco,
                        cod_cco_Extr: item.cod_cco_Extr
                    })));
                }
            } catch (error) {
                console.warn("Fallo al consultar API SNIES. Usando archivo local:", error);
                setSnies(sniesLocal.map(item => ({
                    id: item.cod_cco,
                    name: item.nom_cco,
                    est_cco: item.est_cco,
                    cod_cco_Extr: item.cod_cco_Extr
                })));
            }
        };

        fetchSnies();
    }, []);

    const getNombreSnies = (id) => {
        if (!snies || snies.length === 0 || !id) return '';
        const encontrado = snies.find(item => String(item.id) === String(id));
        if (!encontrado) return '';


        return encontrado.cod_cco_Extr
            ? `${encontrado.name} (${encontrado.cod_cco_Extr})`
            : encontrado.name;
    };



    const getResponsableInfo = (codEmp) => responsables.find(r => r.cod_emp === codEmp) || null;

    const getNombrePorIdDoc = (lista, codEmp) => {
        const encontrado = lista.find(item => item.cod_emp === codEmp);
        return encontrado ? encontrado.nombres : '';
    };

    const ejes = JSON.parse(getStorage("ejesList"))
    const rubros = JSON.parse(getStorage("rubrosList"))



    const [factores, setFactores] = useState([])
    const [caracteristicas, setCaracteristicas] = useState([])



    const aniosO = [2025, 2026, 2027, 2028, 2029];

    const getAniosDesdeRangoFechas = (fechaInicio, fechaFin) => {




        const anioInicio = new Date(fechaInicio).getFullYear();
        const anioFin = new Date(fechaFin).getFullYear();
        const anios = [];
        for (let anio = anioInicio; anio <= anioFin; anio++) {
            anios.push(anio);
        }
        return anios;
    };

    const [anios, setAnios] = useState([]);


    const [cargos, setCargos] = useState([]);

    useEffect(() => {
        const fetchCargos = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/cargos`);
                if (!res.ok) throw new Error("Error al cargar cargos");
                const data = await res.json();

                if (Array.isArray(data) && data.length > 0) {
                    const cargosFormateados = data.map(item => ({
                        cod_car: item.cod_car,
                        nom_car: item.nom_car,
                        usrValHora: item.usrValHora,
                    }));
                    setCargos(cargosFormateados);
                } else {
                    console.warn("API sin datos. Cargando cargos desde archivo local.");
                    setCargos(cargosLocal);
                }
            } catch (error) {
                console.warn("Fallo al consultar API de cargos. Usando archivo local:", error);
                setCargos(cargosLocal);
            }
        };

        fetchCargos();
    }, []);

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState(() => {
        if (modoEdicion && datosIniciales) {
            return {
                ...datosIniciales,
                fechainipr: datosIniciales.fechainipr?.split('T')[0] || '',
                fechafinpr: datosIniciales.fechafinpr?.split('T')[0] || '',
                fechacrea: datosIniciales.fechacrea?.split('T')[0] || new Date().toISOString().split('T')[0],
                ccdirectorpr: datosIniciales.ccdirectorpr || '',
                ccresponsablepr: datosIniciales.ccresponsablepr || ''
            };
        }
        return {
            nombrepr: '',
            idplan: '',
            sniespr: '',
            unidadejecutora: '',
            ccdirectorpr: '',
            ccresponsablepr: '',
            fechainipr: '',
            fechafinpr: '',
            fechacrea: new Date().toISOString().split('T')[0],
            justificacionpr: '',
            objetivos: [],
            indicadores: [],
            actividades: [],
            archivos: [],
            ejes: [],
            factores: []
        };
    });

    const isNew = !formData.idproyecto;



    const [errors, setErrors] = useState({});

    const [ejeActual, setEjeActual] = useState('');
    const [objetivosSeleccionados, setObjetivosSeleccionados] = useState([]);
    const [finActual, setFinActual] = useState('');
    const [factorActual, setFactorActual] = useState('');
    const [caracteristicaActual, setCaracteristicaActual] = useState([]);
    const [nuevoIndicador, setNuevoIndicador] = useState({
        nombreind: '',
        periodicidadind: '',
        descripcioncal: '',
    });

    const [nuevaActividad, setNuevaActividad] = useState({
        nombreact: '',
        fechainiact: '',
        fechafinact: '',
        porcproyectoact: '',
        porcejecucionact: '',
        responsableact: '',
        descripcionact: '',
    });

    const [nuevoDocumento, setNuevoDocumento] = useState({
        file: null,
        observacion: '',
    });

    const [editIndex, setEditIndex] = useState(null);

    const validateStep = () => {
        const newErrors = {};

        if (activeStep === 0) {
            if (!formData.nombrepr.trim()) {
                newErrors.nombrepr = 'El nombre es obligatorio';
            }

            if (!formData.fechainipr) {
                newErrors.fechainipr = 'La fecha de inicio es obligatoria';
            }

            if (!formData.fechafinpr) {
                newErrors.fechafinpr = 'La fecha de fin es obligatoria';
            }
            if (!formData.idplan) {
                newErrors.idplan = 'El plan es obligatorio';
            }

            if (!formData.sniespr) {
                newErrors.sniespr = 'El campo SNIES es obligatorio';
            }
            if (!formData.unidadejecutora) {
                newErrors.unidadejecutora = 'La unidad ejecutora es obligatoria';
            }
            if (!formData.ccdirectorpr) {
                newErrors.ccdirectorpr = 'El director del proyecto es obligatorio';
            }
            if (!formData.ccresponsablepr) {
                newErrors.ccresponsablepr = 'El responsable del proyecto es obligatorio';
            }

            if (!formData.justificacionpr.trim()) {
                newErrors.justificacionpr = 'La justificación es obligatoria';
            }


        }
        if (activeStep === 2) {

            const objetivoGeneral = formData.objetivos.find(obj => obj.tipoob === 1);

            if (!objetivoGeneral || !objetivoGeneral.descripcionob.trim()) {
                newErrors.objetivoGeneral = 'Debe registrar un objetivo general.';
            }




        }



        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = async () => {

        const exito = await guardarStep();


        if (exito) {





            setActiveStep((prevStep) => prevStep + 1);
        }
    };
    const handleBack = () => {
        setActiveStep((prevStep) => prevStep - 1);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleChangeActividad = (e) => {
        const { name, value } = e.target;
        setNuevaActividad(prev => ({ ...prev, [name]: value }));
    };

    const API_URL = `${API_BASE_URL}/proyectos`;

    const fetchProyecto = async (id) => {
        const response = await fetch(`${API_URL}/${id}`);

        if (!response.ok) throw new Error("Error al obtener el proyecto");
        return await response.json();
    };


    const handleEnviarODI = async () => {
        try {
            const proyectoData = await fetchProyecto(proyecto.idproyecto);

            const proyectoActualizado = {
                ...proyectoData,
                estadopr: 45,
                observacionadmin: "Se envia a la odi para revisión.",
            };

            await updateProyecto(proyectoActualizado);
            router.back();
            navigate(-1)
        } catch (error) {
            console.error("Error al actualizar proyecto:", error);
            alert("Hubo un error al actualizar el proyecto.");
        }
    };

    const handleSubmitOdi = async () => {
        try {
            const exito = await guardarStep();
            if (exito) {


                await handleEnviarODI()


                router.back();
            }
        } catch (error) {
            console.error("Error en guardar y salir:", error);
            showSnackbar("Error al guardar el proyecto.", "error");
        }
    };

    const handleSubmit = async () => {
        try {
            const exito = await guardarStep();
            if (exito) {




                router.back();
            }
        } catch (error) {
            console.error("Error en guardar y salir:", error);
            showSnackbar("Error al guardar el proyecto.", "error");
        }
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



    const handleChangeIndicador = (e) => {
        const { name, value } = e.target;


        setNuevoIndicador((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAgregarIndicador = async () => {
        const { nombreind, periodicidadind, descripcioncal } = nuevoIndicador;

        if (!nombreind || !periodicidadind || !descripcioncal) {
            showSnackbar("Debe completar todos los campos", "error");
            return;
        }

        if (!formData.idproyecto) {
            showSnackbar("Debe guardar primero el proyecto antes de agregar indicadores", "warning");
            return;
        }

        try {

            const indicadorData = {
                idindicador: 0,
                nombreind,
                periodicidadind,
                descripcioncal,
                idproyecto: formData.idproyecto
            };


            const response = await fetch(`${API_BASE_URL}/indicadores`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(indicadorData),
            });

            if (!response.ok) throw new Error("Error al guardar el indicador");
            const creado = await response.json();


            const nuevoConId = { ...indicadorData, idindicador: creado.idindicador };
            setFormData((prev) => ({
                ...prev,
                indicadores: [...prev.indicadores, nuevoConId],
            }));


            setNuevoIndicador({ nombreind: "", periodicidadind: "", descripcioncal: "" });

            showSnackbar("Indicador guardado correctamente", "success");
        } catch (error) {
            console.error("Error al guardar indicador:", error);
            showSnackbar("Error al guardar el indicador en el servidor", "error");
        }
    };


    const [idActividadAEditar, setIdActividadAEditar] = useState(null);

    useEffect(() => {
        if (idActividadAEditar) {
            handleEditarActividadPorId(idActividadAEditar);
            setIdActividadAEditar(null);
        }
    }, [formData.actividades, idActividadAEditar]);

    const handleAgregarActividad = async () => {
        const { nombreact, fechainiact, fechafinact, porcproyectoact, responsableact, descripcionact } = nuevaActividad;


        const responsableFinal = responsableact || formData.ccresponsablepr;

        if (!nombreact || !fechainiact || !fechafinact || !porcproyectoact) {
            showSnackbar('Debe completar todos los campos obligatorios', 'error');
            return;
        }
        if (!responsableFinal) {
            showSnackbar('Debe seleccionar un responsable o tener uno definido en el proyecto.', 'error');
            return;
        }
        if (!descripcionact.trim()) {
            showSnackbar('Debe escribir una descripción.', 'error');
            return;
        }


        const actividadData = {
            idactividad: 0,
            nombreact,
            fechainiact,
            fechafinact,
            porcproyectoact,
            porcejecucionact: nuevaActividad.porcejecucionact || 0,
            responsableact: responsableFinal,
            descripcionact,
            idproyecto: formData.idproyecto,
            consecutivoact: formData.actividades.length + 1
        };

        try {

            const response = await fetch(`${API_BASE_URL}/actividades`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(actividadData)
            });

            if (!response.ok) throw new Error('Error al guardar la actividad');
            const creada = await response.json();




            const actividadConId = {
                ...actividadData,
                idactividad: creada.idactividad,
                consecutivoact: formData.actividades.length + 1
            };

            setFormData(prev => ({
                ...prev,
                actividades: [...prev.actividades, actividadConId]
            }));

            setIdActividadAEditar(creada.idactividad);


            setNuevaActividad({
                nombreact: '',
                fechainiact: '',
                fechafinact: '',
                porcproyectoact: '',
                porcejecucionact: '',
                responsableact: '',
                descripcionact: '',
            });

            showSnackbar('Actividad creada correctamente', 'success');
        } catch (error) {
            console.error('Error al guardar la actividad:', error);
            showSnackbar('Error al guardar la actividad en el servidor.', 'error');
        }
    };

    const [indicadoresAct, setIndicadoresAct] = useState([]);



    const handleEditarActividadPorId = async (idactividad) => {
        const actividad = formData.actividades.find(
            act => act.idactividad === idactividad
        );

        if (!actividad) {
            console.warn("Actividad no encontrada aún:", idactividad);
            return;
        }

        try {
            const respIndicadores = await fetch(
                `${API_BASE_URL}/indicadores/actividad/${idactividad}`
            );
            const dataIndicadores = await respIndicadores.json();

            const indicadores = dataIndicadores.map(ind => ({
                idindicador: ind.idindicador,
                nombre: ind.nombreind,
                periodicidad: ind.periodicidadind,
                descripcion: ind.descripcioncal
            }));

            const respErogaciones = await fetch(
                `${API_BASE_URL}/erogacion-pl/actividad/${idactividad}`
            );
            const dataErogaciones = await respErogaciones.json();

            const erogaciones = dataErogaciones.map(e => ({
                iderogacion: e.iderogacionpl,
                rubro: e.rubropl,
                valor: e.valor,
                anio: e.agno,
                rubroNombre:
                    rubros.find(r => r.id === parseInt(e.rubropl))?.name || '',
                observaciones: e.observacionpl
            }));

            const personal = await obtenerPersonalConHoras(idactividad);

            setActividadEnEdicion({
                ...actividad,
                fechainiact: formatearFecha(actividad.fechainiact),
                fechafinact: formatearFecha(actividad.fechafinact),
                indicadores,
                erogaciones,
                personal
            });

            const aniosActividad = getAniosDesdeRangoFechas(
                actividad.fechainiact,
                actividad.fechafinact
            );

            setAnios(aniosActividad);
            setModalAbierto(true);

        } catch (error) {
            console.error('Error al cargar datos de la actividad:', error);
            showSnackbar('Error al cargar datos de la actividad.', 'error');
        }
    };

    const handleEditarActividad = async (index) => {
        const actividad = formData.actividades[index];






        if (!actividad.idactividad) {
            showSnackbar('La actividad aún no ha sido guardada. No se pueden cargar datos.', 'warning');
            return;
        }

        try {

            const respIndicadores = await fetch(`${API_BASE_URL}/indicadores/actividad/${actividad.idactividad}`);
            const dataIndicadores = await respIndicadores.json();

            const indicadores = dataIndicadores.map(ind => ({
                idindicador: ind.idindicador,
                nombre: ind.nombreind,
                periodicidad: ind.periodicidadind,
                descripcion: ind.descripcioncal
            }));


            const respErogaciones = await fetch(`${API_BASE_URL}/erogacion-pl/actividad/${actividad.idactividad}`);
            const dataErogaciones = await respErogaciones.json();

            const erogaciones = dataErogaciones.map(e => ({
                iderogacion: e.iderogacionpl,
                rubro: e.rubropl,
                valor: e.valor,
                anio: e.agno,
                rubroNombre: rubros.find(r => r.id === parseInt(e.rubropl))?.name || '',

                observaciones: e.observacionpl
            }));



            const resultado = await obtenerPersonalConHoras(actividad.idactividad);





            actividad.fechainiact = formatearFecha(actividad.fechainiact);
            actividad.fechafinact = formatearFecha(actividad.fechafinact);



            setActividadEnEdicion({
                ...actividad,
                index,
                indicadores,
                erogaciones,
                personal: resultado
            });

            const aniosActividad = getAniosDesdeRangoFechas(
                formatearFecha(actividad.fechainiact),
                formatearFecha(actividad.fechafinact)
            );


            setAnios(aniosActividad);

            setModalAbierto(true);
        } catch (error) {
            console.error('Error al cargar indicadores o erogaciones:', error);
            showSnackbar('Error al cargar datos de la actividad.', 'error');
        }
    };

    const formatearFecha = (fechaISO) => (
        new Date(fechaISO).toISOString().split('T')[0]
    )

    const handleEliminarActividad = async (index) => {
        const actividad = formData.actividades[index];

        if (!actividad) return;


        if (!window.confirm("¿Está seguro de eliminar esta actividad?")) return;

        try {

            if (actividad.idactividad) {
                const response = await fetch(
                    `${API_BASE_URL}/actividades/${actividad.idactividad}`,
                    {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" }
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al eliminar en el servidor");
                }
            }


            setFormData(prev => ({
                ...prev,
                actividades: prev.actividades.filter((_, i) => i !== index)
            }));

            showSnackbar("Actividad eliminada correctamente", "success");

        } catch (error) {
            console.error("Error al eliminar actividad:", error);
            showSnackbar("Error al eliminar la actividad", "error");
        }
    };

    const handleEliminarErogacion = async (index) => {
        const erogacion = actividadEnEdicion.erogaciones[index];

        if (!erogacion) return;


        if (!window.confirm("¿Está seguro de eliminar esta erogación?")) return;

        try {

            if (erogacion.iderogacion) {
                const response = await fetch(
                    `${API_BASE_URL}/erogacion-pl/${erogacion.iderogacion}`,
                    {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" }
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al eliminar en el servidor");
                }
            }


            setActividadEnEdicion(prev => ({
                ...prev,
                erogaciones: prev.erogaciones.filter((_, i) => i !== index)
            }));

            showSnackbar("Erogación eliminada correctamente", "success");

        } catch (error) {
            console.error("Error al eliminar erogación:", error);
            showSnackbar("Error al eliminar la erogación", "error");
        }
    };

    const handleAgregarErogacion = async (nuevaErogacion) => {
        try {
            if (!nuevaErogacion.rubro || !nuevaErogacion.valor || !nuevaErogacion.anio) {
                showSnackbar("Debe completar rubro, valor y año", "warning");
                return;
            }

            const data = {
                iderogacionpl: 0,
                rubropl: nuevaErogacion.rubro,
                valor: nuevaErogacion.valor,
                agno: nuevaErogacion.anio,
                idactividad: actividadEnEdicion?.idactividad,
                observacionpl: nuevaErogacion.observaciones || "",
            };


            const res = await fetch(`${API_BASE_URL}/erogacion-pl`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Error al crear erogación");
            const creada = await res.json();


            setActividadEnEdicion((prev) => ({
                ...prev,
                erogaciones: [
                    ...(prev.erogaciones || []),
                    {
                        ...nuevaErogacion,
                        iderogacion: creada.iderogacionpl,
                        rubroNombre: rubros.find((r) => r.id === parseInt(nuevaErogacion.rubro))?.name || "",
                    },
                ],
            }));

            showSnackbar("Erogación guardada correctamente", "success");
        } catch (error) {
            console.error("Error al guardar erogación:", error);
            showSnackbar("Error al guardar la erogación", "error");
        }
    };


    const handleActualizarErogacion = async (index, campo, nuevoValor) => {
        try {
            const erogacion = actividadEnEdicion.erogaciones[index];
            if (!erogacion) return;

            const actualizado = { ...erogacion, [campo]: nuevoValor };

            if (erogacion.iderogacion) {

                const body = {
                    rubropl: actualizado.rubro,
                    valor: actualizado.valor,
                    agno: actualizado.anio,
                    observacionpl: actualizado.observaciones || "",
                    idactividad: actividadEnEdicion?.idactividad,
                };

                const res = await fetch(`${API_BASE_URL}/erogacion-pl/${erogacion.iderogacion}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!res.ok) throw new Error("Error actualizando erogación");
            }


            setActividadEnEdicion((prev) => {
                const nuevas = [...prev.erogaciones];
                nuevas[index] = actualizado;
                return { ...prev, erogaciones: nuevas };
            });

            showSnackbar("Erogación actualizada correctamente", "success");
        } catch (error) {
            console.error("Error actualizando erogación:", error);
            showSnackbar("Error al actualizar la erogación", "error");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setNuevoDocumento((prev) => ({
            ...prev,
            file,
        }));
    };

    const handleObservacionChange = (e) => {
        setNuevoDocumento((prev) => ({
            ...prev,
            observacion: e.target.value,
        }));
    };

    const handleEliminarFactor = async (index) => {
        const factorEliminado = formData.factores[index];
        const idEje = factorEliminado.eje;

        try {

            if (factorEliminado.idfactintegral) {
                await fetch(`${API_BASE_URL}/fin-factor/${factorEliminado.idfactor}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                });
            }


            const nuevosFactores = formData.factores.filter((_, i) => i !== index);


            const existenFactoresDelEje = nuevosFactores.some(f => f.eje === idEje);

            let nuevosEjes = formData.ejes;


            if (!existenFactoresDelEje) {
                const ejeParaEliminar = formData.ejes.find(e => e.idejeprograma === idEje);
                if (ejeParaEliminar?.idejeprograma && ejeParaEliminar?.idproyecto) {
                    await fetch(`${API_BASE_URL}/eje-programa-proyecto/${ejeParaEliminar.idejeprograma}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                    });
                }


                nuevosEjes = formData.ejes.filter(e => e.idejeprograma !== idEje);
            }


            setFormData(prev => ({
                ...prev,
                factores: nuevosFactores,
                ejes: nuevosEjes
            }));

            showSnackbar('Factor y eje eliminados correctamente.', 'success');
        } catch (error) {
            console.error('Error al eliminar factor o eje:', error);
            showSnackbar('Error al eliminar factor o eje.', 'error');
        }
    };

    const handleAgregarDocumento = () => {
        const { file, observacion } = nuevoDocumento;

        if (!file || !observacion.trim()) {
            showSnackbar('complete todos los campos.', 'error')
            return;
        }

        const numero = formData.archivos.length + 1;

        const nuevo = {
            numero,
            nombrearc: file.name,
            observacion,
            file,
        };

        setFormData((prev) => ({
            ...prev,
            archivos: [...prev.archivos, nuevo],
        }));

        setNuevoDocumento({
            file: null,
            observacion: '',
        });


        document.getElementById('file-input').value = '';
    };

    const handleUpdateEjePri = async (ideje, idproyecto) => {
        try {
            const res = await fetch(
                `${API_BASE_URL}/eje-programa-proyecto/principal/${idproyecto}/${ideje}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!res.ok) throw new Error("Error actualizando eje principal");

            setFormData(prev => ({
                ...prev,
                ejes: prev.ejes.map(eje => ({
                    ...eje,
                    ejeppal: Number(eje.idejeprograma) === Number(ideje)
                }))
            }));

            showSnackbar("Eje principal actualizado", "success");

        } catch (error) {
            console.error(error);
            showSnackbar("Error al actualizar eje principal", "error");
        }
    };


    const handleEliminarDocumento = async (index, id) => {


        const response = await fetch(`${API_BASE_URL}/archivos/` + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const nuevos = formData.documentos.filter((_, i) => i !== index);
        const renumerados = nuevos.map((doc, idx) => ({
            ...doc,
            numero: idx + 1,
        }));
        setFormData((prev) => ({ ...prev, documentos: renumerados }));
    };

    const handleAddMetaEspecifica = () => {
        setFormData((prev) => ({
            ...prev,
            metasEspecificas: [...prev.metasEspecificas, ''],
        }));
    };

    const handleRemoveMetaEspecifica = (index) => {
        const nuevasMetas = formData.metasEspecificas.filter((_, i) => i !== index);
        setFormData((prev) => ({
            ...prev,
            metasEspecificas: nuevasMetas,
        }));
    };

    const handleMetaEspecificaChange = (index, value) => {
        const nuevasMetas = [...formData.metasEspecificas];
        nuevasMetas[index] = value;
        setFormData((prev) => ({
            ...prev,
            metasEspecificas: nuevasMetas,
        }));
    };

    const getNombrePorId = (lista, id) => {


        const encontrado = lista.find(item => item.id === id);
        return encontrado ? encontrado.name : '';
    };

    const getNombreResponsable = (codEmp) => {
        if (!responsables || responsables.length === 0 || !codEmp) return '';
        const encontrado = responsables.find(r => String(r.cod_emp).trim() === String(codEmp).trim());
        if (!encontrado) return '';


        return `${encontrado.cod_emp} - ${encontrado.nombres}`;
    };

    const getNombrePorId2 = (lista, id) => {
        const encontrado = lista.find(item => item.id === id);
        return encontrado ? encontrado.name : '';
    };

    const [modalAbierto, setModalAbierto] = useState(false);
    const [actividadEnEdicion, setActividadEnEdicion] = useState(null);

    const handleAddObjetivo = (tipoob) => {
        const nuevo = {
            idobjetivo: null,
            idTemporal: Date.now() + Math.random(),
            descripcionob: '',
            tipoob,
            idproyecto: formData.idproyecto || null,
        };

        setFormData(prev => ({
            ...prev,
            objetivos: [...prev.objetivos, nuevo]
        }));
    };

    const handleChangeObjetivo = (id, tipo, nuevaDescripcion) => {
        const actualizados = formData.objetivos.map(obj =>
            (obj.idobjetivo === id || obj.idTemporal === id) && obj.tipoob === tipo
                ? { ...obj, descripcionob: nuevaDescripcion }
                : obj
        );
        setFormData(prev => ({ ...prev, objetivos: actualizados }));
    };

    const guardarObjetivosPorTipo = async (tipo) => {
        if (!formData.idproyecto) {
            showSnackbar("Debes guardar el proyecto antes de guardar objetivos", "warning");
            return;
        }

        try {
            const objetivosAGuardar = formData.objetivos.filter((obj) => obj.tipoob === tipo);

            if (objetivosAGuardar.length === 0) {
                showSnackbar("No hay objetivos para guardar en esta sección", "info");
                return;
            }

            for (const obj of objetivosAGuardar) {
                const method = obj.idobjetivo ? "PUT" : "POST";
                const url = obj.idobjetivo
                    ? `${API_BASE_URL}/objetivos/${obj.idobjetivo}`
                    : `${API_BASE_URL}/objetivos`;

                const body = {
                    ...obj,
                    idproyecto: formData.idproyecto,
                };

                const response = await fetch(url, {
                    method,
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                });

                if (!response.ok) throw new Error("Error al guardar objetivo");

                const data = await response.json();


                if (!obj.idobjetivo && data.idobjetivo) {
                    setFormData((prev) => ({
                        ...prev,
                        objetivos: prev.objetivos.map((o) =>
                            o.idTemporal === obj.idTemporal ? { ...o, idobjetivo: data.idobjetivo } : o
                        ),
                    }));
                }
            }

            showSnackbar("Objetivos guardados correctamente", "success");
        } catch (error) {
            console.error(error);
            showSnackbar("Error al guardar los objetivos", "error");
        }
    };

    const handleRemoveObjetivo = async (id) => {

        const response = await fetch(`${API_BASE_URL}/objetivos/` + id, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        setFormData(prev => ({
            ...prev,
            objetivos: prev.objetivos.filter(obj => obj.idobjetivo !== id && obj.idTemporal !== id)
        }));
    };

    const getFactores = (fin) => {




        var valores = fines.filter(item => item.relacionfin === `${fin}` && item.relacionfactor === "0")

        setFactores(valores)

    }

    const getCaracteristicas = (fin, factor) => {









        var factorA = fines.find(item => item.id === factor).secuencial;
        var finA = fines.find(item => Number(item.id) === Number(fin)).secuencial;








        var valores = fines.filter(item => item.relacionfin === `${factorA}` && item.relacionfactor === `${finA}`)


        setCaracteristicas(valores)

    }

    const exportarPDF = async () => {
        try {
            const url = `${API_BASE_URL}/reportes/presupuesto/${formData.idproyecto}`



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
        } finally {
            console.log("error")
        }
    };

    const handleVolver = () => {
        navigate(-1);
    };


    const exportarExcel = async () => {

        try {
            const url = `${API_BASE_URL}/reportes/excel/proyecto/${formData.idproyecto}`



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

        } finally {
            console.log("error")
        }
    };

    const finYaDefinido = formData.factores.length > 0;

    const finUsado = finYaDefinido
        ? formData.factores[0].idfin
        : finActual;

    useEffect(() => {
        if (finYaDefinido && formData.factores?.length > 0) {
            const finId = formData.factores[0].idfin;
            getFactores(finId);
        }
    }, [finYaDefinido, formData.factores]);

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <Box mt={3}>
                        <Grid container spacing={2} >
                            <Grid item xs={12} md={12}>
                                <TextField
                                    label="Nombre del proyecto"
                                    name="nombrepr"
                                    value={formData.nombrepr}
                                    onChange={handleChange}
                                    error={!!errors.nombrepr}
                                    helperText={errors.nombrepr}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="pais-label">Plan</InputLabel>
                                    <Select
                                        labelId="plan-label"
                                        name="idplan"
                                        value={formData.idplan}
                                        onChange={handleChange}
                                        label="Plan"
                                    >
                                        {planes.map((status) => (
                                            <MenuItem key={status.id} value={status.id}>
                                                {`${status.name}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.idplan && (
                                        <Typography variant="caption" color="error">
                                            {errors.idplan}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <FormControl sx={{ width: "50%" }}>
                                    <InputLabel id="pais-label">SNIES</InputLabel>
                                    <Select
                                        labelId="plan-label"
                                        name="sniespr"
                                        value={formData.sniespr}
                                        onChange={handleChange}
                                        label="SNIES"
                                    >
                                        {snies.map((status) => (
                                            <MenuItem key={status.id} value={status.id}>
                                                {`${status.name}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.sniespr && (
                                        <Typography variant="caption" color="error">
                                            {errors.sniespr}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="pais-label">Unidad ejecutora</InputLabel>
                                    <Select
                                        labelId="plan-label"
                                        name="unidadejecutora"
                                        value={formData.unidadejecutora}
                                        onChange={handleChange}
                                        label="Unidad ejecutora"
                                    >
                                        {unidadejecutora.map((status) => (
                                            <MenuItem key={status.id} value={status.id}>
                                                {`${status.name}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                    {errors.unidadejecutora && (
                                        <Typography variant="caption" color="error">
                                            {errors.unidadejecutora}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    options={responsables}
                                    getOptionLabel={(option) =>
                                        option.nombres
                                            ? `${option.nombres} `
                                            : ''
                                    }
                                    value={responsables.find(r => r.cod_emp === formData.ccdirectorpr) || null}
                                    onChange={(_, newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            ccdirectorpr: newValue ? newValue.cod_emp : ''
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Director del proyecto"
                                            error={!!errors.ccdirectorpr}
                                            helperText={errors.ccdirectorpr}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    options={responsables}
                                    getOptionLabel={(option) =>
                                        option.nombres
                                            ? option.nombres
                                            : ''
                                    }
                                    value={responsables.find(r => r.cod_emp === formData.ccresponsablepr) || null}
                                    onChange={(_, newValue) => {
                                        setFormData((prev) => ({
                                            ...prev,
                                            ccresponsablepr: newValue ? newValue.cod_emp : ''
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Responsable del proyecto"
                                            error={!!errors.ccresponsablepr}
                                            helperText={errors.ccresponsablepr}
                                            fullWidth
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    type="date"
                                    label="Fecha Inicio"
                                    name="fechainipr"
                                    value={formData.fechainipr}
                                    onChange={handleChange}
                                    error={!!errors.fechainipr}
                                    helperText={errors.fechainipr}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    type="date"
                                    label="Fecha Fin"
                                    name="fechafinpr"
                                    value={formData.fechafinpr}
                                    onChange={handleChange}
                                    error={!!errors.fechainipr}
                                    helperText={errors.fechainipr}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    type="date"
                                    label="Fecha de Creación"
                                    name="fechacrea"
                                    value={formData.fechacrea}
                                    InputLabelProps={{ shrink: true }}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Justificación del Proyecto"
                                    name="justificacionpr"
                                    value={formData.justificacionpr}
                                    onChange={handleChange}
                                    error={!!errors.justificacionpr}
                                    helperText={errors.justificacionpr}
                                    fullWidth
                                    multiline
                                    rows={4}
                                />
                            </Grid>
                        </Grid >
                    </Box>
                );
            case 2:
                return (
                    <Box mt={3}>
                        <Box>
                            <Grid container spacing={2}>
                                { }
                                <Grid item xs={12}>
                                    <Grid item xs={12}>
                                        {formData.objetivos.filter(obj => obj.tipoob === 1).length > 0 ? (
                                            formData.objetivos
                                                .filter(obj => obj.tipoob === 1)
                                                .map((obj) => (
                                                    <TextField
                                                        key={obj.idobjetivo || obj.idTemporal}
                                                        label="Objetivo General"
                                                        value={obj.descripcionob}
                                                        onChange={(e) =>
                                                            handleChangeObjetivo(
                                                                obj.idobjetivo || obj.idTemporal,
                                                                obj.tipoob,
                                                                e.target.value
                                                            )
                                                        }
                                                        fullWidth
                                                        multiline
                                                        rows={4}
                                                    />
                                                ))
                                        ) : (
                                            <>
                                                <Typography color="error" mb={1}>
                                                    No hay objetivo general registrado.
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => handleAddObjetivo(1)}
                                                >
                                                    Crear Objetivo General
                                                </Button>
                                            </>
                                        )}
                                    </Grid>
                                    <Box mt={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => guardarObjetivosPorTipo(1)}
                                        >
                                            Guardar Objetivo General
                                        </Button>
                                    </Box>
                                </Grid>

                                { }
                                <Grid item xs={12} mt={4}>
                                    <Typography variant="h6" mb={3}>
                                        Objetivos Específicos
                                    </Typography>
                                    {formData.objetivos
                                        .filter(obj => obj.tipoob === 2)
                                        .map((obj, index) => (
                                            <Box
                                                key={obj.idobjetivo || obj.idTemporal}
                                                display="flex"
                                                alignItems="center"
                                                gap={2}
                                                mb={2}
                                            >
                                                <TextField
                                                    label={`Objetivo Específico ${index + 1}`}
                                                    value={obj.descripcionob}
                                                    onChange={(e) =>
                                                        handleChangeObjetivo(
                                                            obj.idobjetivo || obj.idTemporal,
                                                            obj.tipoob,
                                                            e.target.value
                                                        )
                                                    }
                                                    fullWidth
                                                    multiline
                                                    rows={3}
                                                />
                                                <Trash
                                                    size="25"
                                                    color="red"
                                                    variant="Bold"
                                                    onClick={() =>
                                                        handleRemoveObjetivo(obj.idobjetivo || obj.idTemporal)
                                                    }
                                                    style={{ cursor: "pointer" }}
                                                />
                                            </Box>
                                        ))}
                                    {errors.objetivosEspecificos && (
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="error">
                                                {errors.objetivosEspecificos}
                                            </Typography>
                                        </Grid>
                                    )}
                                    <Button
                                        variant="outlined"
                                        startIcon={<Add size="20" />}
                                        onClick={() => handleAddObjetivo(2)}
                                    >
                                        Agregar Objetivo Específico
                                    </Button>

                                    <Box mt={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => guardarObjetivosPorTipo(2)}
                                        >
                                            Guardar Objetivos Específicos
                                        </Button>
                                    </Box>
                                </Grid>

                                { }
                                <Grid item xs={12} mt={4}>
                                    <Typography variant="h6" mb={3}>
                                        Metas del Proyecto
                                    </Typography>
                                    {formData.objetivos
                                        .filter(obj => obj.tipoob === 3)
                                        .map((meta, index) => (
                                            <Box
                                                key={meta.idobjetivo || meta.idTemporal}
                                                display="flex"
                                                alignItems="center"
                                                gap={2}
                                                mb={2}
                                            >
                                                <TextField
                                                    label={`Meta ${index + 1}`}
                                                    value={meta.descripcionob}
                                                    onChange={(e) =>
                                                        handleChangeObjetivo(
                                                            meta.idobjetivo || meta.idTemporal,
                                                            meta.tipoob,
                                                            e.target.value
                                                        )
                                                    }
                                                    fullWidth
                                                    multiline
                                                    rows={2}
                                                />
                                                <Trash
                                                    size="25"
                                                    color="red"
                                                    variant="Bold"
                                                    onClick={() =>
                                                        handleRemoveObjetivo(meta.idobjetivo || meta.idTemporal)
                                                    }
                                                    style={{ cursor: "pointer" }}
                                                />
                                            </Box>
                                        ))}
                                    {errors.metasEspecificas && (
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="error">
                                                {errors.metasEspecificas}
                                            </Typography>
                                        </Grid>
                                    )}
                                    <Button
                                        variant="outlined"
                                        startIcon={<Add size="20" />}
                                        onClick={() => handleAddObjetivo(3)}
                                    >
                                        Agregar Meta
                                    </Button>

                                    <Box mt={2}>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => guardarObjetivosPorTipo(3)}
                                        >
                                            Guardar Metas
                                        </Button>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Box>
                        <Divider sx={{ my: 3 }} />

                        { }
                        <Grid container spacing={2} alignItems="center" mt={2}>
                            <Grid item xs={12}>
                                <Typography variant="h6">Agregar Indicador</Typography>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Nombre"
                                    name="nombreind"
                                    value={nuevoIndicador.nombreind}
                                    onChange={handleChangeIndicador}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Periodicidad"
                                    name="periodicidadind"
                                    value={nuevoIndicador.periodicidadind}
                                    onChange={handleChangeIndicador}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    label="Descripción"
                                    name="descripcioncal"
                                    value={nuevoIndicador.descripcioncal}
                                    onChange={handleChangeIndicador}
                                    fullWidth
                                />
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add size="20" />}

                                    onClick={handleAgregarIndicador}
                                    fullWidth
                                >
                                    Agregar
                                </Button>
                            </Grid>
                        </Grid>

                        { }
                        {formData.indicadores.length > 0 && (
                            <Grid item xs={12}>
                                <Typography variant="h6" mt={4}>Indicadores</Typography>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>

                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Periodicidad</TableCell>
                                            <TableCell>Descripción</TableCell>
                                            <TableCell>Acciones</TableCell>

                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.indicadores.map((ind, idx) => (
                                            <TableRow key={ind.idindicador || idx}>

                                                { }
                                                <TableCell>
                                                    {editIndex === idx ? (
                                                        <TextField
                                                            size="small"
                                                            value={indicadorEditando.nombreind}
                                                            onChange={(e) =>
                                                                setIndicadorEditando({
                                                                    ...indicadorEditando,
                                                                    nombreind: e.target.value,
                                                                })
                                                            }
                                                            fullWidth
                                                        />
                                                    ) : (
                                                        ind.nombreind
                                                    )}
                                                </TableCell>

                                                { }
                                                <TableCell>
                                                    {editIndex === idx ? (
                                                        <TextField
                                                            size="small"
                                                            value={indicadorEditando.periodicidadind}
                                                            onChange={(e) =>
                                                                setIndicadorEditando({
                                                                    ...indicadorEditando,
                                                                    periodicidadind: e.target.value,
                                                                })
                                                            }
                                                            fullWidth
                                                        />
                                                    ) : (
                                                        ind.periodicidadind
                                                    )}
                                                </TableCell>

                                                { }
                                                <TableCell>
                                                    {editIndex === idx ? (
                                                        <TextField
                                                            size="small"
                                                            value={indicadorEditando.descripcioncal}
                                                            onChange={(e) =>
                                                                setIndicadorEditando({
                                                                    ...indicadorEditando,
                                                                    descripcioncal: e.target.value,
                                                                })
                                                            }
                                                            fullWidth
                                                        />
                                                    ) : (
                                                        ind.descripcioncal
                                                    )}
                                                </TableCell>

                                                { }
                                                <TableCell align="center">
                                                    {editIndex === idx ? (
                                                        <>
                                                            { }
                                                            <IconButton
                                                                color="success"
                                                                onClick={handleGuardarEdicionIndicador}
                                                            >
                                                                <TickCircle size="22" />
                                                            </IconButton>

                                                            { }
                                                            <IconButton
                                                                color="error"
                                                                onClick={handleCancelarEdicionIndicador}
                                                            >
                                                                <CloseCircle size="22" />
                                                            </IconButton>
                                                        </>
                                                    ) : (
                                                        <>
                                                            { }
                                                            <IconButton onClick={() => handleEditarIndicador(idx)}>
                                                                <Edit size="22" />
                                                            </IconButton>

                                                            <IconButton
                                                                color="error"
                                                                onClick={async () => {
                                                                    const indicador = formData.indicadores[idx];

                                                                    if (!window.confirm("¿Desea eliminar este indicador?")) return;

                                                                    try {
                                                                        if (indicador.idindicador) {
                                                                            await fetch(
                                                                                `${API_BASE_URL}/indicadores/${indicador.idindicador}`,
                                                                                {
                                                                                    method: "DELETE",
                                                                                    headers: { "Content-Type": "application/json" },
                                                                                }
                                                                            );
                                                                        }

                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            indicadores: prev.indicadores.filter((_, i) => i !== idx),
                                                                        }));

                                                                        showSnackbar("Indicador eliminado correctamente", "success");
                                                                    } catch (error) {
                                                                        console.error("Error al eliminar indicador:", error);
                                                                        showSnackbar("Error al eliminar el indicador", "error");
                                                                    }
                                                                }}
                                                            >
                                                                <Trash size="22" />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Grid>
                        )}
                        {errors.indicadores && (
                            <Grid item xs={12}>
                                <Typography variant="caption" color="error">
                                    {errors.indicadores}
                                </Typography>
                            </Grid>
                        )}

                    </Box>
                );
            case 3:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Agregar Actividades</Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Actividad Nro."
                                    value={
                                        editIndex !== null
                                            ? formData.actividades[editIndex].consecutivoact
                                            : formData.actividades.length + 1
                                    }
                                    fullWidth
                                    disabled
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Nombre Actividad"
                                    name="nombreact"
                                    value={nuevaActividad.nombreact}
                                    onChange={handleChangeActividad}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    type="date"
                                    label="Fecha Inicio"
                                    name="fechainiact"
                                    value={nuevaActividad.fechainiact}
                                    onChange={handleChangeActividad}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    type="date"
                                    label="Fecha Fin"
                                    name="fechafinact"
                                    value={nuevaActividad.fechafinact}
                                    onChange={handleChangeActividad}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="% en Proyecto"
                                    name="porcproyectoact"
                                    value={nuevaActividad.porcproyectoact}
                                    onChange={handleChangeActividad}
                                    fullWidth
                                    type="number"
                                    inputProps={{ min: 0, max: 100 }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Autocomplete
                                    options={responsables}
                                    getOptionLabel={(option) =>
                                        option.nombres
                                            ? option.nombres
                                            : ''
                                    }
                                    value={
                                        responsables.find(r => r.cod_emp === nuevaActividad.responsableact) ||
                                        responsables.find(r => r.cod_emp === formData.ccresponsablepr) ||
                                        null
                                    }
                                    onChange={(_, newValue) => {
                                        setNuevaActividad((prev) => ({
                                            ...prev,
                                            responsableact: newValue ? newValue.cod_emp : formData.ccresponsablepr
                                        }));
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Responsable actividad"
                                            fullWidth
                                        />
                                    )}
                                />

                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Descripción de la Actividad"
                                    name="descripcionact"
                                    value={nuevaActividad.descripcionact}
                                    onChange={handleChangeActividad}
                                    fullWidth
                                    multiline
                                    rows={3}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add size="20" />}

                                    onClick={handleAgregarActividad}
                                >
                                    {editIndex !== null ? 'Guardar Edición' : 'Crear Actividad'}
                                </Button>
                            </Grid>
                        </Grid>

                        {formData.actividades.length > 0 && (
                            <>
                                <Typography variant="h6" mt={4}>Actividades Registradas {formData.actividades.length}</Typography>
                                <Box sx={{ width: "100%", overflowX: "auto" }}>
                                    <Table stickyHeader sx={{ minWidth: 900 }}> { }
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nro</TableCell>
                                                <TableCell>Nombre</TableCell>
                                                <TableCell>Inicio</TableCell>
                                                <TableCell>Fin</TableCell>
                                                <TableCell>Responsable</TableCell>
                                                <TableCell>Descripción</TableCell>
                                                <TableCell>% Proyecto</TableCell>
                                                <TableCell>% Avance</TableCell>
                                                <TableCell>Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {formData.actividades.map((act, idx) => (
                                                <TableRow key={idx}>
                                                    <TableCell>{act.consecutivoact}</TableCell>
                                                    <TableCell>{act.nombreact}</TableCell>
                                                    <TableCell>{act.fechainiact}</TableCell>
                                                    <TableCell>{act.fechafinact}</TableCell>
                                                    <TableCell>{getNombreResponsable(act.responsableact)}</TableCell>
                                                    <TableCell>{act.descripcionact}</TableCell>
                                                    <TableCell>{act.porcproyectoact}</TableCell>
                                                    <TableCell>{act.porcejecucionact}</TableCell>
                                                    <TableCell>
                                                        <IconButton
                                                            color="success"
                                                            onClick={() => handleEditarActividad(idx)}
                                                        >
                                                            <Edit size="22" />
                                                        </IconButton>
                                                        <IconButton
                                                            color="error"
                                                            onClick={() => handleEliminarActividad(idx)}
                                                        >
                                                            <Trash size="22" />
                                                        </IconButton>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            </>
                        )}
                    </Box>
                );
            case 4:
                return (
                    <Box>
                        <Typography variant="h6" gutterBottom>Adjuntar Documentos</Typography>

                        { }
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Observación"
                                    name="observacion"
                                    value={nuevoDocumento.observacion}
                                    onChange={handleObservacionChange}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Button variant="outlined" component="label" fullWidth>
                                    Seleccionar Archivo
                                    <input
                                        id="file-input"
                                        type="file"
                                        hidden
                                        onChange={handleFileChange}
                                    />
                                </Button>
                                {nuevoDocumento.file && (
                                    <Typography variant="body2" mt={1}>
                                        Archivo seleccionado: {nuevoDocumento.file.name}
                                    </Typography>
                                )}
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add size="20" />}
                                    onClick={async () => {
                                        if (!nuevoDocumento.file) {
                                            showSnackbar("Seleccione un archivo", "error");
                                            return;
                                        }

                                        if (!formData.idproyecto) {
                                            showSnackbar("Debe guardar primero el proyecto antes de subir archivos", "warning");
                                            return;
                                        }

                                        try {
                                            const formDataUpload = new FormData();
                                            formDataUpload.append("file", nuevoDocumento.file);
                                            formDataUpload.append("idproyecto", formData.idproyecto);
                                            formDataUpload.append("idactividad", 0);
                                            formDataUpload.append("seguimiento", 0);
                                            formDataUpload.append("observacion", nuevoDocumento.observacion || "");

                                            const res = await axios.post(`${API_BASE_URL}/archivos/upload`, formDataUpload, {
                                                headers: { "Content-Type": "multipart/form-data" }
                                            });

                                            const nuevoArchivo = res.data;
                                            setFormData((prev) => ({
                                                ...prev,
                                                archivos: [...prev.archivos, nuevoArchivo],
                                            }));

                                            setNuevoDocumento({ file: null, observacion: "" });
                                            document.getElementById("file-input").value = "";
                                            showSnackbar("Archivo cargado correctamente", "success");
                                        } catch (error) {
                                            console.error("Error al subir archivo:", error);
                                            showSnackbar("Error al subir el archivo", "error");
                                        }
                                    }}
                                >
                                    Subir Documento
                                </Button>
                            </Grid>
                        </Grid>

                        { }
                        {formData.archivos.length > 0 ? (
                            <Box mt={4}>
                                <Typography variant="h6">Documentos Adjuntos</Typography>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nombre Archivo</TableCell>
                                            <TableCell>Observación</TableCell>
                                            <TableCell align="right">Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.archivos.map((a) => (
                                            <TableRow key={a.idarchivo}>
                                                <TableCell>{a.nombreorig || a.nombrearc}</TableCell>
                                                <TableCell>{a.observacion}</TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={() =>
                                                            window.open(`${API_BASE_URL}/archivos/download/${a.idarchivo}`, "_blank")
                                                        }
                                                    >
                                                        <DocumentDownload size={18} />
                                                    </IconButton>

                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        onClick={async () => {
                                                            if (!window.confirm("¿Desea eliminar este archivo?")) return;
                                                            try {
                                                                await axios.delete(`${API_BASE_URL}/archivos/${a.idarchivo}`);
                                                                setFormData((prev) => ({
                                                                    ...prev,
                                                                    archivos: prev.archivos.filter((x) => x.idarchivo !== a.idarchivo),
                                                                }));
                                                                showSnackbar("Archivo eliminado correctamente", "success");
                                                            } catch (err) {
                                                                console.error(err);
                                                                showSnackbar("Error al eliminar el archivo", "error");
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
                            </Box>
                        ) : (
                            <Typography mt={2}>No hay archivos registrados.</Typography>
                        )}
                    </Box>
                );
            case 1: {




                const planSeleccionado = planes.find(p => p.id === formData.idplan);


                const esMejoramiento = planSeleccionado.name === "Mejoramiento";

                return (
                    <Box>

                        {esMejoramiento && (
                            <Box mt={5}>
                                <Typography variant="h6">Asignar Factor por Fin de Evaluación</Typography>

                                {!finYaDefinido && (
                                    <FormControl fullWidth sx={{ mt: 2 }}>
                                        <InputLabel id="fin-label">Fin de Evaluación</InputLabel>
                                        <Select
                                            labelId="fin-label"
                                            value={finActual}
                                            onChange={(e) => {
                                                setFinActual(e.target.value);
                                                getFactores(e.target.value);
                                                setFactorActual('');
                                                setCaracteristicaActual([]);
                                            }}
                                        >
                                            {finesEvaluacion.map((fin) => (
                                                <MenuItem key={fin.id} value={fin.id}>
                                                    {fin.name}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}
                                {finYaDefinido && (
                                    <Box mt={2}>
                                        <Alert severity="info">
                                            <strong>Fin de Evaluación:</strong>{" "}
                                            {fines.find(f => f.id === Number(formData.factores[0].idfin))?.name}
                                        </Alert>
                                    </Box>
                                )}

                                {(finActual || finYaDefinido) && (
                                    <FormControl fullWidth sx={{ mt: 2 }}>
                                        <InputLabel id="factor-label">Factor</InputLabel>
                                        <Select
                                            labelId="factor-label"
                                            value={factorActual}
                                            onChange={(e) => {
                                                const factor = e.target.value;
                                                setFactorActual(factor);



                                                getCaracteristicas(finUsado, factor);
                                                setCaracteristicaActual([]);
                                            }}
                                        >
                                            {factores.map((f) => (
                                                <MenuItem key={f.id} value={f.id}>{f.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                )}

                                {factorActual && (finActual || finYaDefinido) && (
                                    <FormControl fullWidth sx={{ mt: 2 }}>
                                        <InputLabel id="caracteristica-label">Característica</InputLabel>
                                        <Select
                                            labelId="caracteristica-label"
                                            multiple
                                            value={caracteristicaActual}
                                            onChange={(e) => setCaracteristicaActual(e.target.value)}
                                            renderValue={(selected) =>
                                                caracteristicas
                                                    .filter(c => selected.includes(c.id))
                                                    .map(c => c.name)
                                                    .join(', ')
                                            }
                                        >
                                            {caracteristicas
                                                .map((c) => (
                                                    <MenuItem key={c.id} value={c.id}>
                                                        <Checkbox checked={caracteristicaActual.includes(c.id)} />
                                                        {c.name}
                                                    </MenuItem>
                                                ))}
                                        </Select>
                                    </FormControl>
                                )}

                                <Box mt={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add size="20" />}

                                        onClick={async () => {
                                            if (!caracteristicaActual || caracteristicaActual.length === 0) {
                                                showSnackbar("Debe seleccionar al menos una característica", "warning");
                                                return;
                                            }

                                            try {
                                                for (const element of caracteristicaActual) {
                                                    const caracteristicaData = caracteristicas.find(c => c.id === parseInt(element));
                                                    if (!caracteristicaData) continue;

                                                    let idEje = caracteristicaData.eje;
                                                    const existeEje = formData.ejes.some(e => e.idejeprograma === idEje);

                                                    if (!existeEje) {
                                                        const ejeBody = {
                                                            idejeprograma: idEje,
                                                            idproyecto: formData.idproyecto,
                                                            ejeppal: 0
                                                        };

                                                        const resEje = await fetch(`${API_BASE_URL}/eje-programa-proyecto`, {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify(ejeBody)
                                                        });

                                                        if (!resEje.ok) throw new Error("Error guardando eje");
                                                    }

                                                    const factorBody = {
                                                        idproyecto: formData.idproyecto,
                                                        idfactor: caracteristicaData.relacionfactor,
                                                        idfin: caracteristicaData.relacionfin,
                                                        nombrecaract: caracteristicaData.name,
                                                        idfactintegral: caracteristicaData.facintegral,
                                                        eje: idEje
                                                    };


                                                    const resFactor = await fetch(`${API_BASE_URL}/fin-factor`, {
                                                        method: "POST",
                                                        headers: { "Content-Type": "application/json" },
                                                        body: JSON.stringify(factorBody)
                                                    });

                                                    if (!resFactor.ok) throw new Error("Error guardando factor");
                                                    const creado = await resFactor.json();


                                                    setFormData(prev => {
                                                        const nuevosFactores = [...prev.factores, { ...factorBody, idfactor: creado.idfactor }];
                                                        const nuevosEjes = existeEje
                                                            ? prev.ejes
                                                            : [...prev.ejes, { idejeprograma: idEje, idproyecto: formData.idproyecto, ejeppal: false }];
                                                        return { ...prev, factores: nuevosFactores, ejes: nuevosEjes };
                                                    });
                                                }


                                                if (!finYaDefinido) {
                                                    setFinActual('');
                                                }
                                                setFactorActual('');
                                                setCaracteristicaActual([]);
                                                showSnackbar("Factores y ejes guardados correctamente", "success");
                                            } catch (error) {
                                                console.error("Error al guardar factores:", error);
                                                showSnackbar("Error al guardar factores o ejes", "error");
                                            }
                                        }}

                                        disabled={!caracteristicaActual}
                                    >
                                        Crear Factor y características
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {!esMejoramiento && (
                            <Box mt={5}>
                                <Typography variant="h6">
                                    Asignar Ejes Estratégicos
                                </Typography>

                                <FormControl fullWidth sx={{ mt: 2 }}>
                                    <InputLabel id="eje-label">Eje Estratégico</InputLabel>
                                    <Select
                                        labelId="eje-label"
                                        value={ejeActual || ''}
                                        onChange={(e) => setEjeActual(e.target.value)}
                                    >
                                        {ejes.map((eje) => (
                                            <MenuItem key={eje.id} value={eje.id}>
                                                {eje.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <Box mt={2}>
                                    <Button
                                        variant="contained"
                                        startIcon={<Add size="20" />}
                                        disabled={!ejeActual}
                                        onClick={async () => {

                                            const existe = formData.ejes.some(
                                                e => Number(e.idejeprograma) === Number(ejeActual)
                                            );

                                            if (existe) {
                                                showSnackbar("El eje ya fue agregado", "warning");
                                                return;
                                            }

                                            try {
                                                const body = {
                                                    idejeprograma: ejeActual,
                                                    idproyecto: formData.idproyecto,
                                                    ejeppal: 0
                                                };

                                                const res = await fetch(`${API_BASE_URL}/eje-programa-proyecto`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify(body)
                                                });

                                                if (!res.ok) throw new Error("Error guardando eje");

                                                setFormData(prev => ({
                                                    ...prev,
                                                    ejes: [...prev.ejes, body]
                                                }));

                                                setEjeActual('');
                                                showSnackbar("Eje agregado correctamente", "success");

                                            } catch (error) {
                                                console.error(error);
                                                showSnackbar("Error al guardar el eje", "error");
                                            }
                                        }}
                                    >
                                        Agregar Eje
                                    </Button>
                                </Box>
                            </Box>
                        )}


                        {esMejoramiento && formData.factores.length > 0 && (
                            <Box mt={4}>
                                <Typography variant="h6">Factores Asignados</Typography>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Fin</TableCell>
                                            <TableCell>Factor</TableCell>
                                            <TableCell>Característica</TableCell>
                                            <TableCell>Eje</TableCell> { }
                                            <TableCell>Eliminar</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {formData.factores.map((item, idx) => (
                                            <TableRow key={idx}>

                                                <TableCell>{fines.find(item2 => item2.id === Number(item.idfin)).name}</TableCell>
                                                <TableCell>{fines.find(item2 => item2.relacionfin === `${item.idfin}` && item2.secuencial === Number(item.idfactor))?.name}</TableCell>
                                                <TableCell>{item.nombrecaract}</TableCell>
                                                <TableCell>{item.eje}</TableCell>
                                                <TableCell>
                                                    <Trash
                                                        size="20"
                                                        color="red"
                                                        variant="Bold"
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => handleEliminarFactor(idx)}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>


                            </Box>
                        )
                        }

                        {formData.ejes.map((item, idx) => (
                            <Card sx={{ p: 3, width: "100%", mb: 3, position: "relative" }} key={idx}>
                                <Box sx={{ position: "absolute", top: 16, right: 16, display: "flex", gap: 1 }}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        size="small"
                                        onClick={() => handleUpdateEjePri(item.idejeprograma, item.idproyecto)}
                                        startIcon={<Star color={item.ejeppal ? "yellow" : "white"} />}
                                    >
                                        EJE PRINCIPAL
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="error"
                                        size="small"
                                        onClick={() => handleEliminarEje(item)}
                                        disabled={item.ejeppal}
                                    >
                                        ELIMINAR
                                    </Button>
                                </Box>
                                <Typography variant="subtitle1" gutterBottom><strong>{item.idejeprograma}</strong></Typography>

                                <Typography variant="subtitle1" gutterBottom><strong>Nombre EJE</strong></Typography>
                                <TextField
                                    disabled
                                    value={ejes.find(e => e.id === Number(item.idejeprograma))?.name || "-"}
                                    fullWidth
                                    variant="outlined"
                                    size="small"
                                    InputProps={{ readOnly: true }}
                                    sx={{ mb: 2 }}
                                />

                                <Typography variant="subtitle1" gutterBottom><strong>Objetivo General</strong></Typography>
                                <TextField
                                    disabled
                                    value={ejes.find(e => e.id === Number(item.idejeprograma))?.objective || "-"}
                                    fullWidth
                                    multiline
                                    rows={3}
                                    variant="outlined"
                                    InputProps={{ readOnly: true }}
                                />
                            </Card>
                        ))}
                    </Box >

                );
            }
            case 5:
                return (
                    <Box>
                        <Accordion defaultExpanded>
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


                                            formData.actividades.map((act, idx) => {
                                                const totalDedicacion = dedicacionPorActividad[act.idactividad]?.reduce((sum, e) => sum + (e.valor || 0), 0) || 0;
                                                const totalErogacion = erogacionesPorActividad[act.idactividad]?.reduce((sum, e) => sum + (e.valor || 0), 0) || 0;
                                                const totalActividad = totalDedicacion + totalErogacion;

                                                sumaErogacion += totalErogacion;
                                                sumaPersonal += totalDedicacion;
                                                sumaTotal += totalActividad;

                                                return (
                                                    <TableRow key={idx}>
                                                        <TableCell >{act.nombreact}</TableCell>
                                                        <TableCell align="right">${totalDedicacion.toLocaleString()}</TableCell>
                                                        <TableCell align="right">${totalErogacion.toLocaleString()}</TableCell>
                                                        <TableCell align="right">${totalActividad.toLocaleString()}</TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        <TableRow sx={{ fontWeight: "bold" }}>
                                            <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                ${sumaPersonal.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                ${sumaErogacion.toLocaleString()}
                                            </TableCell>
                                            <TableCell align="right" sx={{ fontWeight: "bold" }}>
                                                ${sumaTotal.toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </AccordionDetails>
                        </Accordion>

                        <Box display="flex" justifyContent="flex-end" gap={2} my={2}>

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


                    </Box>
                );
            default:
                return null;
        }
    };

    const [loadingArchivos, setLoadingArchivos] = useState(false);
    const [openDetallesActividad, setOpenDetallesActividad] = useState({});

    const toggleDetalleActividad = (idactividad) => {
        setOpenDetallesActividad((prev) => ({
            ...prev,
            [idactividad]: !prev[idactividad],
        }));
    };


    const [dedicaciones, setDedicaciones] = useState();
    const [erogaciones, setErogaciones] = useState();

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


    const recargarDatosProyecto = async (id) => {




        try {
            const response = await axios.get(`${API_BASE_URL}/proyectos/${id}`);
            const proyecto2 = response.data;

            var data = proyecto2



            if (data) {



                setProyecto({
                    ...data,
                    fechainipr: data.fechainipr?.split('T')[0] || '',
                    fechafinpr: data.fechafinpr?.split('T')[0] || '',
                    fechacrea: data.fechacrea?.split('T')[0] || new Date().toISOString().split('T')[0],
                });

                setFormData({
                    ...data,
                    fechainipr: data.fechainipr?.split('T')[0] || '',
                    fechafinpr: data.fechafinpr?.split('T')[0] || '',
                    fechacrea: data.fechacrea?.split('T')[0] || new Date().toISOString().split('T')[0],
                });

                if (data.actividades.length > 0) {



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



                if (modoEdicion) {
                    datosIniciales = {
                        ...data,
                        fechainipr: data.fechainipr?.split('T')[0] || '',
                        fechafinpr: data.fechafinpr?.split('T')[0] || '',
                        fechacrea: data.fechacrea?.split('T')[0] || new Date().toISOString().split('T')[0],
                    };
                }
            }
        } catch (error) {
            console.error('error recargando datos del proyecto:', error);
        }
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
    const getNombrePorStr = (lista, id) => {
        if (!lista || lista.length === 0 || !id) return '-';
        const encontrado = lista.find(item =>
            String(item.cod_emp).trim() === String(id).trim()
        );
        return encontrado ? encontrado.nombres : '-';
    };

    const guardarPersonalYHoras = async (actividadId, personalList) => {



        try {
            for (const e of personalList) {
                let idPersonal = e.idpersonal;

                const dataPersonal = {
                    idpersonal: idPersonal || 0,
                    nombreparticpprs: e.nombreparticpprs,
                    cargoparticprs: e.cargoparticprs,
                    valorprs: e.valorprs,
                    idactividad: actividadId,
                    estado: 1
                };

                if (!idPersonal) {

                    const res = await fetch(`${API_BASE_URL}/personal`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataPersonal)
                    });

                    if (!res.ok) throw new Error('Error creando personal');
                    const creado = await res.json();
                    idPersonal = creado.idpersonal;
                } else {

                    const res = await fetch(`${API_BASE_URL}/personal/${idPersonal}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(dataPersonal)
                    });

                    if (!res.ok) throw new Error('Error actualizando personal');
                }


                for (const registro of e.horas) {
                    const { agno, horas, CantPer } = registro;


                    await fetch(`${API_BASE_URL}/horas-personal/${idPersonal}/${agno}`, {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' }
                    });


                    const bodyHoras = {
                        id: { idPersonal: idPersonal, agno: agno },
                        horas: horas,
                        cantPer: CantPer
                    };

                    await fetch(`${API_BASE_URL}/horas-personal`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(bodyHoras)
                    });
                }
            }

            showSnackbar('Personal y horas guardados correctamente', 'success');
        } catch (error) {
            console.error('Error guardando personal y horas:', error);
            showSnackbar('Error al guardar personal y horas', 'error');
        }
    };



    const guardarStep = async () => {


        setIsSubmitting(true);




        try {

            if (activeStep === 0) {





                if (formData.idproyecto != undefined) {


                    setIdProyecto(formData.idproyecto)

                    const dataUpdate = {
                        "idproyecto": formData.idproyecto,
                        "nombrepr": formData.nombrepr,
                        "tipopr": "string",
                        "ccdirectorpr": formData.ccdirectorpr,
                        "ccresponsablepr": formData.ccresponsablepr,
                        "metapr": "",
                        "justificacionpr": formData.justificacionpr,
                        "fechainipr": formData.fechainipr + "T00:00:00",
                        "fechafinpr": formData.fechafinpr + "T00:00:00",
                        "estadopr": 1,
                        "valorproyectadopr": 0,
                        "valorejecutadopr": 0,
                        "porcejecucionsispr": 0,
                        "porcejecuciondirpr": 0,
                        "observacionpr": "",
                        "ccusucreapr": "",
                        "idplan": formData.idplan,
                        "fechacrea": formData.fechacrea + "T00:00:00",
                        "estadoejecucion": 1,
                        "unidadejecutora": formData.unidadejecutora,
                        "fin": 0,
                        "factor": 0,
                        "observacionadmin": "",
                        "nivelalerta": 0,
                        "valorejero": 0,
                        "valorejper": 0,
                        "valorplero": 0,
                        "valorplper": 0,
                        "megapro": "P",
                        "prioridadpr": 0,
                        "sniespr": formData.sniespr
                    }

                    try {
                        const response = await fetch(`${API_BASE_URL}/proyectos/` + formData.idproyecto, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(dataUpdate),
                        });

                        setIsSubmitting(false)




                    } catch (error) {
                        showSnackbar("error al guardar", "error")


                        setIsSubmitting(false)
                    } finally {
                        setIsSubmitting(false);
                    }



                } else {



                    const dataSave = JSON.stringify({
                        "nombrepr": formData.nombrepr,
                        "tipopr": "string",
                        "ccdirectorpr": formData.ccdirectorpr,
                        "ccresponsablepr": formData.ccresponsablepr,
                        "metapr": "",
                        "justificacionpr": formData.justificacionpr,
                        "fechainipr": formData.fechainipr + "T00:00:00",
                        "fechafinpr": formData.fechafinpr + "T00:00:00",
                        "estadopr": 1,
                        "valorproyectadopr": 0,
                        "valorejecutadopr": 0,
                        "porcejecucionsispr": 0,
                        "porcejecuciondirpr": 0,
                        "observacionpr": "",
                        "ccusucreapr": "",
                        "idplan": formData.idplan,
                        "fechacrea": formData.fechacrea + "T00:00:00",
                        "estadoejecucion": 1,
                        "unidadejecutora": formData.unidadejecutora,
                        "fin": 0,
                        "factor": 0,
                        "observacionadmin": "",
                        "nivelalerta": 0,
                        "valorejero": 0,
                        "valorejper": 0,
                        "valorplero": 0,
                        "valorplper": 0,
                        "megapro": "P",
                        "prioridadpr": 0,
                        "sniespr": formData.sniespr
                    })

                    try {

                        const myHeaders = new Headers();
                        myHeaders.append("Content-Type", "application/json");



                        const requestOptions = {
                            method: "POST",
                            headers: myHeaders,
                            body: dataSave,
                            redirect: "follow"
                        };

                        await fetch(`${API_BASE_URL}/proyectos`, requestOptions)
                            .then((response) => response.text())
                            .then((result) => {


                                var respuesta = JSON.parse(result);



                                recargarDatosProyecto(respuesta.idproyecto)
                                setIdProyecto(respuesta.idproyecto)



                            })
                            .catch((error) => console.error(error));



                        setIsSubmitting(false)

                    } catch (error) {
                        showSnackbar("error al guardar", "error")


                        setIsSubmitting(false)
                    } finally {
                        setIsSubmitting(false);
                    }


                }

            }






            return true;
        } catch (error) {
            console.error(`Error guardando paso ${activeStep}:`, error);
            showSnackbar('no se pudo guardar el paso intenta de nuevo', 'error')
            return false;
        } finally {
            setIsSubmitting(false);
        }


    };

    const [nuevoIndicadorEdit, setNuevoIndicadorEdit] = useState({
        nombre: '',
        periodicidad: '',
        descripcion: '',
    });

    const [nuevaErogacion, setNuevaErogacion] = useState({
        rubro: '',
        anio: '',
        valor: '',
        observaciones: '',
    });


    const [rubroSeleccionado, setRubroSeleccionado] = useState('');

    const [detalleErogacion, setDetalleErogacion] = useState({
        anio: '',
        valor: '',
        observaciones: '',
    });

    const [erogacionesTmp, setErogacionesTmp] = useState([]);


    const handleGuardarYSalir = async () => {


        if (validateStep()) {


            setIsSubmitting(true);




            if (activeStep === 0) {





                if (formData.idproyecto != undefined) {


                    setIdProyecto(formData.idproyecto)

                    const dataUpdate = {
                        "idproyecto": formData.idproyecto,
                        "nombrepr": formData.nombrepr,
                        "tipopr": "string",
                        "ccdirectorpr": formData.ccdirectorpr,
                        "ccresponsablepr": formData.ccresponsablepr,
                        "metapr": "",
                        "justificacionpr": formData.justificacionpr,
                        "fechainipr": formData.fechainipr + "T00:00:00",
                        "fechafinpr": formData.fechafinpr + "T00:00:00",
                        "estadopr": 1,
                        "valorproyectadopr": 0,
                        "valorejecutadopr": 0,
                        "porcejecucionsispr": 0,
                        "porcejecuciondirpr": 0,
                        "observacionpr": "",
                        "ccusucreapr": "",
                        "idplan": formData.idplan,
                        "fechacrea": formData.fechacrea + "T00:00:00",
                        "estadoejecucion": 1,
                        "unidadejecutora": formData.unidadejecutora,
                        "fin": 0,
                        "factor": 0,
                        "observacionadmin": "",
                        "nivelalerta": 0,
                        "valorejero": 0,
                        "valorejper": 0,
                        "valorplero": 0,
                        "valorplper": 0,
                        "megapro": "P",
                        "prioridadpr": 0,
                        "sniespr": formData.sniespr
                    }

                    try {
                        const response = await fetch(`${API_BASE_URL}/proyectos/` + formData.idproyecto, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(dataUpdate),
                        });
                        navigate(paths.dashboard.gestion.gestionProyectosActivos);

                        setIsSubmitting(false)


                    } catch (error) {
                        showSnackbar("error al guardar", "error")



                        setIsSubmitting(false)
                    } finally {
                        setIsSubmitting(false);
                    }



                } else {

                    const dataSave = {
                        "nombrepr": formData.nombrepr,
                        "tipopr": "string",
                        "ccdirectorpr": formData.ccdirectorpr,
                        "ccresponsablepr": formData.ccresponsablepr,
                        "metapr": "",
                        "justificacionpr": formData.justificacionpr,
                        "fechainipr": formData.fechainipr + "T00:00:00",
                        "fechafinpr": formData.fechafinpr + "T00:00:00",
                        "estadopr": 1,
                        "valorproyectadopr": 0,
                        "valorejecutadopr": 0,
                        "porcejecucionsispr": 0,
                        "porcejecuciondirpr": 0,
                        "observacionpr": "",
                        "ccusucreapr": "",
                        "idplan": formData.idplan,
                        "fechacrea": formData.fechacrea + "T00:00:00",
                        "estadoejecucion": 1,
                        "unidadejecutora": formData.unidadejecutora,
                        "fin": 0,
                        "factor": 0,
                        "observacionadmin": "",
                        "nivelalerta": 0,
                        "valorejero": 0,
                        "valorejper": 0,
                        "valorplero": 0,
                        "valorplper": 0,
                        "megapro": "P",
                        "prioridadpr": 0,
                        "sniespr": formData.sniespr
                    }

                    try {

                        const response = await fetch(`${API_BASE_URL}/proyectos`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(dataSave),
                        });

                        navigate(paths.dashboard.gestion.gestionProyectosActivos);

                        setIsSubmitting(false)

                    } catch (error) {
                        showSnackbar("error al guardar", "error")



                        setIsSubmitting(false)
                    } finally {
                        setIsSubmitting(false);
                    }


                }

            }

            else if (activeStep === 2) {


                var objetivos = formData.objetivos;




                try {


                    for (let index = 0; index < objetivos.length; index++) {
                        const element = objetivos[index];



                        if (element.idobjetivo === null) {



                            var dataSaveOb = {

                                "descripcionob": element.descripcionob,
                                "tipoob": element.tipoob,
                                "idproyecto": idProyecto
                            }



                            const response = await fetch(`${API_BASE_URL}/objetivos`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataSaveOb),
                            });



                        } else {



                            var dataEditOb = JSON.stringify({
                                "idobjetivo": element.idobjetivo,
                                "descripcionob": element.descripcionob,
                                "tipoob": element.tipoob,
                                "idproyecto": idProyecto
                            })





                            let config = {
                                method: 'put',
                                maxBodyLength: Infinity,
                                url: `${API_BASE_URL}/objetivos/` + element.idobjetivo,
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                data: dataEditOb
                            };

                            axios.request(config)
                                .then((response) => {

                                })
                                .catch((error) => {

                                });
                        }
                    }

                } catch (error) {
                    showSnackbar("error al guardar", "error")



                    setIsSubmitting(false)
                } finally {
                    setIsSubmitting(false);
                }




                var indicadores = formData.indicadores;


                if (datosIniciales !== null && datosIniciales.indicadores.length !== indicadores.length) {



                    const faltantes = datosIniciales.indicadores.filter(
                        a => !indicadores.some(b => b.idindicador === a.idindicador)
                    );

                    for (let ind = 0; ind < faltantes.length; ind++) {

                        const response = await fetch(`${API_BASE_URL}/indicadores/` + faltantes[ind].idindicador, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(dataSaveOb),
                        });


                    }



                }


                try {


                    for (let index = 0; index < indicadores.length; index++) {
                        const element = indicadores[index];

                        if (element.idindicador === null || element.idindicador === undefined) {



                            var dataSaveIn = {


                                "nombreind": element.nombreind,
                                "calculoind": null,
                                "periodicidadind": element.periodicidadind,
                                "tipoind": 1,
                                "idproyecto": idProyecto,
                                "idactividad": null,
                                "descripcioncal": element.descripcioncal
                            }




                            const response = await fetch(`${API_BASE_URL}/indicadores`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataSaveIn),
                            });



                        } else {



                            var dataEditIn = {
                                "idindicador": element.idindicador,
                                "nombreind": element.nombreind,
                                "calculoind": null,
                                "periodicidadind": element.periodicidadind,
                                "tipoind": 1,
                                "idproyecto": idProyecto,
                                "idactividad": null,
                                "descripcioncal": element.descripcioncal

                            }



                            const response = await fetch(`${API_BASE_URL}/indicadores/` + element.idindicador, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataEditIn),
                            });


                        }
                    }

                } catch (error) {
                    showSnackbar("error al guardar", "error")



                    setIsSubmitting(false)
                } finally {
                    setIsSubmitting(false);
                }


                navigate(paths.dashboard.gestion.gestionProyectosActivos);

            }

            else if (activeStep === 3) {





                var actividades = formData.actividades;






                if (datosIniciales !== null && datosIniciales.actividades.length > 0 && datosIniciales.actividades.length !== actividades.length) {



                    const faltantes = datosIniciales.actividades.filter(
                        a => !actividades.some(b => b.idactividad === a.idactividad)
                    );

                    for (let ind = 0; ind < faltantes.length; ind++) {

                        const response = await fetch(`${API_BASE_URL}/actividades/` + faltantes[ind].idactividad, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(dataSaveOb),
                        });


                    }

                }


                try {

                    for (let index = 0; index < actividades.length; index++) {
                        const element = actividades[index];



                        if (element.idactividad === null || element.idactividad === undefined) {



                            var dataSaveAct = {


                                "nombreact": element.nombreact,
                                "descripcionact": element.descripcionact,
                                "fechainiact": element.fechainiact + "T00:00:00",
                                "fechafinact": element.fechafinact + "T00:00:00",
                                "porcejecucionact": 0,
                                "porcproyectoact": element.porcproyectoact,
                                "tipoact": 0,
                                "consecutivoact": element.consecutivoact,
                                "idproyecto": idProyecto,
                                "responsableact": element.responsableact,
                                "consecutivo": element.consecutivoact
                            }



                            const response = await fetch(`${API_BASE_URL}/actividades`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataSaveAct),
                            });

                            var respuestaActividad = JSON.stringify(response)





                            try {

                                var indicadoresA = element.indicadores


                                for (let index2 = 0; index2 < indicadoresA.length; index2++) {
                                    const element2 = indicadoresA[index2];

                                    if (element2.idindicador === null || element2.idindicador === undefined) {



                                        var dataSaveInA = {


                                            "nombreind": element2.nombre,
                                            "calculoind": null,
                                            "periodicidadind": element2.periodicidad,
                                            "tipoind": 1,
                                            "idproyecto": null,
                                            "idactividad": respuestaActividad.idactividad,
                                            "descripcioncal": element2.descripcion
                                        }



                                        const responseIA = await fetch(`${API_BASE_URL}/indicadores`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(dataSaveInA),
                                        });



                                    } else {



                                        var dataEditInA = {
                                            "idindicador": element2.idindicador,
                                            "nombreind": element2.nombre,
                                            "calculoind": null,
                                            "periodicidadind": element2.periodicidad,
                                            "tipoind": 1,
                                            "idproyecto": null,
                                            "idactividad": response.idactividad,
                                            "descripcioncal": element2.descripcion

                                        }


                                        const responseIA = await fetch(`${API_BASE_URL}/indicadores/` + element2.idindicador, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(dataEditInA),
                                        });


                                    }
                                }






                                if (element.erogaciones && Array.isArray(element.erogaciones)) {





                                    for (let e of element.erogaciones) {


                                        const dataErogacion = {
                                            rubropl: e.rubro,
                                            tiporubpl: 2,
                                            valor: e.valor,
                                            agno: e.anio,
                                            idactividad: element.idactividad,
                                            idproyecto: idProyecto,
                                            observacionpl: e.observaciones
                                        };



                                        try {
                                            if (!e.iderogacion) {

                                                await fetch(`${API_BASE_URL}/erogacion-pl`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(dataErogacion)
                                                });
                                            } else {

                                                await fetch(`${API_BASE_URL}/erogacion-pl/${e.iderogacion}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ ...dataErogacion, iderogacionpl: e.iderogacion })
                                                });
                                            }
                                        } catch (error) {
                                            console.error('Error al guardar erogación', error);
                                            showSnackbar('Error al guardar erogaciones', 'error');
                                        }
                                    }
                                }






                                if (element.personal && Array.isArray(element.personal)) {





                                    for (let e of element.personal) {


                                        const dataPersonal = {
                                            "nombreparticpprs": e.nombreparticpprs,
                                            "cargoparticprs": e.cargoparticprs,
                                            "valorprs": e.valorprs,
                                            "idactividad": element.idactividad,
                                            "estado": e.estado
                                        };



                                        try {
                                            if (!e.idpersonal) {

                                                await fetch(`${API_BASE_URL}/personal`, {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify(dataPersonal)
                                                });
                                            } else {

                                                await fetch(`${API_BASE_URL}/personal/${e.idpersonal}`, {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ ...dataPersonal, idpersonal: e.idpersonal })
                                                });
                                            }
                                        } catch (error) {
                                            console.error('Error al guardar personal', error);
                                            showSnackbar('Error al guardar personal', 'error');
                                        }
                                    }
                                }





                            } catch (error) {
                                showSnackbar("error al guardar", "error")



                                setIsSubmitting(false)
                            } finally {
                                setIsSubmitting(false);
                            }



                        }
                        else {

                            var dataEditAct = {

                                "idactividad": element.idactividad,
                                "nombreact": element.nombreact,
                                "descripcionact": element.descripcionact,
                                "fechainiact": element.fechainiact,
                                "fechafinact": element.fechafinact,
                                "porcejecucionact": 0,
                                "porcproyectoact": element.porcproyectoact,
                                "tipoact": 0,
                                "consecutivoact": element.consecutivoact,
                                "idproyecto": idProyecto,
                                "responsableact": element.responsableact,
                                "consecutivo": element.consecutivoact
                            }

                            const response = await fetch(`${API_BASE_URL}/actividades/` + element.idactividad, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataEditAct),
                            });



                            try {

                                var indicadoresAEd = element.indicadores


                                for (let index2 = 0; index2 < indicadoresAEd.length; index2++) {
                                    const element2 = indicadoresAEd[index2];

                                    if (element2.idindicador === null || element2.idindicador === undefined) {



                                        var dataSaveInAEd = {


                                            "nombreind": element2.nombre,
                                            "calculoind": null,
                                            "periodicidadind": element2.periodicidad,
                                            "tipoind": 1,
                                            "idproyecto": null,
                                            "idactividad": element.idactividad,
                                            "descripcioncal": element2.descripcion
                                        }



                                        const responseIA = await fetch(`${API_BASE_URL}/indicadores`, {
                                            method: 'POST',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(dataSaveInAEd),
                                        });



                                    } else {



                                        var dataEditInAEd = {
                                            "idindicador": element2.idindicador,
                                            "nombreind": element2.nombre,
                                            "calculoind": null,
                                            "periodicidadind": element2.periodicidad,
                                            "tipoind": 1,
                                            "idproyecto": null,
                                            "idactividad": element.idactividad,
                                            "descripcioncal": element2.descripcion

                                        }


                                        const responseIA = await fetch(`${API_BASE_URL}/indicadores/` + element2.idindicador, {
                                            method: 'PUT',
                                            headers: {
                                                'Content-Type': 'application/json',
                                            },
                                            body: JSON.stringify(dataEditInAEd),
                                        });


                                    }
                                }

                            } catch (error) {
                                showSnackbar("error al guardar", "error")



                                setIsSubmitting(false)
                            } finally {
                                setIsSubmitting(false);
                            }

                        }

                    }

                } catch (error) {

                    showSnackbar("error al guardar", "error")



                    setIsSubmitting(false)
                } finally {
                    setIsSubmitting(false);
                }

                navigate(paths.dashboard.gestion.gestionProyectosActivos);

            }

            else if (activeStep === 4) {




                var archivos = formData.archivos;

                try {

                    for (let index = 0; index < archivos.length; index++) {
                        const element = archivos[index];



                        if (element.idarchivo === null || element.idarchivo === undefined) {



                            var dataSaveArch = {
                                "nombrearc": element.nombrearc,
                                "nombreorig": element.nombrearc,
                                "estado": 1,
                                "idproyecto": idProyecto,
                                "idactividad": 0,
                                "tipocargue": 1,
                                "observacion": element.observacion,
                                "seguimiento": 0
                            }



                            const response = await fetch(`${API_BASE_URL}/archivos`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataSaveArch),
                            });

                            var respuestaArchivos = JSON.stringify(response)

                            navigate(paths.dashboard.gestion.gestionProyectosActivos);

                        } else {
                            var dataEditArch = {
                                "idarchivo": element.idarchivo,
                                "nombrearc": element.nombrearc,
                                "nombreorig": element.nombrearc,
                                "estado": 1,
                                "idproyecto": idProyecto,
                                "idactividad": 0,
                                "tipocargue": 1,
                                "observacion": element.observacion,
                                "seguimiento": 0
                            }



                            const response = await fetch(`${API_BASE_URL}/archivos/` + element.idarchivo, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataEditArch),
                            });

                            var respuestaArchivosE = JSON.stringify(response)
                            navigate(paths.dashboard.gestion.gestionProyectosActivos);

                        }

                    }

                } catch (error) {
                    showSnackbar("error al guardar", "error")



                    setIsSubmitting(false)
                } finally {
                    setIsSubmitting(false);
                }
            }

            else if (activeStep === 1) {




                var ejesGuardar = formData.ejes;
                var factoresGuardar = formData.factores;

                var ejesInicial = datosIniciales.ejes



                var factoresInicial = datosIniciales.factores





                try {

                    for (let index = 0; index < ejesGuardar.length; index++) {
                        const element = ejesGuardar[index];







                        var buscarEje = ejesInicial.find(itemEje => itemEje.idejeprograma === element.idejeprograma)



                        if (buscarEje === null || buscarEje === undefined) {

                            var dataSaveEje = {


                                "idejeprograma": element.idejeprograma,
                                "idproyecto": element.idproyecto,
                                "ejeppal": element.ejeppal === true ? 0 : 1,
                            }



                            const response = await fetch(`${API_BASE_URL}/eje-programa-proyecto`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataSaveEje),
                            });





                        }

                        else {



                            var dataEditEje = {


                                "idejeprograma": element.idejeprograma,
                                "idproyecto": element.idproyecto,
                                "ejeppal": element.ejeppal === true ? 0 : 1
                            }



                            const response = await fetch(`${API_BASE_URL}/eje-programa-proyecto/` + element.idejeprograma, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataEditEje),
                            });

                        }

                    }

                } catch (error) {

                    showSnackbar("error al guardar", "error")



                    setIsSubmitting(false)
                } finally {
                    setIsSubmitting(false);
                }



                try {

                    for (let index = 0; index < factoresGuardar.length; index++) {
                        const element = factoresGuardar[index];





                        var buscarFactor = factoresInicial.find(itemFactor => itemFactor.idfactor === element.idfactor && itemFactor.idfin === element.idfin && itemFactor.eje === element.eje)

                        if (buscarFactor === null || buscarFactor === undefined) {

                            var dataSaveFactor = {
                                "idproyecto": element.idproyecto,
                                "idfactor": element.idfactor,
                                "idfin": element.idfin,
                                "nombrecaract": element.nombrecaract,
                                "idfactintegral": element.idfactintegral,
                                "eje": element.eje
                            }



                            const response = await fetch(`${API_BASE_URL}/fin-factor`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataSaveFactor),
                            });





                        }

                        else {



                            var dataEditFactor = {
                                "idproyecto": element.idproyecto,
                                "idfactor": element.idfactor,
                                "idfin": element.idfin,
                                "nombrecaract": element.nombrecaract,
                                "idfactintegral": element.idfactintegral,
                                "eje": element.eje
                            }



                            const response = await fetch(`${API_BASE_URL}/fin-factor/` + element.idfactor, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify(dataEditFactor),
                            });



                        }

                    }

                    navigate(paths.dashboard.gestion.gestionProyectosActivos);

                } catch (error) {

                    showSnackbar("error al guardar", "error")



                    setIsSubmitting(false)
                } finally {
                    setIsSubmitting(false);
                }


            }


            else {
                setIsSubmitting(false);
            }



        }







    };

    const obtenerPersonalConHoras = async (idactividad) => {
        try {

            const { data: personalList } = await axios.get(`${API_BASE_URL}/personal`);


            const personalFiltrado = personalList.filter(
                (persona) => persona.idactividad === idactividad
            );







            const personalConHoras = await Promise.all(
                personalFiltrado.map(async (persona) => {
                    try {
                        const { data: horasList } = await axios.get(
                            `${API_BASE_URL}/horas-personal/personal/${persona.idpersonal}`
                        );

                        const horas = horasList.map((h) => ({
                            agno: h.id.agno,
                            horas: h.horas,
                            CantPer: h.cantPer
                        }));

                        return {
                            ...persona,
                            tipo: persona.nombreparticpprs !== "Sin definir" ? "persona" : "cargo",
                            idpersona: persona.nombreparticpprs !== "Sin definir" ? persona.nombreparticpprs : "",
                            idcargo: persona.nombreparticpprs === "Sin definir" ? cargos.find(c => c.nom_car === persona.cargoparticprs).cod_car : "",
                            horas
                        };
                    } catch (err) {
                        console.error(`Error consultando horas para personal ${persona.idpersonal}:`, err);
                        return {
                            ...persona,
                            horas: []
                        };
                    }
                })
            );

            return personalConHoras;
        } catch (error) {
            console.error("Error consultando personal con horas:", error);
            throw error;
        }
    };

    const [nuevoPersonal, setNuevoPersonal] = useState({
        idpersonal: null,
        nombreparticpprs: "",
        cargoparticprs: "",
        valorprs: 0,
        idactividad: actividadEnEdicion?.idactividad || null,
        estado: 1,
        horas: {}
    });

    const handleTipoCambio = (e) => {
        const tipo = e.target.value;
        setModoRegistro(tipo);
        setNuevoPersonal({
            idpersonal: null,
            nombreparticpprs: "",
            cargoparticprs: "",
            valorprs: 0,
            idactividad: actividadEnEdicion?.idactividad || null,
            estado: 1,
            horas: {}
        });
    };

    const handleSeleccionCambio = (e) => {
        const id = e.target.value;
        const nombrepartic = modoRegistro === "persona"
            ? responsables.find(r => r.id === id)?.id
            : cargos.find(c => c.id === id)?.nombre.trim();

        setNuevoPersonal(prev => ({
            ...prev,
            nombreparticpprs: nombrepartic,
            cargoparticprs: modoRegistro === "cargo" ? nombrepartic : "",
        }));
    };

    const handleHorasChange = (anio, campo, valor) => {
        setNuevoPersonal(prev => ({
            ...prev,
            horas: {
                ...prev.horas,
                [anio]: {
                    ...prev.horas[anio],
                    [campo]: Number(valor)
                }
            }
        }));
    };

    const agregarPersonal = () => {
        const horasArray = Object.entries(nuevoPersonal.horas).map(([agno, data]) => ({
            agno: Number(agno),
            horas: data.horas || 0,
            CantPer: data.CantPer || 1
        }));

        const registro = {
            ...nuevoPersonal,
            horas: horasArray
        };

        setActividadEnEdicion((prev) => ({
            ...prev,
            personal: [...(prev.personal || []), registro]
        }));


        setNuevoPersonal({
            idpersonal: null,
            nombreparticpprs: "",
            cargoparticprs: "",
            valorprs: 0,
            idactividad: actividadEnEdicion?.idactividad || null,
            estado: 1,
            horas: {}
        });
    };

    const [modoRegistro, setModoRegistro] = useState("persona");

    const handleEditarIndicador = (index) => {
        const indicador = formData.indicadores[index];

        setIndicadorEditando({
            nombreind: indicador.nombreind,
            periodicidadind: indicador.periodicidadind,
            descripcioncal: indicador.descripcioncal,
        });

        setEditIndex(index);
    };

    const handleGuardarEdicionIndicador = async () => {
        const indicador = formData.indicadores[editIndex];

        try {
            const res = await fetch(`${API_BASE_URL}/indicadores/${indicador.idindicador}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...indicadorEditando,
                    idproyecto: formData.idproyecto,
                }),
            });

            if (!res.ok) throw new Error();

            setFormData((prev) => {
                const nuevos = [...prev.indicadores];
                nuevos[editIndex] = {
                    ...nuevos[editIndex],
                    ...indicadorEditando,
                };
                return { ...prev, indicadores: nuevos };
            });

            setEditIndex(null);
            showSnackbar('Indicador actualizado correctamente', 'success');
        } catch (error) {
            showSnackbar('Error al actualizar indicador', 'error');
        }
    };

    const handleCancelarEdicionIndicador = () => {
        setEditIndex(null);
        setIndicadorEditando({
            nombreind: '',
            periodicidadind: '',
            descripcioncal: '',
        });
    };

    const [erogacionEditando, setErogacionEditando] = useState(null);

    const handleGuardarErogacion = async () => {
        try {
            await fetch(
                `${API_BASE_URL}/erogacion-pl/${erogacionEditando.iderogacion}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        iderogacionpl: erogacionEditando.iderogacion,
                        rubropl: erogacionEditando.rubro,
                        tiporubpl: 2,
                        valor: erogacionEditando.valor,
                        agno: erogacionEditando.anio,
                        observacionpl: erogacionEditando.observaciones,
                        idactividad: actividadEnEdicion.idactividad,
                        idproyecto: formData.idproyecto
                    })
                }
            );

            setActividadEnEdicion(prev => ({
                ...prev,
                erogaciones: prev.erogaciones.map(e =>
                    e.iderogacion === erogacionEditando.iderogacion
                        ? erogacionEditando
                        : e
                )
            }));

            setErogacionEditando(null);
            showSnackbar("Erogación actualizada correctamente", "success");

        } catch (error) {
            console.error(error);
            showSnackbar("Error al actualizar la erogación", "error");
        }
    };

    const handleEliminarEje = async (item) => {

        if (item.ejeppal) {
            showSnackbar("No se puede eliminar el eje principal", "warning");
            return;
        }

        const confirmar = window.confirm(
            "¿Está seguro de eliminar este eje? Esta acción no se puede deshacer."
        );

        if (!confirmar) return;

        try {
            const res = await fetch(
                `${API_BASE_URL}/eje-programa-proyecto/${item.idproyecto}/${item.idejeprograma}`,
                { method: "DELETE" }
            );

            if (!res.ok) throw new Error("Error eliminando eje");

            setFormData(prev => ({
                ...prev,
                ejes: prev.ejes.filter(
                    e =>
                        Number(e.idejeprograma) !== Number(item.idejeprograma) ||
                        Number(e.idproyecto) !== Number(item.idproyecto)
                )
            }));

            showSnackbar("Eje eliminado correctamente", "success");

        } catch (error) {
            console.error(error);
            showSnackbar("Error al eliminar el eje", "error");
        }
    };

    const [openModalDedicacionSemanal, setOpenModalDedicacionSemanal] = useState(false);
    const [personalDedicacionSemanal, setPersonalDedicacionSemanal] = useState(null);

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

    return (
        <Box sx={{ padding: 10, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

            <CustomBreadcrumbs
                heading={modoEdicion ? `Editar proyecto No.  ${formData.idproyecto}` : 'Nuevo proyecto'}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Proyectos activos', href: paths.dashboard.gestion.gestionProyectosActivos },
                    { name: modoEdicion ? `Editar proyecto` : 'Nuevo proyecto' },
                ]}

                sx={{ mb: { xs: 3, md: 5 } }}
            />
            <Paper elevation={3} sx={{ p: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                    {steps.map((label, index) => (
                        <Step key={label}>
                            <StepLabel
                                onClick={async () => {
                                    if (!isNew || formData.idproyecto || index === 0) {
                                        try {
                                            if (formData.idproyecto) {
                                                await recargarDatosProyecto(formData.idproyecto);

                                            }

                                            setActiveStep(index);
                                        } catch (error) {
                                            console.error("Error al recargar el proyecto:", error);
                                            showSnackbar("No se pudo actualizar antes de cambiar de pestaña", "error");
                                        }
                                    }
                                }}
                                sx={{
                                    cursor:
                                        !isNew || formData.idproyecto || index === 0 ? "pointer" : "not-allowed",
                                    opacity:
                                        !isNew || formData.idproyecto || index === 0 ? 1 : 0.5,
                                    "& .MuiStepLabel-label": {
                                        fontWeight: activeStep === index ? "bold" : "normal",
                                    },
                                }}
                            >
                                {label}
                            </StepLabel>
                        </Step>
                    ))}
                </Stepper>

                {activeStep === steps.length ? (
                    <Typography variant="h5" align="center">
                        ¡Formulario enviado con éxito!
                    </Typography>
                ) : (
                    <Box>
                        {renderStepContent(activeStep)}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                            { }
                            {activeStep > 0 && (
                                <Button onClick={handleBack} sx={{ mr: 1 }}>
                                    Atrás
                                </Button>
                            )}

                            <Box>
                                { }
                                <Button
                                    variant="outlined"
                                    color="error"
                                    onClick={handleSubmit}
                                    sx={{ mr: 1 }}
                                >
                                    Guardar y salir
                                </Button>

                                { }
                                {activeStep < steps.length - 1 && (
                                    <Button variant="contained" onClick={handleNext}>
                                        Siguiente
                                    </Button>
                                )}

                                { }
                                {activeStep === steps.length - 1 && (
                                    <Button variant="contained" color="success" onClick={handleSubmitOdi}>
                                        Enviar a la ODI
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                )}
            </Paper>
            <Dialog
                open={modalAbierto}
                fullWidth
                maxWidth="lg"
                onClose={(event, reason) => {
                    if (reason === "backdropClick" || reason === "escapeKeyDown") {
                        return;
                    }
                    setModalAbierto(false);
                }}
            >
                <DialogTitle>Editar Actividad</DialogTitle>
                <DialogContent dividers>
                    { }
                    <Typography variant="h6" gutterBottom>
                        Datos Básicos Actividad
                    </Typography>

                    <Grid container spacing={2}>

                        <Grid item xs={12} md={4}>
                            <TextField
                                label="Consecutivo Actividad"
                                type="number"
                                fullWidth
                                value={actividadEnEdicion?.consecutivoact || ''}
                                onChange={(e) =>
                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        consecutivoact: e.target.value,
                                    }))
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Nombre Actividad"
                                fullWidth
                                value={actividadEnEdicion?.nombreact || ''}
                                onChange={(e) =>
                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        nombreact: e.target.value,
                                    }))
                                }
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                type="date"
                                label="Fecha Inicio"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                value={actividadEnEdicion?.fechainiact || ''}
                                onChange={(e) =>
                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        fechainiact: e.target.value,
                                    }))
                                }
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                type="date"
                                label="Fecha Fin"
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                                value={actividadEnEdicion?.fechafinact || ''}
                                onChange={(e) =>
                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        fechafinact: e.target.value,
                                    }))
                                }
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="% Proyecto"
                                type="number"
                                fullWidth
                                value={actividadEnEdicion?.porcproyectoact || ''}
                                onChange={(e) =>
                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        porcproyectoact: e.target.value,
                                    }))
                                }
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="% Avance"
                                type="number"
                                fullWidth
                                value={actividadEnEdicion?.porcejecucionact || ''}
                                onChange={(e) =>
                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        porcejecucionact: e.target.value,
                                    }))
                                }
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Autocomplete
                                options={responsables}
                                getOptionLabel={(option) =>
                                    option.nombres ? option.nombres : ''
                                }
                                value={
                                    responsables.find(
                                        (r) => r.cod_emp === actividadEnEdicion?.responsableact
                                    ) || null
                                }
                                onChange={(_, newValue) => {
                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        responsableact: newValue ? newValue.cod_emp : '',
                                    }));
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Responsable actividad"
                                        error={!!errors.responsableact}
                                        helperText={errors.responsableact}
                                        fullWidth
                                    />
                                )}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Descripción"
                                fullWidth
                                multiline
                                rows={3}
                                value={actividadEnEdicion?.descripcionact || ''}
                                onChange={(e) =>
                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        descripcionact: e.target.value,
                                    }))
                                }
                            />
                        </Grid>

                        { }
                        <Grid item xs={12} textAlign="right">
                            <Button
                                variant="contained"
                                color="success"
                                onClick={async () => {
                                    try {
                                        if (!actividadEnEdicion?.idactividad) {
                                            showSnackbar(
                                                "Debe seleccionar o crear una actividad antes de actualizar",
                                                "warning"
                                            );
                                            return;
                                        }

                                        const response = await fetch(`${API_BASE_URL}/actividades/${actividadEnEdicion.idactividad}`, {
                                            method: "PUT",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(actividadEnEdicion),
                                        });


                                        if (!response.ok) {
                                            throw new Error('Error al actualizar la actividad');
                                        }


                                        const data = await response.json();


                                        recargarDatosProyecto(data.idproyecto);

                                        showSnackbar("Actividad actualizada correctamente", "success");
                                    } catch (error) {
                                        console.error("Error al actualizar:", error);
                                        showSnackbar(
                                            "Error al actualizar la actividad en el servidor",
                                            "error"
                                        );
                                    }
                                }}
                            >
                                Actualizar Actividad
                            </Button>
                        </Grid>
                    </Grid>

                    { }

                    <Box mt={4}>
                        <Typography variant="h6">Presupuesto Erogación</Typography>

                        { }
                        <Grid container spacing={2} mt={1}>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth>
                                    <InputLabel id="rubro-label">Rubro</InputLabel>
                                    <Select
                                        labelId="rubro-label"
                                        label="Rubro"
                                        value={rubroSeleccionado}
                                        onChange={(e) => setRubroSeleccionado(e.target.value)}
                                    >
                                        {rubros.map((r) => (
                                            <MenuItem key={r.id} value={r.id}>
                                                {r.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>

                        { }
                        <Grid container spacing={2} mt={2}>
                            <Grid item xs={12} md={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Año</InputLabel>
                                    <Select
                                        label="Año"
                                        value={detalleErogacion.anio}
                                        onChange={(e) =>
                                            setDetalleErogacion((p) => ({
                                                ...p,
                                                anio: e.target.value,
                                            }))
                                        }
                                    >
                                        {anios.map((anio) => (
                                            <MenuItem key={anio} value={anio}>
                                                {anio}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    label="Valor"
                                    type="number"
                                    fullWidth
                                    value={detalleErogacion.valor}
                                    onChange={(e) =>
                                        setDetalleErogacion((p) => ({
                                            ...p,
                                            valor: e.target.value,
                                        }))
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={5}>
                                <TextField
                                    label="Observaciones"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    value={detalleErogacion.observaciones}
                                    onChange={(e) =>
                                        setDetalleErogacion((p) => ({
                                            ...p,
                                            observaciones: e.target.value,
                                        }))
                                    }
                                />
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    sx={{ height: '100%' }}
                                    onClick={() => {
                                        if (!detalleErogacion.anio || !detalleErogacion.valor) {
                                            showSnackbar("Complete año y valor", "error");
                                            return;
                                        }

                                        const existe = erogacionesTmp.some(
                                            (e) =>
                                                e.rubroId === rubroSeleccionado &&
                                                String(e.anio) === String(detalleErogacion.anio)
                                        );

                                        if (existe) {
                                            showSnackbar(
                                                "Ya existe una erogación para ese rubro y año",
                                                "warning"
                                            );
                                            return;
                                        }

                                        const existeEnBD = actividadEnEdicion?.erogaciones?.some(
                                            (e) =>
                                                e.rubro === rubroSeleccionado &&
                                                String(e.anio) === String(detalleErogacion.anio)
                                        );

                                        if (existeEnBD) {
                                            showSnackbar(
                                                "Ya existe una erogación guardada para ese rubro y año",
                                                "warning"
                                            );
                                            return;
                                        }

                                        const rubroObj = rubros.find(
                                            (r) => r.id === parseInt(rubroSeleccionado)
                                        );

                                        setErogacionesTmp((prev) => [
                                            ...prev,
                                            {
                                                ...detalleErogacion,
                                                rubroId: rubroSeleccionado,
                                                rubroNombre: rubroObj?.name || "",
                                            },
                                        ]);

                                        setDetalleErogacion({
                                            anio: '',
                                            valor: '',
                                            observaciones: '',
                                        });
                                    }}
                                >
                                    Agregar
                                </Button>
                            </Grid>
                        </Grid>

                        { }
                        {erogacionesTmp.length > 0 && (
                            <Table size="small" sx={{ mt: 3 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Rubro</TableCell>
                                        <TableCell>Año</TableCell>
                                        <TableCell>Valor</TableCell>
                                        <TableCell>Observaciones</TableCell>
                                        <TableCell />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {erogacionesTmp.map((e, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{e.rubroNombre}</TableCell>
                                            <TableCell>{e.anio}</TableCell>
                                            <TableCell>{formatoPesos.format(e.valor)}</TableCell>
                                            <TableCell>{e.observaciones}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    color="error"
                                                    onClick={() =>
                                                        setErogacionesTmp((prev) =>
                                                            prev.filter((_, i) => i !== index)
                                                        )
                                                    }
                                                >
                                                    ✕
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}

                        { }
                        <Button
                            variant="contained"
                            sx={{ mt: 3 }}
                            onClick={async () => {
                                if (!rubroSeleccionado || erogacionesTmp.length === 0) {
                                    showSnackbar(
                                        "Seleccione un rubro y agregue al menos un valor",
                                        "error"
                                    );
                                    return;
                                }

                                try {
                                    const nuevasErogaciones = [];

                                    for (const e of erogacionesTmp) {
                                        const payload = {
                                            rubropl: e.rubroId,
                                            tiporubpl: 2,
                                            valor: e.valor,
                                            agno: e.anio,
                                            observacionpl: e.observaciones || "",
                                            idactividad: actividadEnEdicion?.idactividad,
                                            idproyecto: formData.idproyecto,
                                        };

                                        const res = await fetch(`${API_BASE_URL}/erogacion-pl`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(payload),
                                        });

                                        if (!res.ok) {
                                            throw new Error("Error creando erogación");
                                        }

                                        const creada = await res.json();

                                        nuevasErogaciones.push({
                                            iderogacion: creada.iderogacionpl,
                                            rubro: e.rubroId,
                                            rubroNombre: e.rubroNombre,
                                            anio: e.anio,
                                            valor: e.valor,
                                            observaciones: e.observaciones,
                                        });
                                    }


                                    setActividadEnEdicion((prev) => ({
                                        ...prev,
                                        erogaciones: [
                                            ...(prev.erogaciones || []),
                                            ...nuevasErogaciones,
                                        ],
                                    }));

                                    showSnackbar("Erogaciones creadas correctamente", "success");
                                    setErogacionesTmp([]);
                                    setRubroSeleccionado("");

                                } catch (error) {
                                    console.error(error);
                                    showSnackbar("Error al guardar erogaciones", "error");
                                }
                            }}
                        >
                            Guardar todas las erogaciones
                        </Button>


                        { }
                        {actividadEnEdicion?.erogaciones?.length > 0 && (
                            <Box mt={2}>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Rubro</TableCell>
                                            <TableCell>Año</TableCell>
                                            <TableCell>Valor</TableCell>
                                            <TableCell>Observaciones</TableCell>
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {actividadEnEdicion.erogaciones.map((e, idx) => {
                                            const editando = erogacionEditando?.iderogacion === e.iderogacion;
                                            return (
                                                <TableRow key={e.iderogacion || idx}>
                                                    { }
                                                    <TableCell>
                                                        {editando ? (
                                                            <Select
                                                                size="small"
                                                                value={erogacionEditando.rubro}
                                                                onChange={(ev) => setErogacionEditando(prev => ({ ...prev, rubro: ev.target.value }))}
                                                                fullWidth
                                                            >
                                                                {rubros.map(r => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
                                                            </Select>
                                                        ) : (
                                                            rubros.find(r => r.id === parseInt(e.rubro))?.name || e.rubroNombre || ""
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editando ? (
                                                            <TextField
                                                                size="small" type="number"
                                                                value={erogacionEditando.anio}
                                                                onChange={(ev) => setErogacionEditando(prev => ({ ...prev, anio: ev.target.value }))}
                                                            />
                                                        ) : e.anio}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editando ? (
                                                            <TextField
                                                                size="small" type="number"
                                                                value={erogacionEditando.valor}
                                                                onChange={(ev) => setErogacionEditando(prev => ({ ...prev, valor: ev.target.value }))}
                                                                sx={{ width: 120 }}
                                                            />
                                                        ) : formatoPesos.format(e.valor)}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editando ? (
                                                            <TextField
                                                                size="small"
                                                                value={erogacionEditando.observaciones}
                                                                onChange={(ev) => setErogacionEditando(prev => ({ ...prev, observaciones: ev.target.value }))}
                                                                fullWidth
                                                            />
                                                        ) : e.observaciones}
                                                    </TableCell>
                                                    <TableCell>
                                                        {editando ? (
                                                            <>
                                                                <IconButton color="success" onClick={() => handleGuardarErogacion()}><TickCircle size="20" /></IconButton>
                                                                <IconButton color="error" onClick={() => setErogacionEditando(null)}><CloseCircle size="20" /></IconButton>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <IconButton onClick={() => setErogacionEditando({ ...e })}><Edit size="20" /></IconButton>
                                                                <IconButton color="error" onClick={() => handleEliminarErogacion(idx)}><Trash size="20" /></IconButton>
                                                            </>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>

                                    { }
                                    <TableHead sx={{ backgroundColor: (theme) => theme.palette.action.hover }}>
                                        <TableRow>
                                            <TableCell colSpan={2} sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                                                TOTAL EROGACIONES:
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                {formatoPesos.format(
                                                    actividadEnEdicion.erogaciones.reduce((sum, current) => sum + (Number(current.valor) || 0), 0)
                                                )}
                                            </TableCell>
                                            <TableCell colSpan={2} />
                                        </TableRow>
                                    </TableHead>
                                </Table>
                            </Box>
                        )}
                    </Box>



                    <Box mt={4}>
                        <Typography variant="h6" gutterBottom>Dedicación de Personal</Typography>

                        { }
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <RadioGroup
                                row
                                value={tipoPersonal}
                                onChange={(e) => setTipoPersonal(e.target.value)}
                            >
                                <FormControlLabel value="persona" control={<Radio />} label="Por Persona" />
                                <FormControlLabel value="cargo" control={<Radio />} label="Por Cargo" />
                            </RadioGroup>
                        </FormControl>

                        { }
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={6}>
                                {tipoPersonal === 'persona' ? (
                                    <Autocomplete
                                        options={responsables}
                                        getOptionLabel={(option) => option.nombres || ''}
                                        value={responsables.find(r => r.cod_emp === dedicacionSeleccionada) || null}
                                        onChange={(_, newValue) => {
                                            setDedicacionSeleccionada(newValue ? newValue.cod_emp : '');
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Seleccionar Persona" placeholder="Buscar..." fullWidth />
                                        )}
                                    />
                                ) : (
                                    <Autocomplete
                                        options={cargos}
                                        getOptionLabel={(option) =>
                                            option.nom_car ? `${option.cod_car} - ${option.nom_car}` : ''
                                        }
                                        value={cargos.find(c => c.cod_car === dedicacionSeleccionada) || null}
                                        onChange={(_, newValue) => {
                                            setDedicacionSeleccionada(newValue ? newValue.cod_car : '');
                                        }}
                                        renderInput={(params) => (
                                            <TextField {...params} label="Seleccione un Cargo" fullWidth />
                                        )}
                                    />
                                )}
                            </Grid>

                            { }
                            <Grid item xs={12} md={6}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Add />}
                                    onClick={() => {
                                        if (!dedicacionSeleccionada) {
                                            showSnackbar("Seleccione una persona o cargo antes de continuar", "warning");
                                            return;
                                        }




                                        setDedicacionActual({
                                            tipo: tipoPersonal,
                                            idactividad: actividadEnEdicion?.idactividad,
                                            idpersona: tipoPersonal === "persona" ? dedicacionSeleccionada : null,
                                            idpersonal: null,
                                            idcargo: tipoPersonal === "cargo" ? dedicacionSeleccionada : null,
                                        });
                                        setOpenModalDedicacion(true);
                                    }}
                                >
                                    Agregar Dedicación
                                </Button>
                            </Grid>
                        </Grid>

                        { }
                        {actividadEnEdicion?.personal?.length > 0 && (
                            <Box mt={4}>
                                <Typography variant="h6" gutterBottom>Personal asignado</Typography>
                                <Table stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nombre / Cargo</TableCell>
                                            {anios.map((anio) => (
                                                <TableCell key={anio} align="center">{anio}</TableCell>
                                            ))}
                                            <TableCell>Acciones</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {actividadEnEdicion.personal.map((p, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    {p.tipo === "persona"
                                                        ? getNombrePersona(p.nombreparticpprs)
                                                        : p.cargoparticprs}
                                                </TableCell>

                                                {anios.map((anio) => {
                                                    const registro = p.horas.find((h) => h.agno === anio) || {};
                                                    return (
                                                        <TableCell key={anio} align="center">
                                                            {registro.horas || 0}
                                                        </TableCell>
                                                    );
                                                })}

                                                <TableCell align="center">
                                                    <Tooltip title="Editar dedicación">
                                                        <IconButton color="primary" onClick={() => {


                                                            setDedicacionActual(p);
                                                            setOpenModalDedicacion(true);
                                                        }}>
                                                            <Edit size="22" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Ver dedicación semanal">
                                                        <IconButton
                                                            color="info"
                                                            onClick={() => {
                                                                setPersonalDedicacionSemanal(p);
                                                                setOpenModalDedicacionSemanal(true);
                                                            }}
                                                        >
                                                            <Eye size="22" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Eliminar">
                                                        <IconButton color="error" onClick={() => handleEliminarPersonal(idx)}>
                                                            <Trash size="22" />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>
                        )}

                        { }
                        <ModalDedicacionSemanal

                            open={openModalDedicacion}
                            onClose={() => setOpenModalDedicacion(false)}
                            idActividad={actividadEnEdicion?.idactividad}
                            idPersona={dedicacionActual?.idpersona}
                            idPersonal={dedicacionActual?.idpersonal}
                            idCargo={dedicacionActual?.idcargo}
                            tipo={dedicacionActual?.tipo}
                            fechaInicio={actividadEnEdicion?.fechainiact}
                            fechaFin={actividadEnEdicion?.fechafinact}
                            onConfirm={(dedicacionesCalculadas) => {
                                const nuevoRegistroPersonal = {
                                    ...dedicacionActual,
                                    horas: dedicacionesCalculadas.map(d => ({
                                        agno: d.agno,
                                        horas: d.horasTotales,
                                        CantPer: dedicacionActual.tipo === "cargo" ? d.CantPer : 1,
                                    })),
                                    dedicaciones: dedicacionesCalculadas,
                                };
                                handleAgregarPersonalFinal(nuevoRegistroPersonal);
                                setOpenModalDedicacion(false);
                            }}
                        />
                    </Box>
                    <Box display="flex" justifyContent="flex-end">
                        <Button variant="contained"
                            onClick={() => {

                                recargarDatosProyecto(idProyecto)
                                showSnackbar("Se guardaron correctamente las dedicaciones de personal", "success");
                            }
                            }>Guardar todas las dedicaciones</Button>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => {

                            const tienePersonal = actividadEnEdicion?.personal && actividadEnEdicion.personal.length > 0;

                            if (!tienePersonal) {

                                showSnackbar("Debe asignar al menos una persona o cargo a la actividad antes de finalizar.", "warning");
                                return;
                            }


                            setModalAbierto(false);
                            recargarDatosProyecto(actividadEnEdicion.idproyecto);
                            showSnackbar("Actividad finalizada correctamente", "success");
                        }}
                    >
                        Crear Actividad
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={openModalDedicacionSemanal}
                onClose={() => setOpenModalDedicacionSemanal(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    Dedicación semanal
                </DialogTitle>

                <DialogContent dividers>
                    {personalDedicacionSemanal && (
                        <>
                            <Typography variant="subtitle2" gutterBottom>
                                {personalDedicacionSemanal.tipo === "persona"
                                    ? getNombrePersona(personalDedicacionSemanal.nombreparticpprs)
                                    : personalDedicacionSemanal.cargoparticprs}
                            </Typography>

                            <TablaDedicacionSemanal
                                idActividad={actividadEnEdicion.idactividad}
                                idPersonal={personalDedicacionSemanal.idpersonal}
                                fechaInicio={actividadEnEdicion.fechainiact}
                                fechaFin={actividadEnEdicion.fechafinact}
                                tipo={personalDedicacionSemanal.tipo}
                            />
                        </>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setOpenModalDedicacionSemanal(false)}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>


            <Modal
                open={modalResumenOpen && proyecto}
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
                        <strong>ID Proyecto:</strong> {formData.idproyecto} <br />
                        <strong>Nombre del Proyecto:</strong> {formData.nombrepr}
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
                                            const actividad = formData.actividades.find(
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
                open={modalPresupuestoPlaneadoOpen && proyecto}
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
                open={modalResumen && proyecto}
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
                                        {proyecto?.objetivos?.length > 0 && (
                                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                                {formData.objetivos
                                                    .filter(item => item.tipoob !== 3)
                                                    .map((o, i) => (
                                                        <li key={i}>{o.descripcionob}</li>
                                                    ))}
                                            </ul>
                                        )}
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
                                        {proyecto?.objetivos?.length > 0 && (
                                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                                {formData.objetivos
                                                    .filter(item => item.tipoob === 3)
                                                    .map((o, i) => (
                                                        <li key={i}>{o.descripcionob}</li>
                                                    ))}
                                            </ul>
                                        )}
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
                                        {proyecto?.indicadores?.length > 0 && (
                                            <ul style={{ margin: 0, paddingLeft: 18 }}>
                                                {formData.indicadores.map((o, i) => (
                                                    <li key={i}>
                                                        <strong>Indicador:</strong> {o.nombreind}{" "}
                                                        <strong>Periodicidad:</strong> {o.periodicidadind}{" "}
                                                        <strong>Descripción:</strong> {o.descripcioncal}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
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
                                    {formData.actividades && formData.actividades.length > 0 ? (
                                        formData.actividades.map((act, i) => {

                                            const ded = dedicaciones?.[act.idactividad] || [];
                                            const ero = erogaciones?.[act.idactividad] || [];
                                            const ind = indicadoresAct?.[act.idactividad] || [];

                                            return (
                                                <React.Fragment key={i}>
                                                    { }
                                                    <TableRow>
                                                        <TableCell>{act.nombreact}</TableCell>
                                                        <TableCell>{act.fechainiact}</TableCell>
                                                        <TableCell>{act.fechafinact}</TableCell>
                                                        <TableCell>{act.descripcionact}</TableCell>
                                                        <TableCell>
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


            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MuiAlert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    elevation={6}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </MuiAlert>
            </Snackbar>
        </Box>

    );
}
