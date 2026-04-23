import axios from "axios";
import { Add, Edit2, Trash } from "iconsax-react";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  CircularProgress,
  TablePagination,
  Grid,
  MenuItem,
} from "@mui/material";
import { API_BASE_URL } from "src/config/api";

const API_PROFILE = `${API_BASE_URL}/profile`;
const API_USER = `${API_BASE_URL}/user`;

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [usuarioActual, setUsuarioActual] = useState({
    mail: "",
    name: "",
    profileId: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    updatedUserId: 0,
    createdUserId: 0,
  });
  const [errors, setErrors] = useState({ mail: "", name: "", profileId: "" });
  const [filters, setFilters] = useState({ mail: "", name: "", profileId: "" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    fetchUsuarios();
    fetchPerfiles();
  }, []);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_USER);
      setUsuarios(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar usuarios, usando dummy:", error);
    }
    setLoading(false);
  };

  const fetchPerfiles = async () => {
    try {
      const res = await axios.get(API_PROFILE);
      setPerfiles(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error al cargar perfiles, usando dummy:", error);
    }
  };

  const handleOpenDialog = (usuario = null) => {
    if (usuario) {
      setEditMode(true);
      setUsuarioActual(usuario);
    } else {
      setEditMode(false);
      setUsuarioActual({
        mail: "",
        name: "",
        profileId: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        updatedUserId: 0,
        createdUserId: 0,
      });
    }
    setErrors({ mail: "", name: "", profileId: "" });
    setOpenDialog(true);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    let valid = true;
    let newErrors = { mail: "", name: "", profileId: "" };

    if (!usuarioActual.mail || !validateEmail(usuarioActual.mail)) {
      newErrors.mail = "Correo válido requerido";
      valid = false;
    }
    if (!usuarioActual.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      valid = false;
    }
    if (!usuarioActual.profileId) {
      newErrors.profileId = "Debe seleccionar un perfil";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSaveUsuario = async () => {
    if (!validateForm()) return;

    const payload = {
      ...usuarioActual,
      updatedAt: new Date().toISOString(),
      createdAt: editMode ? usuarioActual.createdAt : new Date().toISOString(),
    };

    if (!editMode) delete payload.id; 

    try {
      if (editMode) {
        await axios.put(`${API_USER}/${usuarioActual.id}`, payload);
        showSnackbar("Usuario actualizado correctamente");
      } else {
        const res = await axios.post(API_USER, payload);
        const newUser = res.data;
        setUsuarios([...usuarios, newUser]);
        showSnackbar("Usuario creado correctamente");
      }
      fetchUsuarios();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error al guardar usuario:", error);
      
      if (editMode) {
        setUsuarios(usuarios.map(u => u.id === usuarioActual.id ? { ...payload, id: usuarioActual.id } : u));
      } else {
        const newId = usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
        setUsuarios([...usuarios, { ...payload, id: newId }]);
      }
      showSnackbar("Usuario gestionado en modo offline (dummy)");
      setOpenDialog(false);
    }
  };

  const isFormInvalid = () =>
    !usuarioActual.mail ||
    !validateEmail(usuarioActual.mail) ||
    !usuarioActual.name.trim() ||
    !usuarioActual.profileId;

  const handleDeleteUsuario = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este usuario?")) {
      try {
        await axios.delete(`${API_USER}/${id}`);
        showSnackbar("Usuario eliminado correctamente");
        fetchUsuarios();
      } catch (error) {
        console.error("Error al eliminar usuario, usando dummy:", error);
        setUsuarios(usuarios.filter((u) => u.id !== id));
        showSnackbar("Usuario eliminado en modo offline (dummy)");
      }
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(0);
  };

  const filteredUsuarios = usuarios.filter(
    (u) =>
      u.mail.toLowerCase().includes(filters.mail.toLowerCase()) &&
      u.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      (filters.profileId === "" || u.profileId === parseInt(filters.profileId))
  );

  const paginatedUsuarios = filteredUsuarios.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getProfileName = (id) => {
    const profile = perfiles.find((p) => p.id === id);
    return profile ? profile.name : "Sin perfil";
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box p={3}>
      <h2>Gestión de Usuarios</h2>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add size={18} />}
              onClick={() => handleOpenDialog()}
            >
              Nuevo Usuario
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Filtrar por Correo"
                fullWidth
                value={filters.mail}
                onChange={(e) => handleFilterChange("mail", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                label="Filtrar por Nombre"
                fullWidth
                value={filters.name}
                onChange={(e) => handleFilterChange("name", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                label="Filtrar por Perfil"
                fullWidth
                value={filters.profileId}
                onChange={(e) => handleFilterChange("profileId", e.target.value)}
              >
                <MenuItem value="">Todos</MenuItem>
                {perfiles.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Correo</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Perfil</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsuarios.length > 0 ? (
                paginatedUsuarios.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.mail}</TableCell>
                    <TableCell>{u.name}</TableCell>
                    <TableCell>{getProfileName(u.profileId)}</TableCell>
                    <TableCell>
                      <IconButton color="success" onClick={() => handleOpenDialog(u)}>
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteUsuario(u.id)}>
                        <Trash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No hay usuarios que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredUsuarios.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{editMode ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Correo"
            fullWidth
            margin="normal"
            value={usuarioActual.mail}
            error={!!errors.mail}
            helperText={errors.mail}
            onChange={(e) => setUsuarioActual({ ...usuarioActual, mail: e.target.value })}
          />
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={usuarioActual.name}
            error={!!errors.name}
            helperText={errors.name}
            onChange={(e) => setUsuarioActual({ ...usuarioActual, name: e.target.value })}
          />
          <TextField
            select
            label="Perfil"
            fullWidth
            margin="normal"
            value={usuarioActual.profileId}
            error={!!errors.profileId}
            helperText={errors.profileId}
            onChange={(e) => setUsuarioActual({ ...usuarioActual, profileId: parseInt(e.target.value) })}
          >
            {perfiles.map((p) => (
              <MenuItem key={p.id} value={p.id}>
                {p.name}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button onClick={handleSaveUsuario} variant="contained" color="primary" disabled={isFormInvalid()}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Usuarios;
