import axios from 'axios';
import dayjs from 'dayjs';
import { Edit } from 'iconsax-react';
import React, { useEffect, useState } from 'react';
import {
    Box, Button, Dialog, DialogActions, DialogContent, DialogContentText,
    DialogTitle, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    TextField, Typography, IconButton, Chip, TablePagination
} from '@mui/material';
import { API_BASE_URL } from 'src/config/api';

const API_URL = `${API_BASE_URL}/fechaseguimiento`;

const SeguimientoFechas = () => {
    const [fechas, setFechas] = useState([]);
    const [formData, setFormData] = useState({
        fechainiodi: '',
        fechafinodi: '',
        feciniseg: '',
        fecfinseg: '',
    });
    const [openConfirm, setOpenConfirm] = useState(false);
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        fetchFechas();
    }, []);


    const fetchFechas = async () => {
        try {
            const { data } = await axios.get(API_URL);

            const fechasList = data.map(item => ({
                feciniseg: item.id?.feciniseg || item.feciniseg,
                flag: item.id?.flag || item.flag,
                fecfinseg: item.fecfinseg,
                fechainiodi: item.fechainiodi,
                fechafinodi: item.fechafinodi
            }));

            
            const ordenadas = fechasList.sort((a, b) =>
                dayjs(b.fechainiodi).diff(dayjs(a.fechainiodi))
            );

            setFechas(ordenadas);
        } catch (error) {
            console.error('Error al cargar fechas:', error);
        }
    };


    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };


    const handleSubmit = async () => {

        
        if (!formData.fechainiodi || !formData.fechafinodi || !formData.feciniseg || !formData.fecfinseg) {
            alert('Todos los campos son obligatorios');
            return;
        }

        const nuevaFecha = {
            id: {
                feciniseg: formData.feciniseg,
                flag: 1
            },
            fecfinseg: formData.fecfinseg,
            fechainiodi: formData.fechainiodi,
            fechafinodi: formData.fechafinodi
        };
        





        try {
            await axios.post(API_URL, nuevaFecha);
            setFormData({ fechainiodi: '', fechafinodi: '', feciniseg: '', fecfinseg: '' });
            fetchFechas();
        } catch (error) {
            console.error('Error al guardar:', error);
        }
    };


    const confirmarCambioEstado = (fila) => {
        setFechaSeleccionada(fila);
        setOpenConfirm(true);
    };

    const handleToggleEstado = async () => {
        if (!fechaSeleccionada) return;

        try {
            const fechaISO = new Date(fechaSeleccionada.feciniseg).toISOString().split('T')[0];

            await axios.put(`${API_URL}/cambiar-flag/${fechaISO}?nuevoFlag=${fechaSeleccionada.flag === 1 ? 0 : 1}`);

            setOpenConfirm(false);
            fetchFechas();
        } catch (error) {
            console.error('Error actualizando flag:', error);
            setOpenConfirm(false);
        }
    };


    const handleChangePage = (event, newPage) => setPage(newPage);
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    return (
        <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h6" gutterBottom>Fechas de Seguimiento</Typography>

            <TableContainer component={Paper} sx={{ mb: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Inicio Periodo</TableCell>
                            <TableCell>Fin Periodo</TableCell>
                            <TableCell>Inicio Seguimiento</TableCell>
                            <TableCell>Fin Seguimiento</TableCell>
                            <TableCell>Estado</TableCell>
                            <TableCell>Acciones</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {fechas.length > 0 ? (
                            fechas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((fila, index) => (
                                    
                                    <TableRow key={`${fila.feciniseg}-${index}`}>
                                        {}
                                        <TableCell>{dayjs(fila.fechainiodi).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{dayjs(fila.fechafinodi).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{dayjs(fila.feciniseg).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>{dayjs(fila.fecfinseg).format('DD/MM/YYYY')}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={fila.flag === 1 ? 'Activo' : 'Inactivo'}
                                                color={fila.flag === 1 ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton onClick={() => confirmarCambioEstado(fila)}>
                                                <Edit size="20" color="#1976d2" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">No hay fechas registradas.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={fechas.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
            />

            <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
                <TextField label="Periodo (Inicio)" type="date" name="fechainiodi" value={formData.fechainiodi} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <TextField label="Periodo (Fin)" type="date" name="fechafinodi" value={formData.fechafinodi} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <TextField label="Seguimiento (Inicio)" type="date" name="feciniseg" value={formData.feciniseg} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <TextField label="Seguimiento (Fin)" type="date" name="fecfinseg" value={formData.fecfinseg} onChange={handleChange} InputLabelProps={{ shrink: true }} />
                <Button variant="contained" color="error" onClick={handleSubmit} disabled={!formData.fechainiodi || !formData.fechafinodi || !formData.feciniseg || !formData.fecfinseg}>
                    Registrar nueva fecha de seguimiento
                </Button>
            </Box>

            <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
                <DialogTitle>Cambiar Estado</DialogTitle>
                <DialogContent>
                    <DialogContentText>¿Seguro que deseas cambiar el estado de esta fecha de seguimiento?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenConfirm(false)}>Cancelar</Button>
                    <Button onClick={handleToggleEstado} color="primary" variant="contained">Confirmar</Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SeguimientoFechas;
