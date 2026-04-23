import axios from 'axios';
import { useNavigate } from 'react-router';
import React, { useEffect, useState } from 'react';
import { getStorage, setStorage } from 'minimal-shared/utils';
import { Eye, Lock, Unlock, CloseCircle } from 'iconsax-react';

import {
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, Paper, IconButton, TextField,
  MenuItem, Grid, Box, InputLabel, FormControl, Select, Button,
  Snackbar, Alert, CircularProgress
} from '@mui/material';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import SeguimientoFechas from './SeguimientoFechas';
import { API_BASE_URL } from 'src/config/api';

const planes = JSON.parse(getStorage("planesList"));
const unidades = JSON.parse(getStorage("unidadesList"));
const estados = JSON.parse(getStorage("estadosGenList"));
const usuario = JSON.parse(getStorage("user"));
const esGestionador = usuario?.perfil === 'Gestionador';

const GestionProyectosSeguimiento = () => {
  const navigate = useNavigate();
  const [proyectos, setProyectos] = useState([]);
  const [seguimientosList, setSeguimientosList] = useState([]);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('idproyecto');
  const [fechaActiva, setFechaActiva] = useState(true);
  const fechaHoy = new Date();

  const [filtros, setFiltros] = useState({
    nombrepr: '', idplan: '', idproyecto: '',
    unidadejecutora: '', fechacrea: '', estadoSeg: ''
  });
  const [criterios, setCriterios] = useState({ ...filtros });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);


  const [loading, setLoading] = useState(false);


  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    validarFechasSeguimiento();
  }, []);

  useEffect(() => {
    cargarSeguimientosDesdeAPI();
  }, []);

  const cargarSeguimientosDesdeAPI = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/seguimientos`);
      const data = await res.json();
      setSeguimientosList(data);
      validarFechasSeguimiento(data);
    } catch (error) {
      console.error("Error cargando seguimientos desde API:", error);
    } finally {
      setLoading(false);
    }
  };

  const validarFechasSeguimiento = async (seguimientos = []) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fechaseguimiento`);
      const fechas = await response.json();

      const fechaValida = fechas.find(f => {
        const inicio = new Date(f.feciniseg);
        const fin = new Date(f.fecfinseg);
        return f.flag === 1 && fechaHoy >= inicio && fechaHoy <= fin;
      });

      if (!fechaValida && esGestionador) {
        setFechaActiva(false);
      } else {
        setFechaActiva(true);
        cargarProyectosDesdeAPI(seguimientos);
      }
    } catch (error) {
      setFechaActiva(false);
      cargarProyectosDesdeAPI(seguimientos);
      console.error("Error validando fechas de seguimiento:", error);
    }
  };

  const cargarProyectosDesdeAPI = async (seguimientos) => {
    setLoading(true);
    try {
      const resFechas = await fetch(`${API_BASE_URL}/fechaseguimiento`);
      const fechas = await resFechas.json();

      const fechasNormalizadas = fechas.map(f => ({
        id: f.id,
        feciniseg: new Date(f.id.feciniseg),
        fecfinseg: new Date(f.fecfinseg),
        fechainiodi: new Date(f.fechainiodi),
        fechafinodi: new Date(f.fechafinodi),
        flag: f.id.flag || f.flag
      }));

      const fechaActivaObj = fechasNormalizadas.find(f => f.flag === 1);
      const fecha_ini_seg = fechaActivaObj ? new Date(fechaActivaObj.feciniseg) : new Date();
      const fecha_fin_seg = fechaActivaObj ? new Date(fechaActivaObj.fecfinseg) : new Date();

      const estadosF = [5];
      const response = await fetch(`${API_BASE_URL}/proyectos/filtrar-estados`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(estadosF)
      });

      const data = await response.json();
      let data2 = [];

      for (const element of data) {
        if (element.estadopr !== 1) {
          let seguimientosProyecto = [];
          try {
            const resSeg = await fetch(`${API_BASE_URL}/seguimientos/proyecto/${element.idproyecto}`);
            if (!resSeg.ok) throw new Error(`Error obteniendo seguimientos para proyecto ${element.idproyecto}`);
            seguimientosProyecto = await resSeg.json();
          } catch (error) {
            console.error(`Error consultando seguimientos del proyecto ${element.idproyecto}:`, error);
          }

          let estadoSegu = "iniciar seguimiento";
          let idSeg = null;

          const seguimientoActual = seguimientosProyecto.find(item => {
            const fechaItem = new Date(item.fechaseg);
            return fechaItem >= fecha_ini_seg && fechaItem <= fecha_fin_seg;
          });

          if (seguimientoActual) {
            estadoSegu = seguimientoActual.estadoseg === "1" ? "continuar seguimiento" : "seguimiento realizado";
            idSeg = seguimientoActual.idseguimiento;
          }

          const proyecto = {
            idproyecto: element.idproyecto,
            nombrepr: element.nombrepr,
            idplan: element.idplan,
            unidadejecutora: element.unidadejecutora,
            estado: element.estadopr,
            fechacrea: element.fechacrea,
            estadoSeg: estadoSegu,
            idSeg: idSeg,
            ccdirectorpr: element.ccdirectorpr,
            ccresponsablepr: element.ccresponsablepr
          };

          data2.push(proyecto);
        }
      }

      if (esGestionador) {
        data2 = data2.filter(
          p => p.ccdirectorpr === usuario.id || p.ccresponsablepr === usuario.id
        );
      }

      data2.sort((a, b) => a.idproyecto - b.idproyecto);
      setProyectos(data2);
    } catch (error) {
      console.error("Error al cargar proyectos desde la API:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
    setPage(0);
  };

  const aplicarFiltros = () => {
    setCriterios({ ...filtros });
    setPage(0);
  };

  const limpiarFiltros = () => {
    const vacios = { idproyecto: '', nombrepr: '', idplan: '', unidadejecutora: '', estado: '', fechacrea: '' };
    setFiltros(vacios);
    setCriterios(vacios);
    setPage(0);
  };

  const proyectosFiltrados = proyectos.filter(p =>
    (!criterios.idproyecto || String(p.idproyecto).includes(criterios.idproyecto)) &&
    (!criterios.nombrepr || p.nombrepr.toLowerCase().includes(criterios.nombrepr.toLowerCase())) &&
    (!criterios.idplan || String(p.idplan) === String(criterios.idplan)) &&
    (!criterios.unidadejecutora || String(p.unidadejecutora) === String(criterios.unidadejecutora)) &&
    (!criterios.fechacrea ||
      new Date(p.fechacrea).toISOString().split('T')[0] === criterios.fechacrea
    ) &&
    (!criterios.estadoSeg || p.estadoSeg.toLowerCase() === criterios.estadoSeg.toLowerCase())
  );

  const sortComparator = (a, b, key) => {
    if (!a[key]) return 1;
    if (!b[key]) return -1;
    return a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0;
  };

  const sortedProyectos = [...proyectosFiltrados].sort((a, b) =>
    order === 'asc' ? sortComparator(a, b, orderBy) : -sortComparator(a, b, orderBy)
  );

  const renderEstadoSeg = (proyecto) => {
    let color = 'inherit';
    let clickHandler = () => { };

    switch (proyecto.estadoSeg.toLowerCase()) {
      case 'iniciar seguimiento':
        color = 'red';
        clickHandler = () => iniciarSeguimiento(proyecto);
        break;
      case 'continuar seguimiento':
        color = '#EAB308';
        clickHandler = () => continuarSeguimiento(proyecto);
        break;
      case 'seguimiento realizado':
        color = 'green';
        clickHandler = () => seguimientoRealizado(proyecto);
        break;
      default:
        color = 'inherit';
        break;
    }

    return (
      <TableCell>
        <a style={{ color, cursor: 'pointer', textDecoration: 'underline' }} onClick={clickHandler}>
          {proyecto.estadoSeg}
        </a>
      </TableCell>
    );
  };

  const iniciarSeguimiento = async (proyecto) => {
    try {
      const response = await fetch(`${API_BASE_URL}/seguimientos?proy=${encodeURIComponent(proyecto.idproyecto)}`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error(`Error ${response.status}`);
      const data = await response.text();
      

      cargarProyectosDesdeAPI();
    } catch (error) {
      console.error('Error creando seguimiento:', error);
    }
  };

  const continuarSeguimiento = (proyecto) => {
    setStorage("proyectoParaEditar", JSON.stringify(proyecto));
    setStorage("seguimientoTerminado", 2);
    navigate(paths.dashboard.gestion.formularioSeguimiento);
  };

  const seguimientoRealizado = (proyecto) => {
    setStorage("proyectoParaEditar", JSON.stringify(proyecto));
    setStorage("seguimientoTerminado", 1);
    navigate(paths.dashboard.gestion.formularioSeguimiento);
  };

  const cambiarASeguimientoTerminado = async (proyecto) => {
    if (!window.confirm("¿Deseas cambiar el seguimiento a TERMINADO?")) return;

    try {
      const seguimientoRes = await axios.get(`${API_BASE_URL}/seguimientos/${proyecto.idSeg}`);
      const seguimiento = seguimientoRes.data;
      const actualizado = { ...seguimiento, estadoseg: "2" };

      await axios.put(`${API_BASE_URL}/seguimientos/${proyecto.idSeg}`, actualizado);

      setSnackbar({ open: true, message: 'Seguimiento cambiado a TERMINADO', severity: 'success' });

      await cargarSeguimientosDesdeAPI();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al cambiar a TERMINADO', severity: 'error' });
      console.error(error);
    }
  };

  const cambiarAContinuarSeguimiento = async (proyecto) => {
    if (!window.confirm("¿Deseas cambiar el seguimiento a CONTINUAR?")) return;

    try {
      const seguimientoRes = await axios.get(`${API_BASE_URL}/seguimientos/${proyecto.idSeg}`);
      const seguimiento = seguimientoRes.data;
      const actualizado = { ...seguimiento, estadoseg: "1" };

      await axios.put(`${API_BASE_URL}/seguimientos/${proyecto.idSeg}`, actualizado);

      setSnackbar({ open: true, message: 'Seguimiento cambiado a CONTINUAR', severity: 'success' });

      await cargarSeguimientosDesdeAPI();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al cambiar a CONTINUAR', severity: 'error' });
      console.error(error);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Seguimiento de proyectos"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Seguimiento de proyectos' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {!fechaActiva && esGestionador ? (
        <Paper sx={{ p: 3, textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
          No hay fecha activa para hacer seguimientos
        </Paper>
      ) : (
        <Paper sx={{ width: '100%', p: 2 }}>
          { }
          <Paper sx={{ p: 2, mb: 2 }}>
            <Grid container spacing={2}>
              { }
              <Grid item xs={12} sm={2}>
                <TextField
                  label="ID Proyecto"
                  name="idproyecto"
                  value={filtros.idproyecto}
                  onChange={handleFilterChange}
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  label="Nombre"
                  name="nombrepr"
                  value={filtros.nombrepr}
                  onChange={handleFilterChange}
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={2}>
                <Select
                  name="idplan"
                  value={filtros.idplan}
                  onChange={handleFilterChange}
                  size="small"
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">Todos los planes</MenuItem>
                  {planes.map((p) => (
                    <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Select
                  name="unidadejecutora"
                  value={filtros.unidadejecutora}
                  onChange={handleFilterChange}
                  size="small"
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">Todas las unidades</MenuItem>
                  {unidades.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12} sm={2}>
                <Select
                  name="estadoSeg"
                  value={filtros.estadoSeg || ''}
                  onChange={handleFilterChange}
                  size="small"
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">Todos los seguimientos</MenuItem>
                  <MenuItem value="iniciar seguimiento">Iniciar seguimiento</MenuItem>
                  <MenuItem value="continuar seguimiento">Continuar seguimiento</MenuItem>
                  <MenuItem value="seguimiento realizado">Seguimiento realizado</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} sm={2}>
                <TextField
                  label="Fecha creación"
                  name="fechacrea"
                  value={filtros.fechacrea}
                  onChange={handleFilterChange}
                  size="small"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <Box display="flex" gap={1}>
                  <Button variant="contained" color="primary" onClick={aplicarFiltros} fullWidth>
                    Filtrar
                  </Button>
                  <Button variant="outlined" onClick={limpiarFiltros} fullWidth>
                    Limpiar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {["ID", "Nombre", "Plan", "Unidad Ejecutora", "Estado", "Fecha de Creación", "Detalle", "Seguimiento"]
                    .map(label => (
                      <TableCell key={label}>{label}</TableCell>
                    ))}
                  {!esGestionador && <TableCell>Acceso</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={esGestionador ? 8 : 9} align="center">
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : sortedProyectos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((proyecto) => (
                  <TableRow key={proyecto.idproyecto} hover>
                    <TableCell>{proyecto.idproyecto}</TableCell>
                    <TableCell>{proyecto.nombrepr}</TableCell>
                    <TableCell>{planes.find(p => String(p.id) === String(proyecto.idplan))?.name || 'N/A'}</TableCell>
                    <TableCell>{unidades.find(u => String(u.id) === String(proyecto.unidadejecutora))?.name || 'N/A'}</TableCell>
                    <TableCell>{estados.find(e => String(e.id) === String(proyecto.estado))?.name || 'N/A'}</TableCell>
                    <TableCell>{new Date(proyecto.fechacrea).toLocaleDateString('es-CO')}</TableCell>
                    <TableCell>
                      <IconButton color="secondary" onClick={() => {
                        setStorage("proyectoParaEditar", JSON.stringify(proyecto));
                        navigate(paths.dashboard.gestion.detalleSeguimiento);
                      }}>
                        <Eye size={20} variant="Bold" />
                      </IconButton>
                    </TableCell>
                    {renderEstadoSeg(proyecto)}
                    {!esGestionador && (
                      <TableCell>
                        {proyecto.estadoSeg.toLowerCase() === 'iniciar seguimiento' && (
                          <IconButton disabled>
                            <CloseCircle size={20} variant="Bold" color="gray" />
                          </IconButton>
                        )}
                        {proyecto.estadoSeg.toLowerCase() === 'continuar seguimiento' && (
                          <IconButton color="gray" onClick={() => cambiarASeguimientoTerminado(proyecto)}>
                            <Lock size={20} variant="Bold" />
                          </IconButton>
                        )}
                        {proyecto.estadoSeg.toLowerCase() === 'seguimiento realizado' && (
                          <IconButton color="gray" onClick={() => cambiarAContinuarSeguimiento(proyecto)}>
                            <Unlock size={20} variant="Bold" />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                {!loading && proyectosFiltrados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={esGestionador ? 8 : 9} align="center">No se encontraron proyectos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={sortedProyectos.length}
              page={page}
              onPageChange={(event, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(event) => {
                setRowsPerPage(parseInt(event.target.value, 10));
                setPage(0);
              }}
              labelRowsPerPage="Filas por página"
            />
          </TableContainer>
        </Paper>
      )}

      {!esGestionador && <SeguimientoFechas />}

      { }
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardContent>
  );
};

export default GestionProyectosSeguimiento;
