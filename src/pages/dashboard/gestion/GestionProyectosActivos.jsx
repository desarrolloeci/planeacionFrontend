import axios from 'axios';
import { Eye, Edit } from 'iconsax-react';
import { useNavigate } from 'react-router';
import React, { useEffect, useState } from 'react';
import { getStorage, setStorage } from 'minimal-shared/utils';

import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Paper, IconButton, TextField,
  MenuItem, Grid, Box, InputLabel, FormControl, Select, Button,
  TableSortLabel
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { API_BASE_URL } from 'src/config/api';

const planes = JSON.parse(getStorage("planesList"));
const unidades = JSON.parse(getStorage("unidadesList"));
const estados = JSON.parse(getStorage("estadosGenList"));
const usuario = JSON.parse(getStorage("user"));
const esGestionador = usuario?.perfil === 'Gestionador';

const GestionProyectosActivos = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);

  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('idproyecto');

  const [filtros, setFiltros] = useState({
    nombrepr: '',
    idplan: '',
    idproyecto: '',
    unidadejecutora: '',
    estado: '',
    fechacrea: ''
  });
  const [criterios, setCriterios] = useState({ ...filtros });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    cargarProyectosDesdeAPI();
  }, []);

  const aplicarFiltros = () => {
    setCriterios({ ...filtros });
    setPage(0);
  };

  const limpiarFiltros = () => {
    const filtrosVacios = {
      idproyecto: '',
      nombrepr: '',
      idplan: '',
      unidadejecutora: '',
      estado: '',
      fechacrea: ''
    };
    setFiltros(filtrosVacios);
    setCriterios(filtrosVacios);
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
    setPage(0);
  };

  const proyectosFiltrados = proyectos.filter(p =>
    (criterios.nombrepr === '' || p.nombrepr.toLowerCase().includes(criterios.nombrepr.toLowerCase())) &&
    (criterios.idplan === '' || String(p.idplan) === String(criterios.idplan)) &&
    (criterios.idproyecto === '' || String(p.idproyecto) === String(criterios.idproyecto)) &&
    (criterios.unidadejecutora === '' || String(p.unidadejecutora) === String(criterios.unidadejecutora)) &&
    (criterios.estado === '' || p.estadopr === Number(criterios.estado)) &&
    (criterios.fechacrea === '' ||
      new Date(p.fechacrea).toISOString().split('T')[0] === criterios.fechacrea
    )
  );

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEditar = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/proyectos/${id}`);
      const proyecto = response.data;
      setStorage("proyectoParaEditar", JSON.stringify(proyecto));
      navigate(paths.dashboard.gestion.editarProyecto);
    } catch (error) {
      console.error("Error al cargar proyecto:", error);
    }
  };

  const handleDetalle = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/proyectos/${id}`);
      const proyecto = response.data;
      setStorage("proyectoParaEditar", JSON.stringify(proyecto));
      navigate(paths.dashboard.gestion.detalleProyecto);
    } catch (error) {
      console.error("Error al cargar proyecto:", error);
    }
  };

  const cargarProyectosDesdeAPI = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/proyectos`);
      const data = await response.json();


      let dataActivos = data.filter(p =>
        [1, 2, 3, 4, 5, 45].includes(p.estadopr)
      );




      dataActivos.sort((a, b) => a.idproyecto - b.idproyecto);
      setProyectos(dataActivos);
    } catch (error) {
      console.error("Error al cargar proyectos desde la API:", error);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortComparator = (a, b, orderBy2) => {
    if (!a[orderBy2]) return 1;
    if (!b[orderBy2]) return -1;
    if (a[orderBy2] < b[orderBy2]) return -1;
    if (a[orderBy2] > b[orderBy2]) return 1;
    return 0;
  };

  const sortedProyectos = [...proyectosFiltrados].sort((a, b) =>
    order === 'asc'
      ? sortComparator(a, b, orderBy)
      : -sortComparator(a, b, orderBy)
  );

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Proyecto activos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Proyectos Activos' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.gestion.nuevoProyecto}
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Nuevo proyecto
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Paper sx={{ width: '100%', p: 2 }}>
        { }
        <Box sx={{ mb: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Id"
                name="idproyecto"
                value={filtros.idproyecto}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombrepr"
                value={filtros.nombrepr}
                onChange={handleFilterChange}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Plan</InputLabel>
                <Select
                  name="idplan"
                  value={filtros.idplan}
                  onChange={handleFilterChange}
                  label="Plan"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {planes.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>{plan.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Unidad Ejecutora</InputLabel>
                <Select
                  name="unidadejecutora"
                  value={filtros.unidadejecutora}
                  onChange={handleFilterChange}
                  label="Unidad Ejecutora"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {unidades.map((unidad) => (
                    <MenuItem key={unidad.id} value={unidad.id}>{unidad.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  name="estado"
                  value={filtros.estado}
                  onChange={handleFilterChange}
                  label="Estado"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {estados.map((estado) => (
                    <MenuItem key={estado.id} value={estado.id}>{estado.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Fecha de Creación"
                name="fechacrea"
                type="date"
                value={filtros.fechacrea}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={3} alignSelf="flex-end">
              <Button fullWidth variant="contained" color="primary" onClick={aplicarFiltros}>
                Aplicar Filtros
              </Button>
            </Grid>
            <Grid item xs={12} md={3} alignSelf="flex-end">
              <Button fullWidth variant="outlined" color="secondary" onClick={limpiarFiltros}>
                Limpiar Filtros
              </Button>
            </Grid>
          </Grid>
        </Box>

        { }
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {[
                  { id: 'id', label: 'ID' },
                  { id: 'nombrepr', label: 'Nombre' },
                  { id: 'idplan', label: 'Plan' },
                  { id: 'unidadejecutora', label: 'Unidad Ejecutora' },
                  { id: 'estado', label: 'Estado' },
                  { id: 'fechacrea', label: 'Fecha de Creación' },
                  { id: 'acciones', label: 'Detalle', sortable: false },
                  { id: 'acciones', label: 'Editar', sortable: false }
                ].map((headCell) => (
                  <TableCell key={headCell.id}>
                    {headCell.sortable === false ? (
                      headCell.label
                    ) : (
                      <TableSortLabel
                        active={orderBy === headCell.id}
                        direction={orderBy === headCell.id ? order : 'asc'}
                        onClick={() => handleRequestSort(headCell.id)}
                      >
                        {headCell.label}
                      </TableSortLabel>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedProyectos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((proyecto) => {

                  const estadoNombre = estados.find(
                    (e) => String(e.id) === String(proyecto.estadopr)
                  )?.name;


                  const noEditable =
                    esGestionador && estadoNombre === 'Enviar a la ODI' || esGestionador && estadoNombre === 'En Ejecución';

                  return (
                    <TableRow key={proyecto.idproyecto} hover>
                      <TableCell>{proyecto.idproyecto}</TableCell>
                      <TableCell>{proyecto.nombrepr}</TableCell>
                      <TableCell>
                        {planes.find(p => String(p.id) === String(proyecto.idplan))?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {unidades.find(p => String(p.id) === String(proyecto.unidadejecutora))?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{estadoNombre || 'N/A'}</TableCell>
                      <TableCell>{formatFecha(proyecto.fechacrea)}</TableCell>

                      { }
                      <TableCell>
                        <IconButton
                          color="secondary"
                          onClick={() => handleDetalle(proyecto.idproyecto)}
                        >
                          <Eye size={20} variant="Bold" />
                        </IconButton>
                      </TableCell>

                      { }
                      <TableCell>
                        <IconButton
                          color="success"
                          disabled={noEditable}
                          onClick={() => handleEditar(proyecto.idproyecto)}
                        >
                          <Edit size={20} variant="Bold" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {proyectosFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron proyectos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={proyectosFiltrados.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </DashboardContent>
  );
};

export default GestionProyectosActivos;
