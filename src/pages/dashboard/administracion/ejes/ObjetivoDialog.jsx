import { API_BASE_URL } from 'src/config/api';
import { useEffect, useState } from 'react';
import { Edit, Trash } from 'iconsax-react';

import { DataGrid } from '@mui/x-data-grid';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Tooltip,
    Typography,
    Box
} from '@mui/material';

import { toast } from 'src/components/snackbar'; 

export default function ObjetivosDialog({ open, onClose, idejeprograma }) {
    const [objetivos, setObjetivos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formVisible, setFormVisible] = useState(false);
    const [form, setForm] = useState({
        numeroobj: 0,
        descripcion: '',
        idejeprograma: idejeprograma,
    });

    useEffect(() => {
        if (idejeprograma && open) {
            fetchObjetivos();
        }
    }, [idejeprograma, open]);

    const fetchObjetivos = async () => {
        setLoading(true);
        try {
            
            const res = await fetch(`${API_BASE_URL}/objetivoseje`);
            const data = await res.json();

            
            var dataFiltradas = data.filter(item => item.idejeprograma === idejeprograma)

            

            
            const mapped = dataFiltradas.map((item, index) => ({
                id: index + 1,
                ...item,
            }));
            setObjetivos(mapped);
        } catch (error) {
            toast.error('Error al obtener los objetivos');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (row) => {
        setForm(row);
        setFormVisible(true);
    };

    const handleNew = () => {
        const nextNumero = objetivos.length > 0
            ? Math.max(...objetivos.map(obj => obj.numeroobj)) + 1
            : 1;

        setForm({
            numeroobj: nextNumero,
            descripcion: '',
            idejeprograma,
        });
        setFormVisible(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === 'numeroobj' ? Number(value) : value,
        }));
    };

    const handleSave = async () => {
        try {
            
            const method = form.numeroobj <= objetivos.length ? 'PUT' : 'POST';
            const url = form.numeroobj <= objetivos.length
                ? `${API_BASE_URL}/objetivoeje/${form.numeroobj}`
                : `${API_BASE_URL}/objetivoeje`;

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const result = await response.json();

            if (result.status === 200 || response.ok) {
                toast.success('Objetivo guardado correctamente');
                setFormVisible(false);
                fetchObjetivos();
            } else {
                toast.error('Error al guardar el objetivo');
            }
        } catch (error) {
            toast.error('Error de red al guardar');
        }
    };

    const handleDelete = async (numeroobj) => {
        try {
            const response = await fetch(`${API_BASE_URL}/objetivoeje/${numeroobj}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (result.status === 200 || response.ok) {
                toast.success('Objetivo eliminado');
                fetchObjetivos();
            } else {
                toast.error('No se pudo eliminar');
            }
        } catch (error) {
            toast.error('Error al eliminar');
        }
    };

    const columns = [
        { field: 'numeroobj', headerName: 'N° Objetivo', flex: 1 },
        { field: 'descripcion', headerName: 'Descripción', flex: 3 },
        {
            field: 'acciones',
            headerName: 'Acciones',
            flex: 1,
            renderCell: (params) => (
                <>
                    <Tooltip title="Editar">
                        <Edit
                            size="20"
                            color="#007BFF"
                            style={{ cursor: 'pointer', marginRight: 8 }}
                            onClick={() => handleEdit(params.row)}
                        />
                    </Tooltip>
                    <Tooltip title="Eliminar">
                        <Trash
                            size="20"
                            color="red"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleDelete(params.row.numeroobj)}
                        />
                    </Tooltip>
                </>
            ),
        },
    ];

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Objetivos del Eje</DialogTitle>
            <DialogContent dividers>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">Eje: {idejeprograma}</Typography>
                    <Button variant="contained" onClick={handleNew}>
                        Nuevo Objetivo
                    </Button>
                </Box>

                <DataGrid
                    rows={objetivos}
                    columns={columns}
                    loading={loading}
                    autoHeight
                    pageSizeOptions={[5, 10]}
                    initialState={{
                        pagination: { paginationModel: { pageSize: 5 } },
                    }}
                    disableRowSelectionOnClick
                />

                {formVisible && (
                    <Box mt={4}>
                        <Typography variant="subtitle1" gutterBottom>
                            {form.numeroobj > 0 ? 'Editar Objetivo' : 'Nuevo Objetivo'}
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <TextField
                                    fullWidth
                                    label="N° Objetivo"
                                    name="numeroobj"
                                    type="number"
                                    value={form.numeroobj}
                                    onChange={handleFormChange}
                                    InputProps={{
                                        readOnly: true,
                                    }}
                                />
                            </Grid>
                            <Grid item xs={8}>
                                <TextField
                                    fullWidth
                                    label="Descripción"
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleFormChange}
                                    multiline
                                    rows={3}
                                />
                            </Grid>
                        </Grid>
                        <Box mt={2} display="flex" gap={2}>
                            <Button variant="outlined" onClick={() => setFormVisible(false)}>
                                Cancelar
                            </Button>
                            <Button variant="contained" onClick={handleSave}>
                                Guardar
                            </Button>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
            </DialogActions>
        </Dialog>
    );
}
