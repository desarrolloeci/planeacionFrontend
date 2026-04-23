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

export default function EditPlanesForm({ editPlan }) {

    const navigate = useNavigate();

    const NewTipoSchema = zod.object({
        name: zod.string().min(1, { message: 'Requerido!' }),
        state: zod.boolean().optional(),
    });

    const defaultValues = {
        id: '',
        name: '',
        state: true
    };

    const methods = useForm({
        mode: 'onSubmit',
        resolver: zodResolver(NewTipoSchema),
        defaultValues,

        values: editPlan,
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
            "idplan": editPlan.id,
            "nombrepl": data.name,
            "estadopl": data.state === true ? 1 : 0
        });

        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`${API_BASE_URL}/planes/` + editPlan.id, requestOptions)
            .then((response) => response.text())
            .then((result) => {
                toast.success('Se actualizo correctamente el registro!');
                navigate(paths.dashboard.administracion.rootPlanes)
            })
            .catch((error) => {

                toast.error('Ocurrio un error al guardar el registro!');



            });

    });


    return (

        <DashboardContent sx={{ width: "100%" }}>
            <CustomBreadcrumbs
                heading="Editar plan"
                backHref={paths.dashboard.administracion.rootPlanes}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Planes', href: paths.dashboard.administracion.rootPlanes },
                    { name: 'Editar plan' },
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


                        </Box>

                        <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
                            <LoadingButton type="submit" variant="contained" color="primary" loading={isSubmitting} startIcon={<TickCircle
                                size="20"
                                color="#FFFFFF"
                                variant="Bold"
                            />}>
                                Actualizar
                            </LoadingButton>
                        </Stack>
                    </Card>

                </Grid>
            </Form>

        </DashboardContent>
    )


}
