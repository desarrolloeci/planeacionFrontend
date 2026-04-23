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
  Checkbox,
  Snackbar,
  Alert,
  CircularProgress,
  TablePagination,
  Grid,
} from "@mui/material";
import { API_BASE_URL } from "src/config/api";

const API_ROLE = `${API_BASE_URL}/role`;
const API_PROFILE = `${API_BASE_URL}/profile`;
const API_PROFILE_ROLE = `${API_BASE_URL}/profile-role`;

const Perfiles = () => {
  const dummyRoles = [
    { id: 1, name: "Administrador" },
    { id: 2, name: "Gestor" },
    { id: 3, name: "Usuario" },
  ];

  const dummyPerfiles = [
    { id: 1, name: "Perfil Admin", description: "Acceso completo", code_profile: "ADM" },
    { id: 2, name: "Perfil Gestor", description: "Acceso a gestión", code_profile: "GST" },
  ];

  const [perfiles, setPerfiles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [perfilRoles, setPerfilRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [perfilActual, setPerfilActual] = useState({ id: null, name: "", description: "", code_profile: "" });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [filters, setFilters] = useState({ name: "", description: "", code_profile: "", roles: "" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    await fetchRoles();
    await fetchPerfiles();
    setLoading(false);
  };

  const fetchRoles = async () => {
    try {
      const res = await axios.get(API_ROLE);

      setRoles(Array.isArray(res.data) && res.data.length > 0 ? res.data : dummyRoles);
    } catch {
      setRoles(dummyRoles);
    }
  };

  const fetchPerfiles = async () => {
    try {
      const res = await axios.get(API_PROFILE);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setPerfiles(res.data);
        const rolesPorPerfil = {};
        for (let perfil of res.data) {
          try {
            const resRoles = await axios.get(`${API_PROFILE_ROLE}/profile/${perfil.id}`);
            rolesPorPerfil[perfil.id] = Array.isArray(resRoles.data) ? resRoles.data.map((r) => r.roleId) : [];
          } catch {
            rolesPorPerfil[perfil.id] = [];
          }
        }
        setPerfilRoles(rolesPorPerfil);
      } else {
        console.log("error")
      }
    } catch {
      console.log("error")
    }
  };

  const handleOpenDialog = (perfil = null) => {
    if (perfil) {
      setEditMode(true);
      setPerfilActual(perfil);
      setSelectedRoles(perfilRoles[perfil.id] || []);
    } else {
      setEditMode(false);
      setPerfilActual({ id: null, name: "", description: "", code_profile: "" });
      setSelectedRoles([]);
    }
    if (roles.length === 0) fetchRoles();
    setOpenDialog(true);
  };

  const handleSavePerfil = async () => {
    const timestamp = new Date().toISOString();
    const perfilToSave = {
      ...perfilActual,
      created_user_id: editMode ? perfilActual.created_user_id : 0,
      created_at: editMode ? perfilActual.created_at : timestamp,
      updated_user_id: 0,
      updated_at: timestamp,
    };

    try {
      let profileId;
      if (editMode) {

        await axios.put(`${API_PROFILE}/${perfilActual.id}`, perfilToSave);
        profileId = perfilActual.id;
        showSnackbar("Perfil actualizado correctamente");
      } else {

        const res = await axios.post(API_PROFILE, perfilToSave);
        profileId = res.data?.id || (perfiles.length ? Math.max(...perfiles.map((p) => p.id)) + 1 : 1);
        showSnackbar("Perfil creado correctamente");
      }


      await syncRoles(profileId);

      fetchPerfiles();
      setOpenDialog(false);
    } catch {

      let profileId = editMode ? perfilToSave.id : (perfiles.length ? Math.max(...perfiles.map((p) => p.id)) + 1 : 1);
      if (editMode) {
        const updated = perfiles.map((p) => (p.id === perfilToSave.id ? { ...perfilToSave } : p));
        setPerfiles(updated);
      } else {
        setPerfiles([...perfiles, { ...perfilToSave, id: profileId }]);
      }
      setPerfilRoles((prev) => ({ ...prev, [profileId]: selectedRoles }));
      showSnackbar("Perfil gestionado en modo offline (dummy) con roles");
      setOpenDialog(false);
    }
  };

  const syncRoles = async (profileId) => {
    try {

      await axios.delete(`${API_PROFILE_ROLE}/profile/${profileId}`);

      const timestamp = new Date().toISOString();

      for (let roleId of selectedRoles) {
        await axios.post(API_PROFILE_ROLE, {
          profileId: profileId,
          roleId: roleId,
          createdUserId: 0,
          createdAt: timestamp,
          updatedUserId: 0,
          updatedAt: timestamp
        });
      }
    } catch {
      console.log("error")
    }
  };

  const handleDeletePerfil = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este perfil?")) {
      try {
        await axios.delete(`${API_PROFILE}/${id}`);
        showSnackbar("Perfil eliminado correctamente");
        fetchPerfiles();
      } catch {
        fetchPerfiles();
      }
    }
  };

  const handleRoleChange = (roleId) => {
    setSelectedRoles((prev) => (prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]));
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(0);
  };

  const filteredPerfiles = perfiles.filter((perfil) => {
    const rolesTexto = (perfilRoles[perfil.id] || [])
      .map((rId) => roles.find((r) => r.id === rId)?.name || "")
      .join(" ")
      .toLowerCase();

    return (
      perfil.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      perfil.description.toLowerCase().includes(filters.description.toLowerCase()) &&
      perfil.code_profile.toLowerCase().includes(filters.code_profile.toLowerCase()) &&
      rolesTexto.includes(filters.roles.toLowerCase())
    );
  });

  const paginatedPerfiles = filteredPerfiles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box p={3}>
      <h2>Gestión de Perfiles</h2>

      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button variant="contained" color="primary" startIcon={<Add size={18} />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
              Nuevo Perfil
            </Button>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <TextField label="Filtrar por Nombre" fullWidth value={filters.name} onChange={(e) => handleFilterChange("name", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Filtrar por Descripción" fullWidth value={filters.description} onChange={(e) => handleFilterChange("description", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Filtrar por Código" fullWidth value={filters.code_profile} onChange={(e) => handleFilterChange("code_profile", e.target.value)} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Filtrar por Roles" fullWidth value={filters.roles} onChange={(e) => handleFilterChange("roles", e.target.value)} />
            </Grid>
          </Grid>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Roles</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPerfiles.length > 0 ? (
                paginatedPerfiles.map((perfil) => (
                  <TableRow key={perfil.id}>
                    <TableCell>{perfil.name}</TableCell>
                    <TableCell>{perfil.description}</TableCell>
                    <TableCell>{perfil.code_profile}</TableCell>
                    <TableCell>
                      {(perfilRoles[perfil.id] || []).map((roleId) => roles.find((r) => r.id === roleId)?.description).join(", ")}
                    </TableCell>
                    <TableCell>
                      <IconButton color="success" onClick={() => handleOpenDialog(perfil)}>
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeletePerfil(perfil.id)}>
                        <Trash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No hay perfiles que coincidan con los filtros</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={filteredPerfiles.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{editMode ? "Editar Perfil" : "Nuevo Perfil"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={perfilActual.name}
            required
            error={!perfilActual.name.trim()}
            helperText={!perfilActual.name.trim() ? "El nombre es obligatorio" : ""}
            onChange={(e) => setPerfilActual({ ...perfilActual, name: e.target.value })}
          />
          <TextField
            label="Descripción"
            fullWidth
            margin="normal"
            value={perfilActual.description}
            required
            error={!perfilActual.description.trim()}
            helperText={!perfilActual.description.trim() ? "La descripción es obligatoria" : ""}
            onChange={(e) => setPerfilActual({ ...perfilActual, description: e.target.value })}
          />
          <TextField
            label="Código de Perfil"
            fullWidth
            margin="normal"
            value={perfilActual.code_profile}
            required
            error={!perfilActual.code_profile.trim()}
            helperText={!perfilActual.code_profile.trim() ? "El código es obligatorio" : ""}
            onChange={(e) => setPerfilActual({ ...perfilActual, code_profile: e.target.value })}
          />
          <Box mt={2}>
            <h4>Asignar Roles</h4>
            {roles.length > 0 ? (
              roles.map((role) => (
                <Box key={role.id} display="flex" alignItems="center">
                  <Checkbox checked={selectedRoles.includes(role.id)} onChange={() => handleRoleChange(role.id)} />
                  {role.description}
                </Box>
              ))
            ) : (
              <p>No hay roles disponibles</p>
            )}
            {selectedRoles.length === 0 && (
              <p style={{ color: "red", fontSize: "0.8rem" }}>Debe seleccionar al menos un rol</p>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSavePerfil}
            variant="contained"
            color="primary"
            disabled={
              !perfilActual.name.trim() ||
              !perfilActual.description.trim() ||
              !perfilActual.code_profile.trim() ||
              selectedRoles.length === 0
            }
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Perfiles;
