import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PerfilesNewEditForm } from './perfiles-new-edit-form';





export function PerfilesCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Crear perfil"
        backHref={paths.dashboard.administracion.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Perfil', href: paths.dashboard.administracion.rootPerfiles },
          { name: 'Nuevo perfil' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PerfilesNewEditForm />

    </DashboardContent>
  );
}
