import { API_BASE_URL } from 'src/config/api';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

import {
    Box,
    Grid,
    Typography,
    TextField,
    Button,
    Snackbar,
    Alert,
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
} from '@mui/material';

const SeguimientoMetasTerminado = ({ idSeguimiento, idProyecto }) => {
    const [metasEspecificas, setMetasEspecificas] = useState([]);
    const [indicadores, setIndicadores] = useState([]);
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
                    const { data } = await axios.get(`/api/seguimientos/${idSeguimiento}`);
                    const { metasAvance, indicadoresAvance } = data;

                    setAvancesMetas(prev =>
                        Object.fromEntries(Object.entries(prev).map(([id, _]) => [
                            id,
                            metasAvance?.[id] || '',
                        ]))
                    );

                    setIndicadoresResultados(prev =>
                        Object.fromEntries(Object.entries(prev).map(([id, _]) => [
                            id,
                            indicadoresAvance?.[id] || { resultado: '', descripcion: '' },
                        ]))
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
            await axios.post('/api/metas-avance', {
                seguimientoId: idSeguimiento,
                idobjetivo,
                avance,
            });
            setSnackbar({ open: true, message: `Avance guardado para la meta`, severity: 'success' });
        } catch (error) {
            setSnackbar({ open: true, message: 'Error al guardar avance de meta', severity: 'error' });
        }
    };

    const guardarIndicadores = async () => {
        if (!idSeguimiento) return;

        try {
            const resultados = Object.entries(indicadoresResultados).map(([idindicador, datos]) => ({
                idindicador: parseInt(idindicador),
                ...datos,
            }));
            await axios.post('/api/indicadores-avance', {
                seguimientoId: idSeguimiento,
                resultados,
            });
            setSnackbar({ open: true, message: 'Indicadores guardados correctamente', severity: 'success' });
        } catch (error) {
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
                                disabled
                                rows={3}
                                fullWidth
                            />
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
                                        disabled
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
                                        disabled
                                        rows={2}
                                        fullWidth
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>


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

export default SeguimientoMetasTerminado;
