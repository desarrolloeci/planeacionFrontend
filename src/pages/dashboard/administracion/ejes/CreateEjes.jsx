import { API_BASE_URL } from 'src/config/api';
import { z as zod } from 'zod';
import { toast } from 'sonner';
import { TickCircle } from 'iconsax-react';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Grid } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';





const metadata = { title: `Crear eje | Dashboard - ${CONFIG.appName}` };

export default function CreateEjes() {


    const navigate = useNavigate();
    const NewTipoSchema = zod.object({
        name: zod.string().min(1, { message: 'Requerido!' }),
        objective: zod.string().min(1, { message: 'Requerido!' }),
        state: zod.boolean().optional(),
    });

    const defaultValues = {
        name: '',
        objective: '',
        state: true,
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
            "nombreep": data.name,
            "objgeneralep": data.objective,
            "tipoep": 1,
            "estadoep": data.state === true ? 1 : 0
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_BASE_URL}/ejeprograma`, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                toast.success('Se creo correctamente el registro!');
                navigate(paths.dashboard.administracion.rootEjes)
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
                    heading="Crear eje"
                    backHref={paths.dashboard.administracion.rootEjes}
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Ejes', href: paths.dashboard.administracion.rootEjes },
                        { name: 'Nuevo eje' },
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

                                <Field.Switch name="state" label="Estado" />

                                <Field.Text multiline
                                    rows={3}
                                    name="objective" label="Objetivo general" />



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
