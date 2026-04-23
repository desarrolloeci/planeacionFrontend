import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "src/config/api";
import responsablesLocal from 'src/assets/data/responsables.json';


const ModalDedicacionSemanal = ({
    idPersona,
    open,
    onClose,
    fechaInicio,
    fechaFin,
    onConfirm,
    idActividad,
    idPersonal,
    tipo,
}) => {
    const [dedicaciones, setDedicaciones] = useState([]);
    const [loading, setLoading] = useState(false);
    
    useEffect(() => {
        if (!open) {
            setDedicaciones([]);
            return () => { };
        }

        if (idActividad && idPersonal) {
            cargarDedicacionesExistentes();
        } else if (fechaInicio && fechaFin) {
            calcularSemanasPorAnio();
        }

        return () => setDedicaciones([]);

    }, [open]);

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




    const getNombrePersona = (codEmp) => {
        
        const persona = responsables.find(r => Number(r.cod_emp) === Number(codEmp));
        
        
        return persona ? persona.nomEmp + " " + persona.ap1Emp + " " + persona.ap2Emp : '';
    };

    const cargarDedicacionesExistentes = async () => {
        try {
            setLoading(true);

            
            const [resDed, resHoras] = await Promise.all([
                axios.get(`${API_BASE_URL}/dedicacion-semanal/actividad/${idActividad}/personal/${idPersonal}`),
                axios.get(`${API_BASE_URL}/horas-personal/personal/${idPersonal}`)
            ]);

            const horasPorAnio = resHoras.data?.reduce((acc, h) => {
                acc[h.id.agno] = h.cantPer || 1;
                return acc;
            }, {}) || {};

            
            const inicioGlobal = new Date(fechaInicio);
            const finGlobal = new Date(fechaFin);
            const aniosNecesarios = [];
            let current = new Date(inicioGlobal);

            while (current <= finGlobal) {
                aniosNecesarios.push(current.getFullYear());
                current = new Date(current.getFullYear() + 1, 0, 1);
            }

            
            const existentesMap = {};
            if (resDed.data?.length > 0) {
                resDed.data.forEach((d) => {
                    existentesMap[d.agno] = {
                        iddedicacion: d.id,
                        agno: d.agno,
                        fechaInicioAnual: d.fechaInicio,
                        fechaFinAnual: d.fechaFin,
                        semanasCalculadas: d.semanasCalculadas,
                        horasPorSemana: d.horasPorSemana,
                        CantPer: d.cantPer || horasPorAnio[d.agno] || 1,
                        horasTotales: d.horasTotales,
                    };
                });
            }

            
            const dataFinal = aniosNecesarios.map((year) => {
                if (existentesMap[year]) {
                    return existentesMap[year]; 
                } else {
                    
                    const startOfYear = new Date(year, 0, 1) < inicioGlobal ? inicioGlobal : new Date(year, 0, 1);
                    const endOfYear = new Date(year, 11, 31) > finGlobal ? finGlobal : new Date(year, 11, 31);
                    const diffDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
                    const weeks = Math.max(0, Math.ceil(diffDays / 7) + 1);

                    return {
                        agno: year,
                        fechaInicioAnual: startOfYear.toISOString().split('T')[0],
                        fechaFinAnual: endOfYear.toISOString().split('T')[0],
                        semanasCalculadas: weeks,
                        horasPorSemana: "",
                        CantPer: tipo === "cargo" ? "" : 1,
                        horasTotales: 0,
                        iddedicacion: null 
                    };
                }
            });

            setDedicaciones(dataFinal);
        } catch (err) {
            console.error("Error cargando dedicaciones:", err);
            calcularSemanasPorAnio();
        } finally {
            setLoading(false);
        }
    };
    const calcularSemanasPorAnio = () => {
        const inicioGlobal = new Date(fechaInicio);
        const finGlobal = new Date(fechaFin);
        if (isNaN(inicioGlobal) || isNaN(finGlobal)) return;

        const result = [];
        let current = new Date(inicioGlobal);

        while (current <= finGlobal) {
            const year = current.getFullYear();
            const startOfYear = new Date(year, 0, 1) < inicioGlobal ? inicioGlobal : new Date(year, 0, 1);
            const endOfYear = new Date(year, 11, 31) > finGlobal ? finGlobal : new Date(year, 11, 31);

            const diffDays = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24);
            const weeks = Math.ceil(diffDays / 7);

            result.push({
                agno: year,
                
                fechaInicioAnual: startOfYear.toISOString().split('T')[0],
                fechaFinAnual: endOfYear.toISOString().split('T')[0],
                semanasCalculadas: weeks,
                horasPorSemana: "",
                CantPer: tipo === "cargo" ? "" : 1,
                horasTotales: 0,
            });

            current = new Date(year + 1, 0, 1);
        }

        setDedicaciones(result);
    };

    const handleDateChange = (agno, field, value) => {
        
        const minGlobal = fechaInicio;
        const maxGlobal = fechaFin;

        setDedicaciones((prev) =>
            prev.map((item) => {
                if (item.agno !== agno) return item;

                
                
                const minPermitidoParaEsteAgno = [agno + "-01-01", minGlobal].sort().reverse()[0];

                
                const maxPermitidoParaEsteAgno = [agno + "-12-31", maxGlobal].sort()[0];

                let newInicio = item.fechaInicioAnual;
                let newFin = item.fechaFinAnual;

                if (field === 'inicio') {
                    newInicio = value;
                    if (newInicio < minPermitidoParaEsteAgno) newInicio = minPermitidoParaEsteAgno;
                    if (newInicio > maxPermitidoParaEsteAgno) newInicio = maxPermitidoParaEsteAgno;
                    if (newInicio > newFin) newFin = newInicio;
                }

                if (field === 'fin') {
                    newFin = value;
                    if (newFin > maxPermitidoParaEsteAgno) newFin = maxPermitidoParaEsteAgno;
                    if (newFin < minPermitidoParaEsteAgno) newFin = minPermitidoParaEsteAgno;
                    if (newFin < newInicio) newInicio = newFin;
                }

                const dateI = new Date(newInicio);
                const dateF = new Date(newFin);
                const diffDays = (dateF - dateI) / (1000 * 60 * 60 * 24);
                const weeks = Math.max(0, Math.ceil(diffDays / 7) + 1);

                return {
                    ...item,
                    fechaInicioAnual: newInicio,
                    fechaFinAnual: newFin,
                    semanasCalculadas: weeks,
                    horasTotales: weeks * (item.horasPorSemana || 0) * (item.CantPer || 1)
                };
            })
        );
    };
    const handleHorasChange = (agno, value) => {
        const horas = Number(value || 0);
        setDedicaciones((prev) =>
            prev.map((item) =>
                item.agno === agno
                    ? {
                        ...item,
                        horasPorSemana: horas,
                        horasTotales: item.semanasCalculadas * horas * (item.CantPer || 1),
                    }
                    : item
            )
        );
    };

    const handleCantidadChange = (agno, value) => {
        const cant = Number(value || 0);
        setDedicaciones((prev) =>
            prev.map((item) =>
                item.agno === agno
                    ? {
                        ...item,
                        CantPer: cant,
                        horasTotales: item.semanasCalculadas * (item.horasPorSemana || 0) * cant,
                    }
                    : item
            )
        );
    };

    const handleConfirm = () => {
        const faltantes = dedicaciones.filter(
            (d) =>
                !d.horasPorSemana ||
                Number(d.horasPorSemana) <= 0 ||
                (tipo === "cargo" && (!d.CantPer || Number(d.CantPer) <= 0))
        );
        if (faltantes.length > 0) {
            alert("Debe ingresar horas y cantidad (si aplica) para todos los años antes de continuar.");
            return;
        }

        onConfirm(dedicaciones);
        handleClose();
    };

    const handleClose = () => {
        setDedicaciones([]);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Typography sx={{ textTransform: "none" }} variant="h5" mb={2}>
                    Dedicación Semanal {
                        getNombrePersona(idPersona?.trim())
                            .toLowerCase()
                            .replace(/\b\w/g, (l) => l.toUpperCase())
                    }
                </Typography>
            </DialogTitle>

            <DialogContent>
                {!loading ? (
                    <>
                        <Typography variant="body2" mb={2}>
                            El sistema calcula automáticamente las semanas activas por año.{" "}
                            {tipo === "cargo"
                                ? "Ingrese también la cantidad de personas por año."
                                : "Las personas individuales siempre se consideran con cantidad 1."}
                        </Typography>

                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center"><b>Año</b></TableCell>
                                    <TableCell align="center"><b>Rango</b></TableCell>
                                    <TableCell align="center"><b>Semanas</b></TableCell>
                                    <TableCell align="center"><b>Horas/semana</b></TableCell>
                                    {tipo === "cargo" && (
                                        <TableCell align="center"><b>Cant. Personas</b></TableCell>
                                    )}
                                    <TableCell align="center"><b>Horas Totales</b></TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {dedicaciones.map((row) => {
                                    
                                    const minFila = [row.agno + "-01-01", fechaInicio].sort().reverse()[0];
                                    const maxFila = [row.agno + "-12-31", fechaFin].sort()[0];

                                    return (
                                        <TableRow key={row.agno}>
                                            <TableCell align="center">{row.agno}</TableCell>
                                            <TableCell align="center">
                                                {}
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    value={row.fechaInicioAnual}
                                                    onChange={(e) => handleDateChange(row.agno, 'inicio', e.target.value)}
                                                    slotProps={{
                                                        htmlInput: { min: minFila, max: maxFila }
                                                    }}
                                                    sx={{ width: 130, mb: 1 }}
                                                />
                                                <br />
                                                {}
                                                <TextField
                                                    type="date"
                                                    size="small"
                                                    value={row.fechaFinAnual}
                                                    onChange={(e) => handleDateChange(row.agno, 'fin', e.target.value)}
                                                    slotProps={{
                                                        htmlInput: { min: minFila, max: maxFila }
                                                    }}
                                                    sx={{ width: 130 }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">{row.semanasCalculadas}</TableCell>
                                            <TableCell align="center">
                                                <TextField
                                                    type="number"
                                                    size="small"
                                                    inputProps={{ min: 0 }}
                                                    value={row.horasPorSemana}
                                                    onChange={(e) =>
                                                        handleHorasChange(row.agno, e.target.value)
                                                    }
                                                    sx={{ width: 100 }}
                                                />
                                            </TableCell>

                                            {tipo === "cargo" && (
                                                <TableCell align="center">
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        inputProps={{ min: 1 }}
                                                        value={row.CantPer}
                                                        onChange={(e) =>
                                                            handleCantidadChange(row.agno, e.target.value)
                                                        }
                                                        sx={{ width: 80 }}
                                                    />
                                                </TableCell>
                                            )}

                                            <TableCell align="center">{row.horasTotales}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </>
                ) : (
                    <Typography>Cargando...</Typography>
                )}
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConfirm}
                    disabled={dedicaciones.length === 0 || loading}
                >
                    Confirmar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDedicacionSemanal;
