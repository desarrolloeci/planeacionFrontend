import { z as zod } from 'zod';
import { TickCircle } from 'iconsax-react';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Grid, MenuItem } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';





const metadata = { title: `Crear factores | Dashboard - ${CONFIG.appName}` };

export default function CreateFactores() {

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
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <DashboardContent sx={{ width: "100%" }}>
                <CustomBreadcrumbs
                    heading="Crear factores"
                    backHref={paths.dashboard.administracion.rootFactores}
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Factores', href: paths.dashboard.administracion.rootFactores },
                        { name: 'Nuevo factor' },
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
