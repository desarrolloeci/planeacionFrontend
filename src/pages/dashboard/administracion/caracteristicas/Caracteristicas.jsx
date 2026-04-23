import { useNavigate } from 'react-router';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Edit, Trash } from 'iconsax-react';
import { getStorage as getStorageValue, setStorage } from 'minimal-shared/utils';

import { LoadingButton } from '@mui/lab';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, TextField, Tooltip } from '@mui/material';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';




const metadata = { title: `Caracteristicas | Dashboard - ${CONFIG.appName}` };

export default function Caracteristicas() {

    const [arrayParametro, setArrayParametro] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [registroEliminar, setRegistroEliminar] = useState("");
    const navigate = useNavigate();


    const columns = [
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'nombrefacfin', headerName: 'Nombre', flex: 1 },
        { field: 'secuencial', headerName: 'Secuencia', flex: 1 },
        { field: 'relacionfinName', headerName: 'Fin de autoevaluacion', flex: 1 },
        { field: 'factorfinName', headerName: 'Factor', flex: 1 },
        { field: 'eje', headerName: 'Eje', flex: 1 },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Administrar',
            headerClassName: 'super-app-theme--header',
            flex: 1,
            cellClassName: 'actions',
            renderCell: (params) =>
            (
                <Tooltip title="Administrar">
                    <Edit
                        size="25"
                        color='#95C11F'
                        variant="Bold" onClick={() => actualizar(params.row)} />
                </Tooltip>
            )


        },
        {
            field: 'actions2',
            type: 'actions2',
            headerName: 'Eliminar',
            headerClassName: 'super-app-theme--header',
            flex: 1,
            cellClassName: 'actions',
            renderCell: (params) =>
            (
                <Tooltip title="Eliminar">
                    <Trash
                        size="25"
                        color='red'
                        variant="Bold" onClick={() => validateDelete(params.row)} />
                </Tooltip>
            )


        }

    ]

    useEffect(() => {

        getLista()

    }, []);

    const getLista = async () => {
        setLoading(true)


        var array = [
            {
                id: 90,
                nombrefacfin: "Mecanismos de selección e ingreso",
                relacionfin: "2",
                relacionfinName: "Acreditación pregrado",
                factorfinName: "Estudiantes",
                relacionfactor: "2",
                facintegral: "2",
                eje: "5",
                secuencial: "4"

            },
            {
                id: 91,
                nombrefacfin: "Estudiantes admitidos y capacidad institucional",
                relacionfin: "2",
                relacionfinName: "Acreditación pregrado",
                factorfinName: "Estudiantes",
                relacionfactor: "2",
                facintegral: "2",
                eje: "5",
                secuencial: "5"

            }
        ]



        setArrayParametro(array);
        setLoading(false)
    }


    const validateDelete = (row) => {

        setRegistroEliminar(row.id)
        setOpenConfirm(true);

    }

    const cancelDelete = () => {

        setOpenConfirm(false)
    }

    const handleDeleteRow = () => {

        setOpenConfirm(false)

        var id = registroEliminar;


    }
    const actualizar = (row) => {

        

        var editRegistro = JSON.stringify(row);


        setStorage("editRegistro", JSON.stringify(editRegistro))

        navigate(paths.dashboard.administracion.editCaracteristicas(row.id))

    }



    return (
        <>

            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Caracteristicas"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Caracteristicas' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.administracion.newCaracteristicas}
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Nueva caracteristica
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />


                <DataGrid
                    loading={loading}
                    rows={arrayParametro}
                    columns={columns}
                    initialState={{
                        pagination: {
                            paginationModel: {
                                pageSize: 10,
                            },
                        },
                    }}
                    pageSizeOptions={[5, 10, 25]}
                    disableRowSelectionOnClick
                />

                <ConfirmDialog
                    open={openConfirm}
                    onClose={cancelDelete}
                    title="Eliminar"
                    content={
                        <>
                            ¿Esta seguro de querer eliminar el registro?
                        </>
                    }
                    action={
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                handleDeleteRow();
                            }}
                        >
                            Eliminar
                        </Button>
                    }
                />

            </DashboardContent>

        </>
    )

}
