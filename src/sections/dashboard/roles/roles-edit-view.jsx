import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { RolesNewEditForm } from './roles-new-edit-form';





export function RolesEditView({ currentTipo }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar rol"
        backHref={paths.dashboard.administracion.rootRoles}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Roles', href: paths.dashboard.administracion.rootRoles },
          { name: currentTipo?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <RolesNewEditForm currentTipo={currentTipo} />
    </DashboardContent>
  );
}
