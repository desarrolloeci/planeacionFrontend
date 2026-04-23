import { API_BASE_URL } from 'src/config/api';
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




const metadata = { title: `Planes | Dashboard - ${CONFIG.appName}` };

export default function Planes() {

    const [arrayParametro, setArrayParametro] = useState([]);
    const [loading, setLoading] = useState(false);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [registroEliminar, setRegistroEliminar] = useState("");
    const navigate = useNavigate();


    const columns = [
        { field: 'id', headerName: 'ID', flex: 1 },
        { field: 'name', headerName: 'Nombre', flex: 1 },
        { field: 'state', headerName: 'Estado', flex: 1 },
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

        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };



        fetch(`${API_BASE_URL}/planes`, requestOptions)
            .then((response) => response.text())
            .then((result) => {

                const array = []

                var resultJSON = JSON.parse(result)

                

                resultJSON.forEach(element => {

                    

                    var a = {
                        id: element.idplan,
                        name: element.nombrepl,
                        state: element.estadopl
                    }

                    array.push(a)

                });

                

                setArrayParametro(array);
                setLoading(false)


            })
            .catch((error) => {
                console.error(error)
                setArrayParametro([]);
                setLoading(false)
            });





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

        const requestOptions = {
            method: "DELETE",
            redirect: "follow"
        };

        fetch(`${API_BASE_URL}/planes/` + id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                var resultJSON = JSON.parse(result)
                if (resultJSON.status === 200) {
                    toast.success('Se elimino correctamente el registro!');
                    navigate(paths.dashboard.administracion.rootPlanes)
                } else {
                    toast.error('Ocurrio un error al eliminar el registro!');
                }
            })
            .catch((error) => {

                toast.error('Ocurrio un error al eliminar el registro!');



            });
    }
    const actualizar = (row) => {



        var editPlan = JSON.stringify(row);



        setStorage("editPlan", JSON.stringify(editPlan))

        navigate(paths.dashboard.administracion.editPlan(row.id))

    }



    return (
        <>

            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Planes"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Planes' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.administracion.newPlan}
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Nuevo plan
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
