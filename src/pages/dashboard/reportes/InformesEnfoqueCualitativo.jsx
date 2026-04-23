import { useState, useEffect } from "react";
import {
    Grid,
    Typography,
    Select,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Paper,
    Stack,
    CircularProgress,
    TextField,
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { API_BASE_URL } from "src/config/api";
import { DocumentDownload, ClipboardText, Calendar } from "iconsax-react";
import { toast } from "src/components/snackbar";
import { getStorage } from "minimal-shared/utils";

export default function ReporteCualitativo() {
    const [filtros, setFiltros] = useState({
        fechaInicio: "",
        fechaFin: "",
        idPlan: "",
        idEje: "",
        idEstadoProyecto: "",
        idEstadoEjecucion: "",
        idUnidad: "",
        idProyecto: "",
    });

    const [listas, setListas] = useState({
        planesList: [],
        ejesList: [],
        unidadesList: [],
        estadosGenList: [],
        estadoSegList: [],
    });

    const [proyectos, setProyectos] = useState([]);
    const [loadingReporte, setLoadingReporte] = useState(false);
    const [loadingProyectos, setLoadingProyectos] = useState(false);


    useEffect(() => {
        setListas({
            planesList: JSON.parse(getStorage("planesList") || "[]"),
            ejesList: JSON.parse(getStorage("ejesList") || "[]"),
            unidadesList: JSON.parse(getStorage("unidadesList") || "[]"),
            estadosGenList: JSON.parse(getStorage("estadosGenList") || "[]"),
            estadoSegList: JSON.parse(getStorage("estadoSegList") || "[]"),
        });
    }, []);


    useEffect(() => {
        const fetchProyectos = async () => {
            try {
                setLoadingProyectos(true);
                const res = await fetch(`${API_BASE_URL}/proyectos`);
                if (!res.ok) throw new Error("Error al obtener proyectos");
                const data = await res.json();
                setProyectos(data);
            } catch (error) {
                console.error(error);
                toast.error("No se pudieron cargar los proyectos");
            } finally {
                setLoadingProyectos(false);
            }
        };
        fetchProyectos();
    }, []);


    const generarReporte = async (tipo) => {
        try {
            setLoadingReporte(true);
            const url =
                tipo === "planeacion"
                    ? `${API_BASE_URL}/reportes/proyectos`
                    : `${API_BASE_URL}/reportes/avance`;

            const params = new URLSearchParams();
            Object.entries(filtros).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });

            const response = await fetch(`${url}?${params.toString()}`, {
                method: "GET",
                headers: { Accept: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
            });

            if (!response.ok) throw new Error("Error al generar el reporte");

            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download =
                tipo === "planeacion"
                    ? "informe_planeacion.docx"
                    : "informe_avance.docx";
            link.click();
        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error generando el reporte");
        } finally {
            setLoadingReporte(false);
        }
    };

    const proyectosFiltrados = filtros.idEstadoProyecto
        ? proyectos.filter(
            (p) => String(p.estadopr) === String(filtros.idEstadoProyecto)
        )
        : proyectos;

    return (
        <Paper
            elevation={3}
            sx={{
                padding: 3,
                borderRadius: 3,
                maxWidth: 900,
                margin: "auto",
                marginTop: 4,
            }}
        >
            <Typography variant="h5" sx={{ fontWeight: "bold", mb: 3, color: "#1976d2" }}>
                Informes Enfoque Cualitativo
            </Typography>

            <Grid container spacing={2}>
                { }
                <Grid item xs={12} sm={6}>
                    <DatePicker
                        label="Fecha inicio"
                        value={filtros.fechaInicio ? dayjs(filtros.fechaInicio) : null}
                        onChange={(newValue) =>
                            setFiltros({
                                ...filtros,
                                fechaInicio: newValue ? dayjs(newValue).format("YYYY-MM-DD") : "",
                            })
                        }
                        slots={{ openPickerIcon: Calendar }}
                        slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
                    />
                </Grid>

                <Grid item xs={12} sm={6}>
                    <DatePicker
                        label="Fecha fin"
                        value={filtros.fechaFin ? dayjs(filtros.fechaFin) : null}
                        onChange={(newValue) =>
                            setFiltros({
                                ...filtros,
                                fechaFin: newValue ? dayjs(newValue).format("YYYY-MM-DD") : "",
                            })
                        }
                        slots={{ openPickerIcon: Calendar }}
                        slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
                    />
                </Grid>

                { }
                {[
                    { label: "Plan", key: "idPlan", items: listas.planesList },
                    { label: "Eje", key: "idEje", items: listas.ejesList },
                    { label: "Estado Proyecto", key: "idEstadoProyecto", items: listas.estadosGenList },
                    { label: "Estado Ejecución", key: "idEstadoEjecucion", items: listas.estadoSegList },
                    { label: "Unidad Ejecutora", key: "idUnidad", items: listas.unidadesList },
                ].map((select) => (
                    <Grid item xs={12} sm={6} key={select.key}>
                        <FormControl fullWidth>
                            <InputLabel>{select.label}</InputLabel>
                            <Select
                                value={filtros[select.key]}
                                label={select.label}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    setFiltros((prev) => ({
                                        ...prev,
                                        [select.key]: value,
                                        ...(select.key === "idEstadoProyecto" && {
                                            idProyecto: "", 
                                        }),
                                    }));
                                }}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                {select.items.map((item) => (
                                    <MenuItem key={item.id} value={item.id}>
                                        {item.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                ))}

                { }
                <Grid item xs={12} sm={6}>
                    <Autocomplete
                        options={proyectosFiltrados}
                        loading={loadingProyectos}
                        getOptionLabel={(option) =>
                            option
                                ? `${option.idproyecto} - ${option.nombrepr}`
                                : ""
                        }
                        value={
                            proyectosFiltrados.find(
                                (p) => p.idproyecto === filtros.idProyecto
                            ) || null
                        }
                        onChange={(e, newValue) =>
                            setFiltros({
                                ...filtros,
                                idProyecto: newValue ? newValue.idproyecto : "",
                            })
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Proyecto (ID - Nombre)"
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingProyectos ? (
                                                <CircularProgress size={20} />
                                            ) : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Grid>
            </Grid>

            { }
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<ClipboardText size={20} />}
                    disabled={loadingReporte}
                    onClick={() => generarReporte("planeacion")}
                >
                    {loadingReporte ? "Generando..." : "Informe de Planeación"}
                </Button>
                <Button
                    variant="contained"
                    color="success"
                    startIcon={<DocumentDownload size={20} />}
                    disabled={loadingReporte}
                    onClick={() => generarReporte("avance")}
                >
                    {loadingReporte ? "Generando..." : "Informe de Avance"}
                </Button>
            </Stack>
        </Paper>
    );
}
