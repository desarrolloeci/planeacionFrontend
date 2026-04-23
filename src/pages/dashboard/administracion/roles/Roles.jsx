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
} from "@mui/material";
import { API_BASE_URL } from "src/config/api";

const API_ROLE = `${API_BASE_URL}/role`;

const Roles = () => {

  const dummyRoles = [
    {
      id: 1,
      code_rol: "ADM",
      description: "Acceso completo",
      created_user_id: 1,
      created_at: "2025-07-30",
      updated_user_id: 1,
      updated_at: "2025-07-30",
    },
    {
      id: 2,
      code_rol: "GST",
      description: "Gestión de recursos",
      created_user_id: 1,
      created_at: "2025-07-30",
      updated_user_id: 1,
      updated_at: "2025-07-30",
    },
  ];


  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [rolActual, setRolActual] = useState({
    id: null,
    code_rol: "",
    description: "",
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  
  const [filters, setFilters] = useState({ code_rol: "", description: "" });

  
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);


  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_ROLE);
      if (Array.isArray(res.data) && res.data.length > 0) {
        setRoles(res.data);
      } else {
        console.warn("API de Roles vacía o inválida, usando dummy");

      }
    } catch (error) {
      console.error("Error al cargar roles, usando dummy:", error);

    }
    setLoading(false);
  };


  const handleOpenDialog = (rol = null) => {
    if (rol) {
      setEditMode(true);
      setRolActual(rol);
    } else {
      setEditMode(false);
      setRolActual({ code_rol: "", description: "" });
    }
    setOpenDialog(true);
  };

  const handleSaveRol = async () => {
    
    const timestamp = new Date().toISOString();

    
    const rolToSave = {
      ...rolActual,
      created_user_id: editMode ? rolActual.created_user_id : 0,
      created_at: editMode ? rolActual.created_at : timestamp,
      updated_user_id: 0,
      updated_at: timestamp,
    };
    try {
      if (editMode) {
        await axios.put(`${API_ROLE}/${rolActual.id}`, rolToSave);
        showSnackbar("Rol actualizado correctamente");
      } else {
        const res = await axios.post(API_ROLE, rolToSave);
        const newId = res.data?.id || Math.max(...roles.map((r) => r.id)) + 1;
        setRoles([...roles, { ...rolToSave, id: newId }]);
        showSnackbar("Rol creado correctamente");
      }
      fetchRoles();
      setOpenDialog(false);
    } catch (error) {
      console.error("Error al guardar rol, usando dummy:", error);
      if (editMode) {
        const updated = roles.map((r) => (r.id === rolActual.id ? { ...rolActual } : r));
        setRoles(updated);
      } else {
        const newId = roles.length ? Math.max(...roles.map((r) => r.id)) + 1 : 1;
        setRoles([...roles, { ...rolActual, id: newId }]);
      }
      showSnackbar("Rol gestionado en modo offline (dummy)");
      setOpenDialog(false);
    }
  };


  const handleDeleteRol = async (id) => {
    if (window.confirm("¿Está seguro de eliminar este rol?")) {
      try {
        await axios.delete(`${API_ROLE}/${id}`);
        showSnackbar("Rol eliminado correctamente");
        fetchRoles();
      } catch (error) {
        console.error("Error al eliminar rol, usando dummy:", error);
        setRoles(roles.filter((r) => r.id !== id));
        showSnackbar("Rol eliminado en modo offline (dummy)");
      }
    }
  };


  const handleFilterChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
    setPage(0);
  };

  const filteredRoles = Array.isArray(roles)
    ? roles.filter(
      (rol) =>
        rol.code_rol.toLowerCase().includes(filters.code_rol.toLowerCase()) &&
        rol.description.toLowerCase().includes(filters.description.toLowerCase())
    )
    : [];

  
  const paginatedRoles = filteredRoles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };


  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box sx={{ p: 3, mx: 10, backgroundColor: "#fff", borderRadius: 2, boxShadow: 1 }}>
      <h2>Gestión de Roles</h2>

      {}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="200px">
          <CircularProgress />
        </Box>
      ) : (
        <>
          {}
          <Box display="flex" justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add size={18} />}
              onClick={() => handleOpenDialog()}
              sx={{ mb: 2 }}
            >
              Nuevo Rol
            </Button>
          </Box>

          {}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Filtrar por Código"
                fullWidth
                value={filters.code_rol}
                onChange={(e) => handleFilterChange("code_rol", e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Filtrar por Descripción"
                fullWidth
                value={filters.description}
                onChange={(e) => handleFilterChange("description", e.target.value)}
              />
            </Grid>
          </Grid>

          {}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Código</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRoles.length > 0 ? (
                paginatedRoles.map((rol) => (
                  <TableRow key={rol.id}>
                    <TableCell>{rol.code_rol}</TableCell>
                    <TableCell>{rol.description}</TableCell>
                    <TableCell>
                      <IconButton color="success" onClick={() => handleOpenDialog(rol)}>
                        <Edit2 size={18} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteRol(rol.id)}>
                        <Trash size={18} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No hay roles que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {}
          <TablePagination
            component="div"
            count={filteredRoles.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </>
      )}

      {}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{editMode ? "Editar Rol" : "Nuevo Rol"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Código del Rol"
            fullWidth
            margin="normal"
            value={rolActual.code_rol}
            onChange={(e) => setRolActual({ ...rolActual, code_rol: e.target.value })}
            required
            error={!rolActual.code_rol.trim()}
            helperText={!rolActual.code_rol.trim() ? "Este campo es obligatorio" : ""}
          />
          <TextField
            label="Descripción"
            fullWidth
            margin="normal"
            value={rolActual.description}
            onChange={(e) => setRolActual({ ...rolActual, description: e.target.value })}
            required
            error={!rolActual.description.trim()}
            helperText={!rolActual.description.trim() ? "Este campo es obligatorio" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleSaveRol}
            variant="contained"
            color="primary"
            disabled={!rolActual.code_rol.trim() || !rolActual.description.trim()} 
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {}
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

export default Roles;
