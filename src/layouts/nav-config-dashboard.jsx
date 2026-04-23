import { Home3, NoteAdd, Setting2, UserEdit } from 'iconsax-react';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';



const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
  parameter: icon('ic-parameter'),
};



export const navData = [
  
  {
    subheader: '',
    items: [
      {
        title: 'Inicio',
        path: paths.dashboard.root,
        icon: <Home3
          size="32"
          color="#FE5000"
          variant="Bulk"
        />
      }
    ],
  },

  
  {
    items: [
      {
        title: 'Parámetros',
        path: paths.dashboard.administracion.root,
        icon: <Setting2
          size="32"
          color="#FE5000"
          variant="Bulk"
        />,
        children: [
          { title: 'Planes', path: paths.dashboard.administracion.rootPlanes },
          { title: 'Ejes', path: paths.dashboard.administracion.rootEjes },
          { title: 'Unidad Ejecutora', path: paths.dashboard.administracion.rootUnidadEjecutora },
          { title: 'Estados General', path: paths.dashboard.administracion.rootEstadoGeneral },
          { title: 'Estados Ejecución', path: paths.dashboard.administracion.rootEstadoEjecucion },
          { title: 'Estados Seguimiento', path: paths.dashboard.administracion.rootEstadoSeguimiento },
          { title: 'Rubros Planeacion', path: paths.dashboard.administracion.rootRubroPlaneacion },
          { title: 'Tipo de rubro', path: paths.dashboard.administracion.rootTipoRubro },
          { title: 'Administrar inicio', path: paths.dashboard.administracion.rootAdminHome },


        ],
      },

      {
        title: 'Usuarios',
        path: paths.dashboard.administracion.root,
        icon: <UserEdit
          size="32"
          color="#FE5000"
          variant="Bulk"
        />,
        children: [
          { title: 'Roles', path: paths.dashboard.administracion.rootRoles },
          { title: 'Perfiles', path: paths.dashboard.administracion.rootPerfiles },
          { title: 'Usuarios del sistema', path: paths.dashboard.administracion.rootUsuarios },

        ],
      },
      {
        title: 'Gestión ',
        path: paths.dashboard.gestion.rootG,
        icon: <NoteAdd
          color="#FE5000"
          variant="Outline"
        />,
        children: [
          {
            title: 'Proyectos activos', path: paths.dashboard.gestion.gestionProyectosActivos,


          },
          { title: 'Historico de proyectos', path: paths.dashboard.gestion.gestionProyectosHistorico, },
          { title: 'Seguimiento de proyectos', path: paths.dashboard.gestion.gestionProyectosSeguimiento, }
        ],
      },
      {
        title: 'Reportes',
        path: paths.dashboard.reportes.rootRe,
        icon: <NoteAdd
          color="#FE5000"
          variant="Outline"
        />,
        children: [
          {
            title: 'Informes Enfoque Cualitativo', path: paths.dashboard.reportes.enfoqueCualitativo,


          }
        ],
      },
    ]
  }

];
