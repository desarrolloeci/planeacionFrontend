import axios from 'axios';
import { getStorage } from 'minimal-shared/utils';
import React, { useEffect, useState } from 'react';

import {
    Grid,
    TextField,
    Button,
    MenuItem,
    Typography,
    Box,
    Divider,
    Snackbar,
    Alert,
    CircularProgress
} from '@mui/material';
import { API_BASE_URL } from 'src/config/api';

const SeguimientoGeneral = ({ idSeguimiento }) => {
    const seguimientoTerminado = getStorage("seguimientoTerminado");
    const esSeguimientoTerminado = seguimientoTerminado === 1 || seguimientoTerminado === '1';

    const [estadoEjecucionOptions, setEstadoEjecucionOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [formData, setFormData] = useState({
        estadoEjecucion: '',
        porcentajeAvance: 0,
        porcentajeAvanceSistema: 0,
        descripcionAvance: '',
        acciones: '',
        dificultades: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const storedEstados = getStorage("estadosEjeList");


                if (storedEstados) {
                    const parsed = JSON.parse(storedEstados);
                    const parsed2 = parsed.filter(item => item.state === true)
                    setEstadoEjecucionOptions(parsed2);
                }

                if (idSeguimiento) {
                    const res = await axios.get(`${API_BASE_URL}/seguimientos/${idSeguimiento}`);
                    const data = res.data;
                    

                    setFormData({
                        fechaseg: data.fechaseg ?? '',
                        idproyecto: data.idproyecto ?? 0,
                        estadoEjecucion: data.estadoproyseg ?? '',
                        porcentajeAvance: data.prcntavanceproyseg ?? 0,
                        descripcionAvance: data.descripavanceseg ?? '',
                        acciones: data.accionesseg ?? '',
                        dificultades: data.dificultadesavance ?? '',
                        estadoAnterior: data.estadoEjecucionAnterior ?? '',
                        porcentajeAvanceSistema: data.porcentajeAvanceSistema ?? 0
                    });

                }
            } catch (error) {
                console.error("Error al cargar los datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [idSeguimiento]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'porcentajeAvance' && (value < 0 || value > 100)) return;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setSaving(true);

        const dataToSave = {
            "idseguimiento": idSeguimiento,
            "fechaseg": formData.fechaseg,
            "prcntavanceproyseg": formData.porcentajeAvance,
            "estadoproyseg": formData.estadoEjecucion,
            "estadosistemaseg": 1,
            "descripavanceseg": formData.descripcionAvance,
            "accionesseg": formData.acciones,
            "idproyecto": formData.idproyecto,
            "estadoseg": 1,
            "dificultadesavance": formData.dificultades,
            "fechaenvioseg": null
        };

        



        try {
            if (idSeguimiento) {
                await axios.put(`${API_BASE_URL}/seguimientos/${idSeguimiento}`, dataToSave);
            } else {
                await axios.post(`${API_BASE_URL}/seguimientos`, dataToSave);
            }
            setOpenSnackbar(true);
        } catch (error) {
            console.error("Error al guardar:", error);
            alert("Error al guardar los datos.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            {esSeguimientoTerminado && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    Este seguimiento ha sido finalizado y no se puede editar.
                </Alert>
            )}

            <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        fullWidth
                        label="Estado Ejecución"
                        name="estadoEjecucion"
                        value={formData.estadoEjecucion}
                        onChange={handleChange}
                        required
                        disabled={esSeguimientoTerminado}
                    >
                        {estadoEjecucionOptions.map((estado) => (
                            <MenuItem key={estado.secuencial} value={estado.secuencial}>
                                {estado.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        select
                        disabled
                        fullWidth
                        label="Estado Ejecución seguimiento anterior"
                        value={formData.estadoAnterior || ''}
                    >
                        {estadoEjecucionOptions.map((estado) => (
                            <MenuItem key={estado.secuencial} value={estado.secuencial}>
                                {estado.name}
                            </MenuItem>
                        ))}
                    </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        label="Porcentaje de Avance"
                        name="porcentajeAvance"
                        type="number"
                        fullWidth
                        value={formData.porcentajeAvance}
                        onChange={handleChange}
                        inputProps={{ min: 0, max: 100 }}
                        disabled={esSeguimientoTerminado}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <TextField
                        disabled
                        label="Porcentaje de Avance Sistema (Acumulado)"
                        fullWidth
                        value={formData.porcentajeAvanceSistema}
                        InputProps={{ readOnly: true }}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="Descripción del Avance"
                        name="descripcionAvance"
                        value={formData.descripcionAvance}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        disabled={esSeguimientoTerminado}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="Acciones a tomar"
                        name="acciones"
                        value={formData.acciones}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        disabled={esSeguimientoTerminado}
                    />
                </Grid>

                <Grid item xs={12}>
                    <TextField
                        label="Dificultades en el avance"
                        name="dificultades"
                        value={formData.dificultades}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={3}
                        disabled={esSeguimientoTerminado}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box display="flex" justifyContent="center">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={saving || esSeguimientoTerminado}
                        >
                            {saving ? 'Guardando...' : 'Guardar Seguimiento de Proyecto'}
                        </Button>
                    </Box>
                </Grid>
            </Grid>

            <Snackbar open={openSnackbar} autoHideDuration={4000} onClose={() => setOpenSnackbar(false)}>
                <Alert severity="success" sx={{ width: '100%' }}>
                    Seguimiento guardado exitosamente
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SeguimientoGeneral;
