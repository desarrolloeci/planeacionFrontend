import axios from 'axios';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';

import {
    Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography
} from '@mui/material';

const SeguimientoFechasTerminado = () => {
    const [fechas, setFechas] = useState([]);
    const [formData, setFormData] = useState({
        inicioPeriodo: '',
        finPeriodo: '',
        inicioSeguimiento: '',
        finSeguimiento: '',
    });

    
    const API_URL = 'https://tu-api.com/seguimientos';

    
    useEffect(() => {
        fetchFechas();
    }, []);

    const fetchFechas = async () => {
        try {
            const response = await axios.get(API_URL);
            setFechas(response.data);
        } catch (error) {
            console.error('Error al cargar fechas:', error);
        }
    };

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async () => {
        try {
            await axios.post(API_URL, formData);
            fetchFechas(); 
            setFormData({ inicioPeriodo: '', finPeriodo: '', inicioSeguimiento: '', finSeguimiento: '' });
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };

    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>
                Fechas de Seguimiento recientes
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Fecha Inicio</TableCell>
                            <TableCell>Fecha Fin</TableCell>
                            <TableCell>Fecha Inicio Usuarios</TableCell>
                            <TableCell>Fecha Fin Usuarios</TableCell>
                            <TableCell>Estado</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fechas.map((fila, index) => (
                            <TableRow key={index}>
                                <TableCell>{fila.inicioPeriodo}</TableCell>
                                <TableCell>{fila.finPeriodo}</TableCell>
                                <TableCell>{fila.inicioSeguimiento}</TableCell>
                                <TableCell>{fila.finSeguimiento}</TableCell>
                                <TableCell>{fila.estado}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box display="flex" gap={2} flexWrap="wrap">
                <TextField
                    label="Periodo A Evaluar (Inicio)"
                    type="date"
                    name="inicioPeriodo"
                    value={formData.inicioPeriodo}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Periodo A Evaluar (Fin)"
                    type="date"
                    name="finPeriodo"
                    value={formData.finPeriodo}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Seguimiento (Inicio)"
                    type="date"
                    name="inicioSeguimiento"
                    value={formData.inicioSeguimiento}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                />
                <TextField
                    label="Seguimiento (Fin)"
                    type="date"
                    name="finSeguimiento"
                    value={formData.finSeguimiento}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                />
                <Button variant="contained" color="error" onClick={handleSubmit}>
                    Registrar nueva fecha de seguimiento
                </Button>
            </Box>
        </Paper>
    );
};

export default SeguimientoFechasTerminado;
