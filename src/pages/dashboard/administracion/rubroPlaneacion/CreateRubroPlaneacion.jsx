import { API_BASE_URL } from 'src/config/api';
import { z as zod } from 'zod';
import { toast } from 'sonner';
import { TickCircle } from 'iconsax-react';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { getStorage } from 'minimal-shared/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Grid, MenuItem } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';





const metadata = { title: `Crear Rubro planeación | Dashboard - ${CONFIG.appName}` };

export default function CreateRubroPlaneacion() {
    const navigate = useNavigate();
    const tiposRubro = JSON.parse(getStorage("tipoRubroList"))


    const NewTipoSchema = zod.object({
        name: zod.string().min(1, { message: 'Requerido!' }),
        type: zod.number().min(1, { message: 'Requerido!' }),
        state: zod.boolean().optional(),
    });

    const defaultValues = {
        name: '',
        type: '',
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
            "nombre": data.name,
            "tipo": data.type,
            "estado": data.state === true ? 1 : 0
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_BASE_URL}/rubrosplaneacion`, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                toast.success('Se creo correctamente el registro!');
                navigate(paths.dashboard.administracion.rootRubroPlaneacion)
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
                    heading="Crear rubro planeacion"
                    backHref={paths.dashboard.administracion.rootUnidadEjecutora}
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Rubro planeación', href: paths.dashboard.administracion.rootUnidadEjecutora },
                        { name: 'Nuevo rubro planeacion' },
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
                                <Field.Select name="type" label="Tipo">
                                    {tiposRubro.map((status) => (
                                        <MenuItem key={status.secuencial} value={status.secuencial}>
                                            {`${status.name}`}
                                        </MenuItem>
                                    ))}
                                </Field.Select>


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
