import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { usePathname } from '../hooks';



const IndexPage = lazy(() => import('src/pages/dashboard/Inicio'));
const Planes = lazy(() => import('src/pages/dashboard/administracion/planes/Planes'));
const PlanesNew = lazy(() => import('src/pages/dashboard/administracion/planes/CreatePlanes'));
const PlanesEdit = lazy(() => import('src/pages/dashboard/administracion/planes/EditPlanes'));
const Ejes = lazy(() => import('src/pages/dashboard/administracion/ejes/Ejes'));
const EjesNew = lazy(() => import('src/pages/dashboard/administracion/ejes/CreateEjes'));
const EjesEdit = lazy(() => import('src/pages/dashboard/administracion/ejes/EditEjes'));
const UnidadEjecutora = lazy(() => import('src/pages/dashboard/administracion/unidadEjecutora/UnidadEjecutora'));
const UnidadEjecutoraNew = lazy(() => import('src/pages/dashboard/administracion/unidadEjecutora/CreateUnidadEjecutora'));
const UnidadEjecutoraEdit = lazy(() => import('src/pages/dashboard/administracion/unidadEjecutora/EditUnidadEjecutora'));
const EstadoGeneral = lazy(() => import('src/pages/dashboard/administracion/estadoGeneral/EstadoGeneral'));
const EstadoGeneralNew = lazy(() => import('src/pages/dashboard/administracion/estadoGeneral/CreateEstadoGeneral'));
const EstadoGeneralEdit = lazy(() => import('src/pages/dashboard/administracion/estadoGeneral/EditEstadoGeneral'));
const EstadoEjecucion = lazy(() => import('src/pages/dashboard/administracion/estadoEjecucion/EstadoEjecucion'));
const EstadoEjecucionNew = lazy(() => import('src/pages/dashboard/administracion/estadoEjecucion/CreateEstadoEjecucion'));
const EstadoEjecucionEdit = lazy(() => import('src/pages/dashboard/administracion/estadoEjecucion/EditEstadoEjecucion'));
const EstadoSeguimiento = lazy(() => import('src/pages/dashboard/administracion/estadoSeguimiento/EstadoSeguimiento'));
const EstadoSeguimientoNew = lazy(() => import('src/pages/dashboard/administracion/estadoSeguimiento/CreateEstadoSeguimiento'));
const EstadoSeguimientoEdit = lazy(() => import('src/pages/dashboard/administracion/estadoSeguimiento/EditEstadoSeguimiento'));
const Snies = lazy(() => import('src/pages/dashboard/administracion/snies/Snies'));
const SniesNew = lazy(() => import('src/pages/dashboard/administracion/snies/CreateSnies'));
const SniesEdit = lazy(() => import('src/pages/dashboard/administracion/snies/EditSnies'));
const RubroPlaneacion = lazy(() => import('src/pages/dashboard/administracion/rubroPlaneacion/RubroPlaneacion'));
const RubroPlaneacionNew = lazy(() => import('src/pages/dashboard/administracion/rubroPlaneacion/CreateRubroPlaneacion'));
const RubroPlaneacionEdit = lazy(() => import('src/pages/dashboard/administracion/rubroPlaneacion/EditRubroPlaneacion'));
const FinAutoevaluacion = lazy(() => import('src/pages/dashboard/administracion/FinAutoevaluacion/FinAutoevaluacion'));
const FinAutoevaluacionNew = lazy(() => import('src/pages/dashboard/administracion/FinAutoevaluacion/CreateFinAutoevaluacion'));
const FinAutoevaluacionEdit = lazy(() => import('src/pages/dashboard/administracion/FinAutoevaluacion/EditFinAutoevaluacion'));
const Factores = lazy(() => import('src/pages/dashboard/administracion/factores/Factores'));
const FactoresNew = lazy(() => import('src/pages/dashboard/administracion/factores/CreateFactores'));
const FactoresEdit = lazy(() => import('src/pages/dashboard/administracion/factores/EditFactores'));
const Caracteristicas = lazy(() => import('src/pages/dashboard/administracion/caracteristicas/Caracteristicas'));
const CaracteristicasNew = lazy(() => import('src/pages/dashboard/administracion/caracteristicas/CreateCaracteristicas'));
const CaracteristicasEdit = lazy(() => import('src/pages/dashboard/administracion/caracteristicas/EditCaracteristicas'));
const TipoRubro = lazy(() => import('src/pages/dashboard/administracion/tipoRubro/TipoRubro'));
const TipoRubroNew = lazy(() => import('src/pages/dashboard/administracion/tipoRubro/CreateTipoRubro'));
const TipoRubroEdit = lazy(() => import('src/pages/dashboard/administracion/tipoRubro/EditTipoRubro'));
const AdminHome = lazy(() => import('src/pages/dashboard/administracion/parametrizarHome/ParametricaHome'));
const Roles = lazy(() => import('src/pages/dashboard/administracion/roles/Roles'));
const RolesNew = lazy(() => import('src/pages/dashboard/administracion/roles/CreateRoles'));
const RolesEdit = lazy(() => import('src/pages/dashboard/administracion/roles/EditRoles'));
const Perfiles = lazy(() => import('src/pages/dashboard/administracion/perfiles/Perfiles'));
const PerfilesNew = lazy(() => import('src/pages/dashboard/administracion/perfiles/CreatePerfiles'));
const PerfilesEdit = lazy(() => import('src/pages/dashboard/administracion/perfiles/EditPerfiles'));

const Usuarios = lazy(() => import('src/pages/dashboard/administracion/usuarios/Usuarios'));
const UsuariosNew = lazy(() => import('src/pages/dashboard/administracion/usuarios/CreateUsuarios'));
const UsuariosEdit = lazy(() => import('src/pages/dashboard/administracion/usuarios/EditUsuarios'));




const GestionProyectosActivos = lazy(() => import('src/pages/dashboard/gestion/GestionProyectosActivos'));
const GestionProyectosHistorico = lazy(() => import('src/pages/dashboard/gestion/GestionProyectosHistorico'));
const GestionProyectosSeguimiento = lazy(() => import('src/pages/dashboard/gestion/GestionProyectosSeguimiento'));
const NuevoProyecto = lazy(() => import('src/pages/dashboard/gestion/NuevoProyecto'));
const EditarProyecto = lazy(() => import('src/pages/dashboard/gestion/EditarProyecto'));
const DetalleProyecto = lazy(() => import('src/pages/dashboard/gestion/DetalleProyecto'));
const DetalleSeguimiento = lazy(() => import('src/pages/dashboard/gestion/DetalleSeguimiento'));
const FormularioSeguimiento = lazy(() => import('src/pages/dashboard/gestion/FormularioSeguimiento'));





const InformesEnfoqueCualitativo = lazy(() => import('src/pages/dashboard/reportes/InformesEnfoqueCualitativo'));




function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes = [
  {
    path: 'dashboard',
    element: dashboardLayout(),
    children: [
      { element: <IndexPage />, index: true },
      {
        path: 'administracion',
        children: [
          { path: 'planes', element: <Planes />, index: true },
          { path: 'newPlan', element: <PlanesNew /> },
          { path: ':id/editPlan', element: <PlanesEdit /> },
          { path: 'ejes', element: <Ejes />, index: true },
          { path: 'newEje', element: <EjesNew /> },
          { path: ':id/editEje', element: <EjesEdit /> },
          { path: ':id/editUnidadEjecutora', element: <UnidadEjecutoraEdit /> },
          { path: 'unidadEjecutora', element: <UnidadEjecutora />, index: true },
          { path: 'newUnidadEjecutora', element: <UnidadEjecutoraNew /> },
          { path: ':id/editUnidadEjecutora', element: <UnidadEjecutoraEdit /> },
          { path: 'estadoGeneral', element: <EstadoGeneral />, index: true },
          { path: 'newEstadoGeneral', element: <EstadoGeneralNew /> },
          { path: ':id/editEstadoGeneral', element: <EstadoGeneralEdit /> },
          { path: 'estadoEjecucion', element: <EstadoEjecucion />, index: true },
          { path: 'newEstadoEjecucion', element: <EstadoEjecucionNew /> },
          { path: ':id/editEstadoEjecucion', element: <EstadoEjecucionEdit /> },
          { path: 'estadoSeguimiento', element: <EstadoSeguimiento />, index: true },
          { path: 'newEstadoSeguimiento', element: <EstadoSeguimientoNew /> },
          { path: ':id/editEstadoSeguimiento', element: <EstadoSeguimientoEdit /> },
          { path: 'snies', element: <Snies />, index: true },
          { path: 'newSnies', element: <SniesNew /> },
          { path: ':id/editSnies', element: <SniesEdit /> },
          { path: 'rubroPlaneacion', element: <RubroPlaneacion />, index: true },
          { path: 'newRubroPlaneacion', element: <RubroPlaneacionNew /> },
          { path: ':id/editRubroPlaneacion', element: <RubroPlaneacionEdit /> },
          { path: 'finAutoevaluacion', element: <FinAutoevaluacion />, index: true },
          { path: 'newFinAutoevaluacion', element: <FinAutoevaluacionNew /> },
          { path: ':id/editFinAutoevaluacion', element: <FinAutoevaluacionEdit /> },
          { path: 'factores', element: <Factores />, index: true },
          { path: 'newFactores', element: <FactoresNew /> },
          { path: ':id/editFactores', element: <FactoresEdit /> },
          { path: 'caracteristicas', element: <Caracteristicas />, index: true },
          { path: 'newCaracteristicas', element: <CaracteristicasNew /> },
          { path: ':id/editCaracteristicas', element: <CaracteristicasEdit /> },
          { path: 'tipoRubro', element: <TipoRubro />, index: true },
          { path: 'newTipoRubro', element: <TipoRubroNew /> },
          { path: ':id/editTipoRubro', element: <TipoRubroEdit /> },
          { path: 'adminHome', element: <AdminHome /> }, { path: 'roles', element: <Roles />, index: true },
          { path: 'newRoles', element: <RolesNew /> },
          { path: ':id/editRoles', element: <RolesEdit /> },
          { path: 'perfiles', element: <Perfiles />, index: true },
          { path: 'newPerfiles', element: <PerfilesNew /> },
          { path: ':id/editPerfiles', element: <PerfilesEdit /> },
          { path: 'usuarios', element: <Usuarios />, index: true },
          { path: 'newUsuarios', element: <UsuariosNew /> },
          { path: ':id/editUsuarios', element: <UsuariosEdit /> },


        ]
      },
      {
        path: 'gestion',
        children: [
          { path: 'gestionProyectosActivos', element: <GestionProyectosActivos /> },
          { path: 'gestionProyectosHistorico', element: <GestionProyectosHistorico /> },
          { path: 'gestionProyectosSeguimiento', element: <GestionProyectosSeguimiento /> },
          { path: 'nuevoProyecto', element: <NuevoProyecto /> },
          { path: 'editarProyecto', element: <EditarProyecto /> },
          { path: 'detalleProyecto', element: <DetalleProyecto /> },
          { path: 'detalleSeguimiento', element: <DetalleSeguimiento /> },
          { path: 'formularioSeguimiento', element: <FormularioSeguimiento /> },

        ]
      },
      {
        path: 'reportes',
        children: [
          { path: 'enfoqueCualitativo', element: <InformesEnfoqueCualitativo /> },

        ]
      },
    ],

  },

];
