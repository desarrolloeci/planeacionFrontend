import { API_BASE_URL } from 'src/config/api';
import { getStorage } from 'minimal-shared/utils';
import React, { useEffect, useState } from 'react';

import responsablesLocal from 'src/assets/data/responsables.json';

const API_DEDICACION = `${API_BASE_URL}/personal/actividad/`;
const API_EROGACION = `${API_BASE_URL}/erogacion-pl/actividad/`;
const API_INDICADORES = `${API_BASE_URL}/indicadores/actividad/`;

export default function DetalleActividad({ actividad }) {
    const [dedicacion, setDedicacion] = useState([]);
    const [erogacion, setErogacion] = useState([]);
    const [indicadores, setIndicadores] = useState([]);

    const rubros = JSON.parse(getStorage("rubrosList"));

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

        const persona = responsables.find(r => r.cod_emp === codEmp);
        return persona ? persona.nombres : '';
    };

    useEffect(() => {
        if (!actividad?.idactividad) return;

        const fetchDatos = async () => {
            try {

                const resPersonal = await fetch(`${API_DEDICACION}${actividad.idactividad}`);
                const personalList = await resPersonal.json();


                const personalConDatos = await Promise.all(
                    personalList.map(async (p) => {
                        try {

                            const resHoras = await fetch(`${API_BASE_URL}/horas-personal/personal/${p.idpersonal}`);
                            const horasList = await resHoras.json();


                            const resDedicacion = await fetch(
                                `${API_BASE_URL}/dedicacion-semanal/actividad/${actividad.idactividad}/personal/${p.idpersonal}`
                            );
                            const dedicacionList = await resDedicacion.json();

                            return {
                                ...p,
                                horas: horasList.map(h => ({
                                    agno: h.id.agno,
                                    horas: h.horas,
                                    CantPer: h.cantPer
                                })),
                                dedicaciones: dedicacionList.map(d => ({
                                    agno: d.agno,
                                    horasPorSemana: d.horasPorSemana,
                                    semanasCalculadas: d.semanasCalculadas,
                                    horasTotales: d.horasTotales
                                }))
                            };
                        } catch (err) {
                            console.error(`Error consultando horas/dedicaciones de ${p.idpersonal}`, err);
                            return { ...p, horas: [], dedicaciones: [] };
                        }
                    })
                );



                setDedicacion(personalConDatos);
            } catch (error) {
                console.error("Error cargando dedicación:", error);
                setDedicacion([]);
            }


            fetch(`${API_EROGACION}${actividad.idactividad}`)
                .then(res => res.json())
                .then(setErogacion)
                .catch(() => setErogacion([]));


            fetch(`${API_INDICADORES}${actividad.idactividad}`)
                .then(res => res.json())
                .then(setIndicadores)
                .catch(() => setIndicadores([]));
        };

        fetchDatos();
    }, [actividad]);

    const td = { border: '1px solid #ccc', padding: '8px' };

    return (
        <div>
            <h4>Dedicación de personal:</h4>
            {dedicacion.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={td}>Nombre</th>
                            <th style={td}>Cargo</th>
                            <th style={td}>Año</th>
                            <th style={td}>Horas</th>
                            <th style={td}>Cantidad Pers.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dedicacion.map((d, i) =>
                            d.horas && d.horas.length > 0 ? (
                                d.horas.map((h, j) => (
                                    <tr key={`${i}-${j}`}>
                                        <td style={td}>
                                            {d.nombreparticpprs !== "Sin definir"
                                                ? getNombrePersona(d.nombreparticpprs)
                                                : d.cargoparticprs}
                                        </td>
                                        <td style={td}>{d.cargo || d.cargoparticprs}</td>
                                        <td style={td}>{h.agno || '-'}</td>
                                        <td style={td}>{h.horas != null ? h.horas : '-'}</td>
                                        <td style={td}>{h.CantPer != null ? h.CantPer : '-'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr key={i}>
                                    <td style={td}>
                                        {d.nombreparticpprs !== "Sin definir"
                                            ? getNombrePersona(d.nombreparticpprs)
                                            : d.cargoparticprs}
                                    </td>
                                    <td style={td}>{d.cargo || d.cargoparticprs}</td>
                                    <td style={td}>-</td>
                                    <td style={td}>-</td>
                                    <td style={td}>-</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>

            ) : <p>No hay datos de dedicación disponibles.</p>}

            <h5 style={{ marginTop: 16 }}>Detalle dedicación semanal:</h5>
            {dedicacion.some(d => d.dedicaciones && d.dedicaciones.length > 0) ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
                    <thead>
                        <tr>
                            <th style={td}>Nombre</th>
                            <th style={td}>Cargo</th>
                            <th style={td}>Año</th>
                            <th style={td}>Horas/semana</th>
                            <th style={td}>Semanas calculadas</th>
                            <th style={td}>Horas totales</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dedicacion.map((d, i) =>
                            d.dedicaciones && d.dedicaciones.length > 0 ? (
                                d.dedicaciones.map((ds, j) => (
                                    <tr key={`${i}-${j}`}>
                                        <td style={td}>
                                            {d.nombreparticpprs !== "Sin definir"
                                                ? getNombrePersona(d.nombreparticpprs)
                                                : d.cargoparticprs}
                                        </td>
                                        <td style={td}>{d.cargo || d.cargoparticprs}</td>
                                        <td style={td}>{ds.agno}</td>
                                        <td style={td}>{ds.horasPorSemana}</td>
                                        <td style={td}>{ds.semanasCalculadas}</td>
                                        <td style={td}>{ds.horasTotales}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr key={i}>
                                    <td style={td}>
                                        {d.nombreparticpprs !== "Sin definir"
                                            ? getNombrePersona(d.nombreparticpprs)
                                            : d.cargoparticprs}
                                    </td>
                                    <td style={td}>{d.cargo || d.cargoparticprs}</td>
                                    <td style={td}>-</td>
                                    <td style={td}>-</td>
                                    <td style={td}>-</td>
                                    <td style={td}>-</td>
                                </tr>
                            )
                        )}
                    </tbody>
                </table>
            ) : (
                <p>No hay datos de dedicación semanal disponibles.</p>
            )}

            <h4 style={{ marginTop: 24 }}>Presupuesto Erogación:</h4>
            {erogacion.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={td}>Rubro</th>
                            <th style={td}>Año</th>
                            <th style={td}>Valor</th>
                            <th style={td}>Observación</th>
                        </tr>
                    </thead>
                    <tbody>
                        {erogacion.map((e, i) => (
                            <tr key={i}>
                                <td style={td}>{rubros.find(r => r.id === parseInt(e.rubropl))?.name || ''}</td>
                                <td style={td}>{e.agno}</td>
                                <td style={td}>{Number(e.valor).toLocaleString("es-CO", { style: "currency", currency: "COP" })}</td>
                                <td style={td}>{e.observacionpl}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p>No hay datos de erogación disponibles.</p>}


        </div>
    );
}
