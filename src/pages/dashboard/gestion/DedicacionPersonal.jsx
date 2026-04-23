import { API_BASE_URL } from 'src/config/api';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    TextField,
    Button,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Grid,
    Autocomplete,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import ModalDedicacionSemanal from "./ModalDedicacionSemanal";


import responsablesLocal from 'src/assets/data/responsables.json';
import { Add } from 'iconsax-react';

const DedicacionPersonal = ({ idSeguimiento, idActividad, seguimientoTerminado = 0, onUpdated }) => {
    const yearNow = new Date().getFullYear();

    const [personalPlaneado, setPersonalPlaneado] = useState([]);
    const [personalList, setPersonalList] = useState([]);
    const [horasActuales, setHorasActuales] = useState({});
    const [horasSeguimiento, setHorasSeguimiento] = useState([]);
    const [selectedToRemove, setSelectedToRemove] = useState('');
    const [openModalDedicacion, setOpenModalDedicacion] = useState(false);
    const [dedicacionActual, setDedicacionActual] = useState(null);
    const obtenerPersonalConHoras = async (idactividad) => {
        try {

            const response = await axios.get(`${API_BASE_URL}/personal/actividad/${idactividad}`);
            const personalList2 = response.data || [];


            const personalFiltrado = personalList2.filter(p => p.estado === 1);


            const personalConHoras = await Promise.all(
                personalFiltrado.map(async (persona) => {
                    try {
                        const resHoras = await axios.get(`${API_BASE_URL}/horas-personal/personal/${persona.idpersonal}`);
                        const horasData = Array.isArray(resHoras.data) ? resHoras.data : [];


                        const horas = horasData.map(h => ({
                            agno: h.id?.agno || null,
                            horas: h.horas || 0,
                            CantPer: h.cantPer || 1,
                        }));

                        return { ...persona, horas };
                    } catch (err) {
                        console.warn(`No se pudieron obtener horas para el personal ${persona.idpersonal}:`, err);
                        return { ...persona, horas: [] };
                    }
                })
            );

            return personalConHoras;
        } catch (error) {
            console.error('Error consultando personal y horas:', error);
            throw error;
        }
    };


    useEffect(() => {
        const fetchPersonal = async () => {
            if (!idActividad) return;
            try {
                const personal = await obtenerPersonalConHoras(idActividad);
                
                setPersonalPlaneado(personal);
                setPersonalList(personal);
                fetchHorasSeguimiento(personal)
            } catch (error) {
                console.error('Error cargando personal planeado:', error);
            }
        };

        fetchPersonal();
    }, [idActividad]);

    const getNombreResponsable = (cedula) => {
        if (!cedula || !Array.isArray(responsables)) return "Sin nombre";

        const responsable = responsables.find(
            (r) => r.cod_emp?.trim() === String(cedula).trim()
        );

        if (!responsable) return "Sin nombre";


        const nombreCompleto =
            responsable.nombres?.trim() ||
            `${responsable.ap1Emp?.trim() || ""} ${responsable.ap2Emp?.trim() || ""} ${responsable.nomEmp?.trim() || ""}`.trim();

        return nombreCompleto || "Sin nombre";
    };


    const fetchHorasSeguimiento = async (personalA) => {
        try {

            const res = await axios.get(`${API_BASE_URL}/segpersonal/seguimiento/${idSeguimiento}`);
            const data = res.data;
            setHorasSeguimiento(data);


            const horasMap = new Map(
                data.map(item => [`${item.idpersonal}-${item.agno}`, item])
            );


            const nuevasHoras = {};
            const actualizado = personalA.map(persona => {
                const key = `${persona.idpersonal}-${yearNow}`;

                const existente = horasMap.get(key);


                if (existente) {

                    nuevasHoras[persona.idpersonal] = existente.horaseg;

                    const sinActual = persona.horas.filter(h => h.agno !== yearNow);
                    return {
                        ...persona,
                        horas: [
                            ...sinActual,
                            {
                                agno: yearNow,
                                horaseg: existente.horaseg,
                                idsegpersonal: existente.idsegpersonal
                            }
                        ]
                    };
                } else {

                    const sinActual = persona.horas.filter(h => h.agno !== yearNow);
                    return {
                        ...persona,
                        horas: [
                            ...sinActual,
                            {
                                agno: yearNow,
                                horaseg: "",
                                idsegpersonal: null
                            }
                        ]
                    };
                }
            });

            setHorasActuales(nuevasHoras);
            setPersonalList(actualizado);
        } catch (err) {
            console.error('Error al cargar horas de seguimiento:', err);
        }
    };

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


    const handleHoraChange = (id, value) => {
        setHorasActuales(prev => ({ ...prev, [id]: value }));
    };

    const handleGuardar = async () => {
        try {
            for (let p of personalList) {
                const horasActual = parseInt(horasActuales[p.idpersonal], 10);
                if (!horasActual && horasActual !== 0) continue;

                const existente = p.horas?.find(h => h.agno === yearNow);

                const payload = {
                    idsegpersonal: existente ? existente.idsegpersonal : null,
                    idseguimiento: idSeguimiento,
                    idpersonal: p.idpersonal,
                    idactividad: idActividad,
                    horaseg: horasActual,
                    agno: yearNow,
                    tipo: 1
                };

                if (existente && existente.idsegpersonal) {
                    await axios.put(
                        `${API_BASE_URL}/segpersonal/${existente.idsegpersonal}`,
                        payload
                    );
                } else {
                    await axios.post(
                        `${API_BASE_URL}/segpersonal`,
                        payload
                    );
                }
            }

            alert('Horas actualizadas correctamente');
            if (onUpdated) onUpdated();
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar horas');
        }
    };

    const handleEliminar = async () => {
        const idToRemove = parseInt(selectedToRemove);
        const persona = personalList.find(p => p.idpersonal === idToRemove);

        if (!persona) return;

        const seguimientoActual = persona.horas?.find(h => h.agno === yearNow);

        try {

            if (seguimientoActual?.idsegpersonal) {
                await axios.delete(
                    `${API_BASE_URL}/segpersonal/${seguimientoActual.idsegpersonal}`
                );
            }


            const { data: personalAPI } = await axios.get(`${API_BASE_URL}/personal/${idToRemove}`);

            if (personalAPI) {

                const payloadPersonal = { ...personalAPI, estado: 0 };
                await axios.put(
                    `${API_BASE_URL}/personal/${idToRemove}`,
                    payloadPersonal
                );
            }


            setPersonalList(prev => prev.filter(p => p.idpersonal !== idToRemove));
            setHorasActuales(prev => {
                const updated = { ...prev };
                delete updated[idToRemove];
                return updated;
            });
            setSelectedToRemove('');
            alert('Personal eliminado y actualizado correctamente');
            if (onUpdated) onUpdated();
        } catch (error) {
            console.error('Error al eliminar personal:', error);
            alert('Error al eliminar el personal del seguimiento');
        }
    };

    const getHorasAcumuladas = (idpersonal) =>
        horasSeguimiento
            .filter(h =>
                h.idpersonal === idpersonal &&
                h.agno < yearNow &&
                h.idactividad === idActividad
            )
            .reduce((sum, h) => sum + (h.horaseg || 0), 0);

    const getHorasPlaneadasActual = (idpersonal) => {
        const persona = personalPlaneado.find(p => p.idpersonal === idpersonal);
        const h = persona?.horas.find(h1 => h1.agno === yearNow);
        return h ? h.horas : 0;
    };

    const [tipoPersonal, setTipoPersonal] = useState('persona');
    const [dedicacionSeleccionada, setDedicacionSeleccionada] = useState('');
    const [anios, setAnios] = useState([yearNow]);
    const [horasPorAnio, setHorasPorAnio] = useState({});
    const [cantidadPorAnio, setCantidadPorAnio] = useState({});
    const [cargos, setCargos] = useState([]);


    useEffect(() => {
        const fetchCargos = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/cargos`);
                setCargos(res.data || []);
            } catch (error) {
                console.warn("Error al cargar cargos:", error);
            }
        };
        fetchCargos();
    }, []);

    const handleAgregarPersonal = async () => {
        if (!dedicacionSeleccionada) {

            return;
        }

        const totalHoras = anios.reduce((acc, anio) => acc + Number(horasPorAnio[anio] || 0), 0);
        let totalCantidad = anios.reduce((acc, anio) => acc + Number(cantidadPorAnio[anio] || 0), 0);

        if (tipoPersonal === 'persona') totalCantidad = 1;
        if (tipoPersonal === 'cargo' && totalCantidad <= 0) {

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
            idactividad: idActividad,
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


            const actualizado = await obtenerPersonalConHoras(idActividad);
            setPersonalPlaneado(actualizado);
            setPersonalList(actualizado);

            if (onUpdated) onUpdated();


            setDedicacionSeleccionada('');
            setHorasPorAnio({});
            setCantidadPorAnio({});
        } catch (error) {
            console.error("Error guardando dedicación:", error);
        }
    };

    const handleAgregarPersonalFinal = async (nuevoPersonal) => {
        try {
            if (!idActividad) {
                alert("Debe guardar la actividad antes de agregar dedicaciones");
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
                        ? cargos.find((c) => c.cod_car.trim() === persona.codCar.trim())?.nom_car ||
                        ""
                        : "";
                }
            } else if (nuevoPersonal.tipo === "cargo") {
                const cargoSeleccionado = cargos.find(
                    (c) => c.cod_car === nuevoPersonal.idcargo
                );
                if (cargoSeleccionado) {
                    valorprs =
                        Number(cargoSeleccionado.usrValHora || 0) *
                        totalCantidad *
                        totalHoras;
                    nombreparticpprs = "Sin definir";
                    cargoparticprs = cargoSeleccionado.nom_car;
                }
            }


            const dataPersonal = {
                idactividad: idActividad,
                nombreparticpprs,
                cargoparticprs,
                valorprs,
                tipo: nuevoPersonal.tipo,
                estado: 1,
            };

            const resPersonal = await fetch(`${API_BASE_URL}/personal`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dataPersonal),
            });

            if (!resPersonal.ok) throw new Error("Error creando registro en /personal");
            const creadoPersonal = await resPersonal.json();
            const idPersonalCreado = creadoPersonal.idpersonal;


            for (const h of nuevoPersonal.horas || []) {
                const horasPayload = {
                    id: { idPersonal: idPersonalCreado, agno: h.agno },
                    horas: h.horas,
                    cantPer: h.CantPer || 1,
                };

                const resHoras = await fetch(`${API_BASE_URL}/horas-personal`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(horasPayload),
                });

                if (!resHoras.ok)
                    throw new Error(`Error creando registro de horas para ${h.agno}`);
            }


            if (nuevoPersonal.dedicaciones && nuevoPersonal.dedicaciones.length > 0) {
                for (const d of nuevoPersonal.dedicaciones) {
                    const dedicacionPayload = {
                        idactividad: idActividad,
                        idpersonal: idPersonalCreado,
                        idpersona: nuevoPersonal.idpersona || null,
                        idcargo: nuevoPersonal.idcargo || null,
                        agno: d.agno,
                        horasPorSemana: Number(d.horasPorSemana),
                        semanasCalculadas: d.semanasCalculadas,
                        horasTotales: d.horasTotales,
                        tipo: nuevoPersonal.tipo,
                        createdBy: "frontend",
                    };

                    const resDedicacion = await fetch(`${API_BASE_URL}/dedicacion-semanal`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(dedicacionPayload),
                    });

                    if (!resDedicacion.ok)
                        throw new Error(
                            `Error guardando dedicación semanal para ${d.agno}`
                        );
                }
            }


            const actualizado = await obtenerPersonalConHoras(idActividad);
            setPersonalPlaneado(actualizado);
            setPersonalList(actualizado);

            alert("Dedicación registrada correctamente");


            setDedicacionSeleccionada("");
            setHorasPorAnio({});
            setCantidadPorAnio({});
            setDedicacionActual(null);
            setOpenModalDedicacion(false);
        } catch (error) {
            console.error("Error al guardar dedicación:", error);
            alert("Error al guardar la dedicación");
        }
    };



    return (
        <Box component={Paper} p={2} mt={2}>
            <Typography variant="h6">Dedicación de Personal</Typography>
            <Typography variant="body2" color="textSecondary">
                *Por favor ingrese <strong>únicamente las horas del seguimiento actual</strong>. El sistema muestra las horas planeadas y acumuladas.
            </Typography>

            <Table sx={{ mt: 2 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Nombre</TableCell>
                        <TableCell>Cargo</TableCell>
                        <TableCell>Año</TableCell>
                        <TableCell>Horas Planeadas</TableCell>
                        <TableCell>Horas Acumuladas</TableCell>
                        <TableCell>Horas Seguimiento Actual</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {personalList.map(p => {
                        const acumuladas = getHorasAcumuladas(p.idpersonal);
                        const planeadas = getHorasPlaneadasActual(p.idpersonal);
                        return (
                            <TableRow key={p.idpersonal}>
                                <TableCell>{getNombreResponsable(p.nombreparticpprs)}</TableCell>
                                <TableCell>{p.cargoparticprs.trim()}</TableCell>
                                <TableCell>{yearNow}</TableCell>
                                <TableCell>{planeadas}</TableCell>
                                <TableCell>{acumuladas}</TableCell>
                                <TableCell>
                                    <TextField
                                        size="small"
                                        type="number"
                                        value={horasActuales[p.idpersonal] || ''}
                                        onChange={e => handleHoraChange(p.idpersonal, e.target.value)}
                                        disabled={seguimientoTerminado === 1}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>

            <Button
                onClick={handleGuardar}
                variant="contained"
                sx={{ mt: 2 }}
                disabled={seguimientoTerminado === 1}
            >
                Guardar Horas Participantes
            </Button>

            <Box mt={4} p={2} bgcolor="#f5f5f5">
                <Typography variant="subtitle1">Eliminar Personal en Seguimiento</Typography>
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <InputLabel>Seleccione personal</InputLabel>
                    <Select
                        value={selectedToRemove}
                        label="Seleccione personal"
                        onChange={e => setSelectedToRemove(e.target.value)}
                        disabled={seguimientoTerminado === 1}
                    >
                        {personalList.map(p => {
                            const nombreResponsable = getNombreResponsable(p.nombreparticpprs);
                            return (
                                <MenuItem key={p.idpersonal} value={p.idpersonal}>
                                    {`${nombreResponsable} (${p.cargoparticprs})`}
                                </MenuItem>
                            );
                        })}
                    </Select>
                </FormControl>
                <Button
                    onClick={handleEliminar}
                    color="error"
                    sx={{ mt: 2 }}
                    disabled={seguimientoTerminado === 1}
                >
                    Eliminar personal
                </Button>
            </Box>

            { }
            <Box mt={4}>
                <Typography variant="h6" gutterBottom>Adicionar Dedicación de Personal</Typography>

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

                <Grid container>
                    { }
                    <Grid item xs={12} md={6} sx={{ mb: 2 }}>
                        {tipoPersonal === 'persona' && (
                            <Autocomplete
                                options={responsables}
                                getOptionLabel={(option) =>
                                    option.nombres
                                        ? option.nombres
                                        : ''
                                }
                                value={responsables.find(r => r.cod_emp === dedicacionSeleccionada) || null}
                                onChange={(_, newValue) => {
                                    setDedicacionSeleccionada(newValue ? newValue.cod_emp : '');
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Seleccionar Persona" fullWidth />
                                )}
                            />
                        )}

                        {tipoPersonal === 'cargo' && (
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
                                    <TextField {...params} label="Seleccionar Cargo" fullWidth />
                                )}
                            />
                        )}
                    </Grid>
                </Grid>

                <Box mt={2}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Add />}
                        onClick={() => {
                            if (!dedicacionSeleccionada) {
                                alert("Seleccione una persona o cargo antes de continuar");
                                return;
                            }


                            setDedicacionActual({
                                tipo: tipoPersonal,
                                idactividad: idActividad,
                                idpersona: tipoPersonal === "persona" ? dedicacionSeleccionada : null,
                                idcargo: tipoPersonal === "cargo" ? dedicacionSeleccionada : null,
                            });
                            setOpenModalDedicacion(true);
                        }}
                    >
                        Agregar Dedicación
                    </Button>
                </Box>

                { }
                <ModalDedicacionSemanal
                    open={openModalDedicacion}
                    onClose={() => setOpenModalDedicacion(false)}
                    fechaInicio={new Date().toISOString().split("T")[0]}
                    fechaFin={`${new Date().getFullYear()}-12-31`}
                    tipo={tipoPersonal}
                    onConfirm={(dedicacionesCalculadas) => {
                        const nuevoRegistroPersonal = {
                            ...dedicacionActual,
                            horas: dedicacionesCalculadas.map((d) => ({
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
        </Box>
    );
};

export default DedicacionPersonal;
