import { API_BASE_URL } from 'src/config/api';

import axios from 'axios';
import React, { useEffect, useState } from 'react';

import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    Button,
    Grid,
    InputLabel,
    FormControl,
    Paper
} from '@mui/material';

const PresupuestoErogacion = ({ idactividad }) => {
    const [erogaciones, setErogaciones] = useState([]);
    const [rubros, setRubros] = useState([]);
    const [total, setTotal] = useState(0);


    useEffect(() => {
        const fetchErogaciones = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/erogacion-pl/actividad/${idactividad}`);
                
                setErogaciones(response.data);
                calcularTotal(response.data);
            } catch (error) {
                console.error('Error cargando erogaciones:', error);
            }
        };
        fetchErogaciones();
    }, [idactividad]);


    useEffect(() => {
        const fetchRubros = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/rubrosplaneacion`);

                const rubrosActivos = response.data.filter(r => r.estado === 1);
                setRubros(rubrosActivos);
            } catch (error) {
                console.error('Error cargando rubros:', error);
            }
        };
        fetchRubros();
    }, []);

    const calcularTotal = (data) => {
        const suma = data.reduce((acc, item) => acc + Number(item.valor || 0), 0);
        setTotal(suma);
    };

    const handleChange = (index, field, value) => {
        const updated = [...erogaciones];
        updated[index][field] = value;
        setErogaciones(updated);
        calcularTotal(updated);
    };

    const handleActualizar = async (index) => {
        try {
            const item = erogaciones[index];
            await axios.put(`${API_BASE_URL}/erogacion-pl/${item.iderogacionpl}`, item);
            alert('Erogación actualizada correctamente');
            calcularTotal(erogaciones);
        } catch (error) {
            console.error('Error actualizando erogación:', error);
        }
    };

    return (
        <Paper >
            <Typography variant="h6" color="black" gutterBottom>
                Presupuesto Erogación
            </Typography>

            {erogaciones.map((row, index) => (
                <Box key={row.iderogacionpl} sx={{ mb: 2, p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        { }
                        { }
                        <Grid item xs={3}>
                            <FormControl fullWidth>
                                <InputLabel>Rubro</InputLabel>
                                <Select
                                    value={row.rubropl || ''}
                                    onChange={(e) => handleChange(index, 'rubropl', e.target.value)}
                                >
                                    {rubros.map((rubro) => (
                                        <MenuItem key={rubro.idrubropl} value={rubro.idrubropl}>
                                            {rubro.nombre}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        { }
                        <Grid item xs={2}>
                            <FormControl fullWidth>
                                <InputLabel>Año</InputLabel>
                                <Select
                                    value={row.agno || ''}
                                    onChange={(e) => handleChange(index, 'agno', e.target.value)}
                                >
                                    {[2019, 2020, 2021, 2022, 2026, 2027].map((year) => (
                                        <MenuItem key={year} value={year}>{year}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        { }
                        <Grid item xs={2}>
                            <TextField
                                label="Valor"
                                type="number"
                                fullWidth
                                value={row.valor}
                                onChange={(e) => handleChange(index, 'valor', e.target.value)}
                            />
                        </Grid>

                        { }
                        <Grid item xs={3}>
                            <TextField
                                label="Observación"
                                fullWidth
                                value={row.observacionpl || ''}
                                onChange={(e) => handleChange(index, 'observacionpl', e.target.value)}
                            />
                        </Grid>

                        { }
                        <Grid item xs={2}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => handleActualizar(index)}
                            >
                                Modificar
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            ))}

            { }
            <Typography variant="h6" sx={{ mt: 3 }}>
                Total presupuesto de erogación: ${total.toLocaleString()}
            </Typography>
        </Paper>
    );
};

export default PresupuestoErogacion;
