import { z as zod } from 'zod';
import { useParams } from 'react-router';
import { TickCircle } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
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

export default function EditSniesForm({ registroEditar }) {

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

        values: registroEditar,
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

        

    });


    return (

        <DashboardContent sx={{ width: "100%" }}>
            <CustomBreadcrumbs
                heading="Editar Snies"
                backHref={paths.dashboard.administracion.rootSnies}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Snies', href: paths.dashboard.administracion.rootSnies },
                    { name: 'Editar Snies' },
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
