import { API_BASE_URL } from 'src/config/api';
import { z as zod } from 'zod';
import { toast } from 'sonner';
import { TickCircle } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate, useParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { getStorage as getStorageValue, setStorage } from 'minimal-shared/utils';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Grid } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';





const metadata = { title: `Crear Estado General | Dashboard - ${CONFIG.appName}` };

export default function CreateEstadoGeneral() {


    const navigate = useNavigate();

    const NewTipoSchema = zod.object({
        name: zod.string().min(1, { message: 'Requerido!' }),
        description: zod.string().min(1, { message: 'Requerido!' }),
        secuencial: zod.string().min(1, { message: 'Requerido!' }),
    });

    const defaultValues = {
        id: '',
        name: '',
        description: '',
        secuencial: '',
    };

    const methods = useForm({
        mode: 'onSubmit',
        resolver: zodResolver(NewTipoSchema),
        defaultValues,
    });

    const {
        reset,
        watch,
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = methods;

    const values = watch();

    const onSubmit = handleSubmit(async (data) => {

        

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
            "tipo": 1,
            "valor": data.name,
            "descripcion": data.description,
            "secuencial": data.secuencial,
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_BASE_URL}/parametros`, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                toast.success('Se actualizo correctamente el registro!');
                navigate(paths.dashboard.administracion.rootEstadoGeneral)
            })
            .catch((error) => {

                toast.error('Ocurrio un error al guardar el registro!');



            });


    });



    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <DashboardContent sx={{ width: "100%" }}>
                <CustomBreadcrumbs
                    heading="Crear estado general"
                    backHref={paths.dashboard.administracion.rootEstadoGeneral}
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Estado general', href: paths.dashboard.administracion.rootEstadoGeneral },
                        { name: 'Nuevo estado general' },
                    ]}
                    sx={{ mb: { xs: 3, md: 5 } }}
                />



                <Form methods={methods} onSubmit={onSubmit}>
                    <Grid container spacing={3}>




                        <Card sx={{ p: 3, width: "100%" }}>
                            <Box
                                sx={{
                                    rowGap: 3,
                                    columnGap: 2,
                                    display: 'grid',
                                    gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
                                }}
                            >
                                <Field.Text name="name" label="Nombre" />
                                <Field.Text name="secuencial" label="Secuencial" />

                                <Field.Text name="description" label="Decripción" multiline
                                    rows={3} />
                            </Box>

                            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
                                <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting} startIcon={<TickCircle
                                    size="20"
                                    color="#FFFFFF"
                                    variant="Bold"
                                />}>
                                    Crear
                                </LoadingButton>
                            </Stack>
                        </Card>

                    </Grid>
                </Form>

            </DashboardContent>

        </>
    );
}
