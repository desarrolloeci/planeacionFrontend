import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UsuariosNewEditForm } from './usuarios-new-edit-form';




export function UsuariosCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Crear usuario"
        backHref={paths.dashboard.administracion.root}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Usuarios', href: paths.dashboard.administracion.rootUsuarios },
          { name: 'Nuevo usuario' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UsuariosNewEditForm />
    </DashboardContent>
  );
}
