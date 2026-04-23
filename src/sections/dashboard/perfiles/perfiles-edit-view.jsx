import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { PerfilesNewEditForm } from './perfiles-new-edit-form';





export function PerfilesEditView({ currentTipo }) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Editar perfil"
        backHref={paths.dashboard.administracion.rootPerfiles}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Perfiles', href: paths.dashboard.administracion.rootPerfiles },
          { name: currentTipo?.name },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <PerfilesNewEditForm currentTipo={currentTipo} />
    </DashboardContent>
  );
}
