import { z as zod } from 'zod';
import { useParams } from 'react-router';
import { TickCircle } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { getStorage as getStorageValue, setStorage } from 'minimal-shared/utils';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Grid, MenuItem } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

export default function EditEjesForm({ registroEditar }) {

    const fines = [
        {
            id: 1,
            nombrefacfin: "Acreditación Institucional",
            secuencial: "1",

        },
        {
            id: 2,
            nombrefacfin: "Acreditación Prueba 2",
            secuencial: "2",

        }
    ]

    const NewTipoSchema = zod.object({
        nombrefacfin: zod.string().min(1, { message: 'Requerido!' }),
        relacionfin: zod.string().min(1, { message: 'Requerido!' }),
    });

    const defaultValues = {
        nombrefacfin: '',
        relacionfin: '',
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
                heading="Editar factores"
                backHref={paths.dashboard.administracion.rootFactores}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Factores', href: paths.dashboard.administracion.rootFactores },
                    { name: 'Editar factores' },
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
                            <Field.Text name="nombrefacfin" label="Factor" />

                            <Field.Select name="relacionfin" label="Fin de autoevaluación">
                                {fines.map((status) => (
                                    <MenuItem key={status.secuencial} value={status.secuencial}>
                                        {`${status.nombrefacfin}`}
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
                                Actualizar
                            </LoadingButton>
                        </Stack>
                    </Card>

                </Grid>
            </Form>

        </DashboardContent>
    )


}
