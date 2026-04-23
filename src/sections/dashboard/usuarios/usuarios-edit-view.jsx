import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { UsuariosNewEditForm } from './usuarios-new-edit-form';





export function UsuariosEditView({ currentTipo }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar usuario"
        backHref={paths.dashboard.administracion.rootUsuarios}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Usuarios', href: paths.dashboard.administracion.rootUsuarios },
          { name: currentTipo?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UsuariosNewEditForm currentTipo={currentTipo} />
    </DashboardContent>
  );
}
