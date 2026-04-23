import React, { useEffect, useState } from "react";
import axios from "axios";
import { encode as btoa, decode as atob } from "base-64";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import {
    Box,
    Button,
    Modal,
    Typography,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from "@mui/material";

import { Add, CloseCircle, Edit2, Trash } from "iconsax-react";

const API_URL = "http://localhost:8080/api/home-parameters"; 

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 800,
    bgcolor: "background.paper",
    borderRadius: "12px",
    boxShadow: 24,
    p: 4,
};

export default function HomeParameterCRUD() {
    const [lista, setLista] = useState([]);
    const [contenido, setContenido] = useState("");
    const [editId, setEditId] = useState(null);
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        obtenerLista();
    }, []);

    const obtenerLista = async () => {
        try {
            const res = await axios.get(API_URL);
            const data = res.data.map(item => ({
                ...item,
                contenidoTexto: atob(item.contenidoBase64 || "")
            }));
            setLista(data);
        } catch (err) {
            alert("Error al obtener la lista");
        }
    };

    const abrirModal = (item = null) => {
        if (!item && lista.length > 0) {
            alert("Ya existe un registro. Solo puedes editar el existente.");
            return;
        }
        if (item) {
            setContenido(item.contenidoTexto);
            setEditId(item.id);
        } else {
            setContenido("");
            setEditId(null);
        }
        setOpenModal(true);
    };

    const cerrarModal = () => {
        setOpenModal(false);
        setContenido("");
        setEditId(null);
    };

    const guardar = async () => {
        if (!contenido.trim()) {
            alert("El contenido no puede estar vacío");
            return;
        }

        try {
            const payload = { contenidoBase64: btoa(contenido) };
            if (editId) {
                await axios.put(`${API_URL}/${editId}`, payload);
                alert("Actualizado correctamente");
            } else {
                await axios.post(API_URL, payload);
                alert("Guardado correctamente");
            }
            cerrarModal();
            obtenerLista();
        } catch (err) {
            alert("Error al guardar");
        }
    };

    const eliminar = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este registro?")) return;
        try {
            await axios.delete(`${API_URL}/${id}`);
            alert("Eliminado correctamente");
            obtenerLista();
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    return (
        <Box p={3}>
            <Typography variant="h5" mb={2}>Gestión de HomeParameter</Typography>

            <Button
                variant="contained"
                startIcon={<Add size="20" />}
                onClick={() => abrirModal()}
                disabled={lista.length > 0}
                sx={{ mb: 2 }}
            >
                Nuevo
            </Button>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><b>ID</b></TableCell>
                            <TableCell><b>Contenido</b></TableCell>
                            <TableCell><b>Acciones</b></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {lista.map(item => (
                            <TableRow key={item.id}>
                                <TableCell>{item.id}</TableCell>
                                <TableCell>
                                    <div
                                        style={{
                                            maxHeight: "600px",
                                            overflow: "auto"
                                        }}
                                        dangerouslySetInnerHTML={{ __html: item.contenidoTexto }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton color="primary" onClick={() => abrirModal(item)}>
                                        <Edit2 size="20" />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => eliminar(item.id)}>
                                        <Trash size="20" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {lista.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} align="center">
                                    No hay registros
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {}
            <Modal open={openModal} onClose={cerrarModal}>
                <Box sx={modalStyle}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6">
                            {editId ? "Editar" : "Crear"} Contenido
                        </Typography>
                        <IconButton onClick={cerrarModal}>
                            <CloseCircle size="20" />
                        </IconButton>
                    </Box>

                    <ReactQuill
                        theme="snow"
                        value={contenido}
                        onChange={setContenido}
                        style={{ height: "250px", marginBottom: "60px" }}
                    />

                    <Box mt={2} textAlign="right">
                        <Button onClick={cerrarModal} sx={{ mr: 1 }}>Cancelar</Button>
                        <Button variant="contained" onClick={guardar}>
                            {editId ? "Actualizar" : "Guardar"}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </Box>
    );
}
