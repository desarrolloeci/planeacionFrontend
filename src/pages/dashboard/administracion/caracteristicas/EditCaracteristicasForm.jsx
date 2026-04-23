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
            nombrefacfin: "Acreditación pregrado",
            secuencial: "2",

        }
    ]

    const factores = [
        {
            id: 1,
            nombrefacfin: "Estudiantes",
            secuencial: "2",

        }

    ]

    const ejes = [
        {
            id: 5,
            name: "EJE 1 - Formación de la excelencia",
            objective: "Formar profesionales reconocidos por sus competencias científicas y técnicas y por su calidad humana, preparados para asumir con sensibilidad social el compromiso con su profesión  y con el desarrollo armónico de su entorno.",
            state: true
        }
    ]


    const NewTipoSchema = zod.object({
        nombrefacfin: zod.string().min(1, { message: 'Requerido!' }),
        relacionfin: zod.string().min(1, { message: 'Requerido!' }),
        relacionfactor: zod.string().min(1, { message: 'Requerido!' }),
        eje: zod.string().min(1, { message: 'Requerido!' }),
    });

    const defaultValues = {
        nombrefacfin: '',
        relacionfin: '',
        relacionfactor: '',
        eje: '',
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
                heading="Editar caracteristicas"
                backHref={paths.dashboard.administracion.rootCaracteristicas}
                links={[
                    { name: 'Dashboard', href: paths.dashboard.root },
                    { name: 'Caracteristicas', href: paths.dashboard.administracion.rootCaracteristicas },
                    { name: 'Editar caracteristicas' },
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
                            <Field.Text name="nombrefacfin" label="Caracteristica" />

                            <Field.Select name="relacionfin" label="Fin de autoevaluación">
                                {fines.map((status) => (
                                    <MenuItem key={status.secuencial} value={status.secuencial}>
                                        {`${status.nombrefacfin}`}
                                    </MenuItem>
                                ))}
                            </Field.Select>
                            <Field.Select name="relacionfactor" label="Factor">
                                {factores.map((status) => (
                                    <MenuItem key={status.secuencial} value={status.secuencial}>
                                        {`${status.nombrefacfin}`}
                                    </MenuItem>
                                ))}
                            </Field.Select>

                            <Field.Select name="eje" label="Eje">
                                {ejes.map((status) => (
                                    <MenuItem key={status.secuencial} value={status.id}>
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
                                Actualizar
                            </LoadingButton>
                        </Stack>
                    </Card>

                </Grid>
            </Form>

        </DashboardContent>
    )


}
