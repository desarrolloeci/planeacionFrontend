import React, { useEffect, useState } from "react";
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Box
} from "@mui/material";
import axios from "axios";
import { API_BASE_URL } from "src/config/api";

const TablaDedicacionSemanal = ({
    idActividad,
    idPersonal,
    fechaInicio,
    fechaFin,
    tipo
}) => {
    const [dedicaciones, setDedicaciones] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        
        if (!idActividad || !idPersonal) return;
        cargar();
    }, [idActividad, idPersonal]);

    const cargar = async () => {
        try {
            setLoading(true);

            const rangosCalculados = calcularRangoPorAnio();

            const [resDed, resHoras] = await Promise.all([
                axios.get(`${API_BASE_URL}/dedicacion-semanal/actividad/${idActividad}/personal/${idPersonal}`),
                axios.get(`${API_BASE_URL}/horas-personal/personal/${idPersonal}`)
            ]);

            const horasPorAnio = resHoras.data?.reduce((acc, h) => {
                acc[h.id.agno] = h.cantPer || 1;
                return acc;
            }, {}) || {};

            let dataFinal = [];

            if (resDed.data?.length > 0) {
                dataFinal = resDed.data.map((d) => {
                    const fInicio = d.fechaInicio ? new Date(d.fechaInicio).toLocaleDateString() : "-";
                    const fFin = d.fechaFin ? new Date(d.fechaFin).toLocaleDateString() : "-";

                    return {
                        agno: d.agno,
                        rangoAnual: `${fInicio} - ${fFin}`,
                        semanasCalculadas: d.semanasCalculadas,
                        horasPorSemana: d.horasPorSemana,
                        CantPer: d.cantPer || horasPorAnio[d.agno] || 1,
                        horasTotales: d.horasTotales
                    };
                });
            } else {
                
                dataFinal = Object.keys(rangosCalculados).map((anio) => ({
                    agno: Number(anio),
                    rangoAnual: rangosCalculados[anio],
                    semanasCalculadas: 0,
                    horasPorSemana: 0,
                    CantPer: tipo === "cargo" ? "" : 1,
                    horasTotales: 0
                }));
            }

            
            
            dataFinal.sort((a, b) => a.agno - b.agno);

            setDedicaciones(dataFinal);
        } catch (err) {
            console.error(err);
            
            const errorRows = Object.keys(calcularRangoPorAnio()).map(anio => ({ agno: Number(anio) }));
            setDedicaciones(errorRows.sort((a, b) => a.agno - b.agno));
        } finally {
            setLoading(false);
        }
    };

    const calcularSemanas = () => {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        if (isNaN(inicio) || isNaN(fin)) return;

        const result = [];
        let current = new Date(inicio);

        while (current <= fin) {
            const year = current.getFullYear();
            const endOfYear = new Date(year, 11, 31);
            const endRange = endOfYear < fin ? endOfYear : fin;

            const diffDays = (endRange - current) / (1000 * 60 * 60 * 24);
            const weeks = Math.ceil(diffDays / 7);

            result.push({
                agno: year,
                rangoAnual: `${current.toLocaleDateString()} - ${endRange.toLocaleDateString()}`,
                semanasCalculadas: weeks,
                horasPorSemana: 0,
                CantPer: tipo === "cargo" ? "" : 1,
                horasTotales: 0
            });

            current = new Date(year + 1, 0, 1);
        }

        setDedicaciones(result);
    };

    const construirDesdeFechas = (rangosPorAnio) => {
        const rows = Object.keys(rangosPorAnio).map((anio) => ({
            agno: Number(anio),
            rangoAnual: rangosPorAnio[anio],
            semanasCalculadas: 0,
            horasPorSemana: 0,
            CantPer: tipo === "cargo" ? "" : 1,
            horasTotales: 0
        }));

        setDedicaciones(rows);
    };



    const calcularRangoPorAnio = () => {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        if (isNaN(inicio) || isNaN(fin)) return [];

        const rangos = {};
        let current = new Date(inicio);

        while (current <= fin) {
            const year = current.getFullYear();
            const endOfYear = new Date(year, 11, 31);
            const endRange = endOfYear < fin ? endOfYear : fin;

            rangos[year] = `${current.toLocaleDateString()} - ${endRange.toLocaleDateString()}`;
            current = new Date(year + 1, 0, 1);
        }

        return rangos;
    };

    if (loading) return <Typography>Cargando...</Typography>;

    return (
        <Box>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell align="center"><b>Año</b></TableCell>
                        <TableCell align="center"><b>Rango</b></TableCell>
                        <TableCell align="center"><b>Semanas</b></TableCell>
                        <TableCell align="center"><b>Horas / semana</b></TableCell>
                        {tipo === "cargo" && (
                            <TableCell align="center"><b>Cant. Personas</b></TableCell>
                        )}
                        <TableCell align="center"><b>Horas Totales</b></TableCell>
                    </TableRow>
                </TableHead>

                <TableBody>
                    {dedicaciones.map((row) => (
                        <TableRow key={row.agno}>
                            <TableCell align="center">{row.agno}</TableCell>
                            <TableCell align="center">{row.rangoAnual}</TableCell>
                            <TableCell align="center">{row.semanasCalculadas}</TableCell>
                            <TableCell align="center">{row.horasPorSemana}</TableCell>
                            {tipo === "cargo" && (
                                <TableCell align="center">{row.CantPer}</TableCell>
                            )}
                            <TableCell align="center">{row.horasTotales}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Box>
    );
};

export default TablaDedicacionSemanal;
