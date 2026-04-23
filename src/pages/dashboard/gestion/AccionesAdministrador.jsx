import { API_BASE_URL } from 'src/config/api';
import axios from 'axios';
import React from 'react';
import * as yup from 'yup';
import { useNavigate } from 'react-router';
import { getStorage } from 'minimal-shared/utils';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    useForm,
    Controller
} from 'react-hook-form';
import {
    Add,
    ArrangeHorizontal,
    ArrowDown2,
    ArrowLeft,
    ArrowRight,
    CloseCircle,
    Like1,
    Trash
} from 'iconsax-react';

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Stack,
    Snackbar,
    Alert,
    Autocomplete
} from '@mui/material';

import rubrosJson from 'src/assets/data/rubros.json';
import centrosJson from 'src/assets/data/centros.json';

const schema = yup.object().shape({
    observacionGeneral: yup.string()
});

export default function AccionesAdministrador({ proyecto }) {
    const navigate = useNavigate();

    const estados = JSON.parse(getStorage("estadosGenList"));
    const usuario = JSON.parse(getStorage("user"));
    const perfil = usuario?.perfil || '';
    const esAdministrador = perfil === 'Administrador';
    const esGestionador = perfil === 'Gestionador';



    const [centrosCosto, setCentrosCosto] = React.useState([]);
    const [rubrosData, setRubrosData] = React.useState([]);
    const [erogaciones, setErogaciones] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [snackbar, setSnackbar] = React.useState({ open: false, message: '', severity: 'info' });

    const showSnackbar = (message, severity = 'info') => {
        setSnackbar({ open: true, message, severity });
    };

    const {
        control,
        handleSubmit,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            observacionGeneral: ''
        }
    });

    const [nuevaErogacion, setNuevaErogacion] = React.useState({
        ccosto: '',
        rubro: '',
        valor: '',
        fecharub: ''
    });


    React.useEffect(() => {
        const fetchCentros = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/centros-costo`);
                if (res.data?.length > 0) {
                    const centrosMapeados = res.data.map(c => ({
                        codigo: c.cod_cl1.trim(),
                        nombre: c.nccosto.trim()
                    }));


                    const centrosOrdenados = centrosMapeados.sort((a, b) =>
                        a.nombre.localeCompare(b.nombre)
                    );

                    setCentrosCosto(centrosOrdenados);
                } else {
                    setCentrosCosto([]);
                }
            } catch (error) {
                console.error("Error fetching centros:", error);
                setCentrosCosto([]);
            }
        };
        fetchCentros();
    }, []);



    React.useEffect(() => {
        const fetchRubrosPorCentro = async () => {

            if (!nuevaErogacion.ccosto) {
                setRubrosData([]);
                return;
            }

            try {


                const res = await axios.get(`${API_BASE_URL}/rubros/cl1/${nuevaErogacion.ccosto}`);

                if (res.data?.length > 0) {
                    setRubrosData(res.data.map(r => ({
                        id: r.cod_rub,
                        nombre: r.nom_rub.trim(),
                        cod_cl1: r.cod_cl1.trim(),
                        saldo: r.saldo
                    })));
                } else {
                    setRubrosData([]);
                    showSnackbar('No se encontraron rubros para este centro de costo', 'warning');
                }
            } catch (error) {
                console.error("Error fetching rubros por centro:", error);
                setRubrosData([]);
                showSnackbar('Error al cargar rubros específicos', 'error');
            }
        };

        fetchRubrosPorCentro();
    }, [nuevaErogacion.ccosto]);
    const codigosConRubros = new Set(rubrosData.map(r => r.cod_cl1));

    const cargarNombresDesdeCentros = async (listaErogaciones) => {



        const centrosUnicos = [...new Set(listaErogaciones.map(e => e.ccosto))];



        try {

            const promesas = centrosUnicos.map(cc =>
                axios.get(`${API_BASE_URL}/rubros/cl1/${cc}`)
            );

            const respuestas = await Promise.all(promesas);




            const todosLosRubros = respuestas.flatMap(res => res.data.map(r => ({
                id: r.cod_rub,
                nombre: r.nom_rub.trim(),
                cod_cl1: r.cod_cl1.trim(),
                saldo: r.saldo
            })));




            setRubrosData(prev => {
                const existentes = new Map(prev.map(obj => [obj.id, obj]));

                todosLosRubros.forEach(r => existentes.set(r.id, r));

                return Array.from(existentes.values());
            });

        } catch (error) {
            console.error("Error recuperando nombres de rubros:", error);
        }
    };


    const centrosFiltrados = centrosCosto


    const rubrosFiltrados = rubrosData;

    React.useEffect(() => {
        if (proyecto?.idproyecto) {
            axios.get(`${API_BASE_URL}/erogacion-of/proyecto/${proyecto.idproyecto}`)
                .then(res => {
                    setErogaciones(res.data);

                    if (res.data.length > 0) {
                        cargarNombresDesdeCentros(res.data);
                    }
                })
                .catch(() => showSnackbar('Error al cargar erogaciones', 'error'));
        }
    }, [proyecto]);


    const agregarErogacion = async () => {
        const rubroObj = rubrosData.find(r => r.id === nuevaErogacion.rubro);
        if (!rubroObj) {
            showSnackbar('Rubro no válido', 'error');
            return;
        }


        const hoy = new Date().toISOString().split('T')[0];

        const data = {
            idproyecto: proyecto.idproyecto,
            ccosto: nuevaErogacion.ccosto,
            rubro: nuevaErogacion.rubro,
            tiporub: 1,
            valor: Number(nuevaErogacion.valor),
            fecharub: hoy
        };

        if (!data.ccosto || !data.rubro) {
            showSnackbar('Completa todos los campos de la erogación', 'warning');
            return;
        }

        try {
            const res = await axios.post(`${API_BASE_URL}/erogacion-of`, data);
            showSnackbar('Erogación agregada exitosamente', 'success');


            setErogaciones(prev => [...prev, res.data]);


            setNuevaErogacion({ ccosto: '', rubro: '', valor: '', fecharub: '' });
        } catch (error) {
            console.error("Error al guardar:", error);
            showSnackbar('Error al agregar erogación', 'error');
        }
    };


    const eliminarErogacion = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/erogacion-of/${id}`);
            setErogaciones(prev => prev.filter(e => e.iderogacionof !== id));
            showSnackbar('Erogación eliminada correctamente', 'success');
        } catch {
            showSnackbar('Error al eliminar erogación', 'error');
        }
    };

    const formatCurrency = (value) => {
        if (typeof value !== 'number') return value;
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    };

    const getNombreCentroCosto = (codigo) => {


        const centro = centrosCosto.find(c => c.codigo === `${codigo}`);

        return centro ? codigo + " " + centro.nombre : codigo;
    };

    const getNombreRubro = (id) => {
        const rubro = rubrosData.find(r => r.id === id);
        return rubro ? rubro.nombre : id;
    };


    const cambiarEstadoProyecto = async (nuevoEstado, observacionManual) => {
        const estadosNombres = {
            1: 'Devolver',
            2: 'Enviar a Administrador',
            3: 'Solicitud de Cambios',
            4: 'Aprobar',
            7: 'Cancelar'
        };


        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/proyectos/${proyecto.idproyecto}`);
            const proyectoCompleto = res.data;


            const observacionPrevia = proyectoCompleto.observacionadmin || "";


            const fechaHoy = new Date().toLocaleString('es-CO');
            const nuevaEntrada = observacionManual?.trim()
                ? `[${fechaHoy}] - ${usuario.name || 'Admin'}: ${observacionManual.trim()}`
                : `[${fechaHoy}] - Sistema: Cambio de estado a '${estadosNombres[nuevoEstado]}'`;


            const historialActualizado = observacionPrevia
                ? `${observacionPrevia}\n${nuevaEntrada}`
                : nuevaEntrada;

            const proyectoActualizado = {
                ...proyectoCompleto,
                estadopr: nuevoEstado,
                observacionadmin: historialActualizado
            };

            await axios.put(`${API_BASE_URL}/proyectos/${proyecto.idproyecto}`, proyectoActualizado);
            showSnackbar(`Proyecto actualizado`, 'success');
            navigate(-1);
        } catch (error) {
            console.error(error);
            showSnackbar('Error al cambiar el estado', 'error');
        } finally {
            setLoading(false);
        }

    };
    const totalErogado = erogaciones.reduce((sum, e) => sum + Number(e.valor), 0);
    return (
        <form>
            <Typography variant="h5" gutterBottom>Acciones del Administrador</Typography>

            {!esGestionador && (
                <Accordion>
                    <AccordionSummary expandIcon={<ArrowDown2 size="20" />} sx={{ bgcolor: '#f5f5f5' }}>
                        <Typography variant="h6">Presupuesto oficial</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Grid container spacing={2}>
                            { }
                            <Grid item xs={12} sm={4}>
                                <Autocomplete
                                    options={centrosFiltrados}
                                    getOptionLabel={(option) =>
                                        option ? `${option.codigo} - ${option.nombre}` : ''
                                    }
                                    value={

                                        centrosCosto.find((c) => c.codigo === nuevaErogacion.ccosto) || null
                                    }
                                    onChange={(e, newValue) => {
                                        setNuevaErogacion({
                                            ...nuevaErogacion,
                                            ccosto: newValue ? newValue.codigo : '',
                                            rubro: ''
                                        });
                                    }}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Seleccione centro de costo" />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props} key={option.codigo}>
                                            <Typography variant="body2" color="text.secondary">
                                                {option.nombre}
                                            </Typography>
                                        </li>
                                    )}
                                />
                            </Grid>

                            { }
                            <Grid item xs={12} sm={4}>
                                <Autocomplete
                                    options={rubrosFiltrados}
                                    getOptionLabel={(option) => option.nombre}
                                    value={rubrosFiltrados.find(r => r.id === nuevaErogacion.rubro) || null}
                                    onChange={(e, newValue) => {
                                        setNuevaErogacion({
                                            ...nuevaErogacion,
                                            rubro: newValue ? newValue.id : '',

                                            valor: newValue ? newValue.saldo : ''
                                        });
                                    }}
                                    renderInput={(params) => <TextField {...params} label="Seleccione rubro" />}
                                    disabled={!nuevaErogacion.ccosto}
                                />
                            </Grid>

                            <Grid item xs={12} sm={4}>
                                <TextField
                                    label="Valor (Saldo)"
                                    fullWidth
                                    value={formatCurrency(Number(nuevaErogacion.valor))}
                                    disabled
                                    InputProps={{ readOnly: true }}
                                />
                            </Grid>



                            <Grid item xs={12} sm={4}>
                                <Button startIcon={<Add size="20" />}
                                    variant="contained" onClick={agregarErogacion}>Agregar</Button>
                            </Grid>
                        </Grid>

                        <Table size="small" sx={{ mt: 2 }}>
                            <TableHead>
                                <TableRow sx={{ bgcolor: '#eeeeee' }}>
                                    <TableCell><b>Centro Operativo</b></TableCell>
                                    <TableCell><b>Rubro</b></TableCell>
                                    <TableCell align="right"><b>Valor Inicial Asignado</b></TableCell>
                                    <TableCell align="right"><b>Saldo Disponible</b></TableCell>
                                    <TableCell align="center"><b>Fecha Asociación</b></TableCell>
                                    <TableCell align="center"><b>Acciones</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {erogaciones.map((e) => {



                                    const rubroInfo = rubrosData.find(r => Number(r.id) === Number(e.rubro));


                                    return (
                                        <TableRow key={e.iderogacionof}>
                                            { }
                                            <TableCell>{getNombreCentroCosto(e.ccosto)}</TableCell>

                                            { }
                                            <TableCell>
                                                {rubroInfo ? rubroInfo.nombre : `Cargando... (${e.rubro})`}
                                            </TableCell>

                                            { }
                                            <TableCell align="right">{formatCurrency(e.valor)}</TableCell>

                                            { }
                                            <TableCell align="right">{rubroInfo ? formatCurrency(rubroInfo.saldo) : 'N/D'}</TableCell>

                                            { }
                                            <TableCell align="center">{e.fecharub}</TableCell>

                                            <TableCell align="center">
                                                <IconButton onClick={() => eliminarErogacion(e.iderogacionof)} color="error">
                                                    <Trash size="20" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                <TableRow>
                                    <TableCell colSpan={2}><b>Total:</b></TableCell>
                                    <TableCell><b>{formatCurrency(totalErogado)}</b></TableCell>
                                    <TableCell colSpan={3} />
                                </TableRow>
                            </TableBody>
                        </Table>
                    </AccordionDetails>
                </Accordion>
            )}

            <Accordion>
                <AccordionSummary expandIcon={<ArrowDown2 size="20" />} sx={{ bgcolor: '#f5f5f5' }}>
                    <Typography variant="h6">Tramitar proyecto</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Controller
                                name="observacionGeneral"
                                control={control}
                                render={({ field }) => (
                                    <TextField
                                        label="Observación General"
                                        fullWidth
                                        multiline
                                        minRows={3}
                                        {...field}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="row" spacing={2} justifyContent="flex-end">
                                {esGestionador && (
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => cambiarEstadoProyecto(2, control._formValues.observacionGeneral)}
                                        startIcon={<ArrowRight size="20" />}
                                        disabled={loading}
                                    >
                                        Enviar a Administrador
                                    </Button>
                                )}
                                {esAdministrador && (
                                    <>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Like1 size="20" />}
                                            onClick={() => cambiarEstadoProyecto(4, control._formValues.observacionGeneral)}
                                            disabled={loading}
                                        >
                                            Aprobar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={() => cambiarEstadoProyecto(7, control._formValues.observacionGeneral)}
                                            startIcon={<CloseCircle size="20" />}
                                            disabled={loading}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color='primary'
                                            onClick={() => cambiarEstadoProyecto(3, control._formValues.observacionGeneral)}
                                            startIcon={<ArrangeHorizontal size="20" />}
                                            disabled={loading}
                                        >
                                            Solicitud de Cambios
                                        </Button>
                                    </>
                                )}
                            </Stack>
                            { }

                            {proyecto.observacionadmin && (
                                <Grid item xs={12} sx={{ mt: 3 }}>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                        Historial de Observaciones:
                                    </Typography>
                                    <Stack spacing={1} sx={{
                                        p: 2,
                                        bgcolor: '#fafafa',
                                        borderRadius: 1,
                                        border: '1px solid #e0e0e0',
                                        maxHeight: '200px',
                                        overflowY: 'auto'
                                    }}>
                                        {proyecto.observacionadmin.split('\n').map((obs, index) => (
                                            <Typography key={index} variant="body2" sx={{
                                                pb: 1,
                                                borderBottom: index !== proyecto.observacionadmin.split('\n').length - 1 ? '1px dashed #ddd' : 'none'
                                            }}>
                                                {obs}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </form>
    );
}
