import { API_BASE_URL } from 'src/config/api';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import {
    Box, Grid, Typography, TextField, Button,
    Snackbar, Alert, TableContainer, Table, TableHead,
    TableRow, TableCell, TableBody, Paper
} from '@mui/material';

const SeguimientoMetas = ({ idSeguimiento, idProyecto }) => {
    const [metasEspecificas, setMetasEspecificas] = useState([]);
    const [metasExistentes, setMetasExistentes] = useState([]);
    const [indicadores, setIndicadores] = useState([]);
    const [indicadoresExistentes, setIndicadoresExistentes] = useState([]);
    const [avancesMetas, setAvancesMetas] = useState({});
    const [indicadoresResultados, setIndicadoresResultados] = useState({});
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        const cargarDatos = async () => {
            try {

                const { data: metasData } = await axios.get(`${API_BASE_URL}/proyectos/${idProyecto}`);
                const metasEspecificasFiltradas = metasData.objetivos.filter(m => m.tipoob === 3);
                setMetasEspecificas(metasEspecificasFiltradas);

                setAvancesMetas(metasEspecificasFiltradas.reduce((acc, meta) => ({
                    ...acc,
                    [meta.idobjetivo]: '',
                }), {}));


                const { data: indicadoresData } = await axios.get(`${API_BASE_URL}/indicadores/proyecto/${idProyecto}`);
                setIndicadores(indicadoresData);
                setIndicadoresResultados(indicadoresData.reduce((acc, ind) => ({
                    ...acc,
                    [ind.idindicador]: { resultado: '', descripcion: '' },
                }), {}));


                if (idSeguimiento) {

                    const { data: metasAvance } = await axios.get(`${API_BASE_URL}/segmetas/seguimiento/${idSeguimiento}`);
                    setMetasExistentes(metasAvance);

                    const metasAvanceMap = metasAvance.reduce((acc, item) => {
                        acc[item.idmetaobj] = item.descripavancemetobj || '';
                        return acc;
                    }, {});

                    setAvancesMetas(
                        Object.fromEntries(
                            metasEspecificasFiltradas.map(meta => [
                                meta.idobjetivo,
                                metasAvanceMap[meta.idobjetivo] || ''
                            ])
                        )
                    );


                    const { data: indicadoresAvance } = await axios.get(`${API_BASE_URL}/segindicador/seguimiento/${idSeguimiento}`);
                    setIndicadoresExistentes(indicadoresAvance);

                    const indicadoresAvanceMap = indicadoresAvance.reduce((acc, item) => {
                        acc[item.idindicador] = {
                            resultado: item.resultado || '',
                            descripcion: item.descripresult || ''
                        };
                        return acc;
                    }, {});

                    setIndicadoresResultados(
                        Object.fromEntries(
                            indicadoresData.map(indicador => [
                                indicador.idindicador,
                                indicadoresAvanceMap[indicador.idindicador] || { resultado: '', descripcion: '' }
                            ])
                        )
                    );
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                setSnackbar({ open: true, message: 'Error al cargar metas o indicadores', severity: 'error' });
            }
        };

        if (idProyecto) {
            cargarDatos();
        }
    }, [idProyecto, idSeguimiento]);


    const guardarAvanceMeta = async (idobjetivo, avance) => {
        if (!idSeguimiento) return;

        try {
            const existente = metasExistentes.find(m => m.idmetaobj === idobjetivo);

            

            if (existente) {

                await axios.put(`${API_BASE_URL}/segmetas/${existente.idmetasseg}`, {
                    idmetaobj: idobjetivo,
                    idseguimeinto: idSeguimiento,
                    descripavancemetobj: avance
                });
            } else {

                await axios.post(`${API_BASE_URL}/segmetas`, {
                    idmetaobj: idobjetivo,
                    idseguimeinto: idSeguimiento,
                    descripavancemetobj: avance
                });
            }

            setSnackbar({ open: true, message: 'Avance de meta guardado', severity: 'success' });
        } catch (error) {
            console.error('Error al guardar avance de meta:', error);
            setSnackbar({ open: true, message: 'Error al guardar avance de meta', severity: 'error' });
        }
    };


    const guardarIndicadores = async () => {
        if (!idSeguimiento) return;

        try {

            

            for (const [idindicador, datos] of Object.entries(indicadoresResultados)) {

                

                

                const existente = indicadoresExistentes.find(i => i.idindicador === parseInt(idindicador));

                

                if (existente) {

                    await axios.put(`${API_BASE_URL}/segindicador/${existente.idindicadorseg}`, {
                        idindicador: parseInt(idindicador),
                        idseguimiento: idSeguimiento,
                        resultado: datos.resultado,
                        descripresult: datos.descripcion,
                        idindicadorseg: existente.idindicadorseg
                    });
                } else {

                    await axios.post(`${API_BASE_URL}/segindicador`, {
                        idindicador: parseInt(idindicador),
                        idseguimiento: idSeguimiento,
                        resultado: datos.resultado,
                        descripresult: datos.descripcion,

                    });
                }
            }
            setSnackbar({ open: true, message: 'Indicadores guardados correctamente', severity: 'success' });
        } catch (error) {
            console.error('Error al guardar indicadores:', error);
            setSnackbar({ open: true, message: 'Error al guardar indicadores', severity: 'error' });
        }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Meta(s) Específicas</Typography>

            {metasEspecificas.map((meta) => (
                <Box key={meta.idobjetivo} mb={3}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Descripción de la Meta"
                                value={meta.descripcionob}
                                disabled
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Avance de la Meta"
                                value={avancesMetas[meta.idobjetivo] || ''}
                                onChange={(e) =>
                                    setAvancesMetas({ ...avancesMetas, [meta.idobjetivo]: e.target.value })
                                }
                                multiline
                                rows={3}
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="outlined"
                                onClick={() => guardarAvanceMeta(meta.idobjetivo, avancesMetas[meta.idobjetivo])}
                            >
                                Guardar Avance
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            ))}

            <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>Indicadores del Proyecto</Typography>

            <TableContainer component={Paper} sx={{ mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nombre</TableCell>
                            <TableCell>Periodicidad</TableCell>
                            <TableCell>Descripción</TableCell>
                            <TableCell>Resultado</TableCell>
                            <TableCell>Descripción del Resultado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {indicadores.map((indicador) => (
                            <TableRow key={indicador.idindicador}>
                                <TableCell>{indicador.nombreind}</TableCell>
                                <TableCell>{indicador.periodicidadind}</TableCell>
                                <TableCell>{indicador.descripcioncal}</TableCell>
                                <TableCell>
                                    <TextField
                                        value={indicadoresResultados[indicador.idindicador]?.resultado || ''}
                                        onChange={(e) =>
                                            setIndicadoresResultados({
                                                ...indicadoresResultados,
                                                [indicador.idindicador]: {
                                                    ...indicadoresResultados[indicador.idindicador],
                                                    resultado: e.target.value,
                                                },
                                            })
                                        }
                                        multiline
                                        rows={2}
                                        fullWidth
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        value={indicadoresResultados[indicador.idindicador]?.descripcion || ''}
                                        onChange={(e) =>
                                            setIndicadoresResultados({
                                                ...indicadoresResultados,
                                                [indicador.idindicador]: {
                                                    ...indicadoresResultados[indicador.idindicador],
                                                    descripcion: e.target.value,
                                                },
                                            })
                                        }
                                        multiline
                                        rows={2}
                                        fullWidth
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Grid container justifyContent="center">
                <Button variant="contained" onClick={guardarIndicadores}>Guardar Indicadores</Button>
            </Grid>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
            </Snackbar>
        </Box>
    );
};

export default SeguimientoMetas;
