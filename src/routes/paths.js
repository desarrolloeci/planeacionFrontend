const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
};



export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  
  auth: {
    amplify: {
      signIn: `${ROOTS.AUTH}/  /sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  
  dashboard: {
    root: ROOTS.DASHBOARD,
    administracion: {
      root: `${ROOTS.DASHBOARD}/administracion/root`,
      rootPlanes: `${ROOTS.DASHBOARD}/administracion/planes`,
      newPlan: `${ROOTS.DASHBOARD}/administracion/newPlan`,
      editPlan: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editPlan`,
      rootEjes: `${ROOTS.DASHBOARD}/administracion/ejes`,
      newEje: `${ROOTS.DASHBOARD}/administracion/newEje`,
      editEje: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editEje`,
      rootUnidadEjecutora: `${ROOTS.DASHBOARD}/administracion/unidadEjecutora`,
      newUnidadEjecutora: `${ROOTS.DASHBOARD}/administracion/newUnidadEjecutora`,
      editUnidadEjecutora: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editUnidadEjecutora`,
      rootEstadoGeneral: `${ROOTS.DASHBOARD}/administracion/estadoGeneral`,
      newEstadoGeneral: `${ROOTS.DASHBOARD}/administracion/newEstadoGeneral`,
      editEstadoGeneral: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editEstadoGeneral`,
      rootEstadoEjecucion: `${ROOTS.DASHBOARD}/administracion/estadoEjecucion`,
      newEstadoEjecucion: `${ROOTS.DASHBOARD}/administracion/newEstadoEjecucion`,
      editEstadoEjecucion: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editEstadoEjecucion`,
      rootEstadoSeguimiento: `${ROOTS.DASHBOARD}/administracion/estadoSeguimiento`,
      newEstadoSeguimiento: `${ROOTS.DASHBOARD}/administracion/newEstadoSeguimiento`,
      editEstadoSeguimiento: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editEstadoSeguimiento`,
      rootSnies: `${ROOTS.DASHBOARD}/administracion/snies`,
      newSnies: `${ROOTS.DASHBOARD}/administracion/newSnies`,
      editSnies: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editSnies`,
      rootRubroPlaneacion: `${ROOTS.DASHBOARD}/administracion/rubroPlaneacion`,
      newRubroPlaneacion: `${ROOTS.DASHBOARD}/administracion/newRubroPlaneacion`,
      editRubroPlaneacion: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editRubroPlaneacion`,
      rootFinAutoevaluacion: `${ROOTS.DASHBOARD}/administracion/finAutoevaluacion`,
      newFinAutoevaluacion: `${ROOTS.DASHBOARD}/administracion/newFinAutoevaluacion`,
      editFinAutoevaluacion: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editFinAutoevaluacion`,
      rootFactores: `${ROOTS.DASHBOARD}/administracion/factores`,
      newFactores: `${ROOTS.DASHBOARD}/administracion/newFactores`,
      editFactores: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editFactores`,
      rootCaracteristicas: `${ROOTS.DASHBOARD}/administracion/caracteristicas`,
      newCaracteristicas: `${ROOTS.DASHBOARD}/administracion/newCaracteristicas`,
      editCaracteristicas: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editCaracteristicas`,
      rootTipoRubro: `${ROOTS.DASHBOARD}/administracion/tipoRubro`,
      newTipoRubro: `${ROOTS.DASHBOARD}/administracion/newTipoRubro`,
      editTipoRubro: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editTipoRubro`,
      rootAdminHome: `${ROOTS.DASHBOARD}/administracion/adminHome`, rootRoles: `${ROOTS.DASHBOARD}/administracion/roles`,
      newRoles: `${ROOTS.DASHBOARD}/administracion/newRoles`,
      editRoles: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editRoles`,
      rootPerfiles: `${ROOTS.DASHBOARD}/administracion/perfiles`,
      newPerfiles: `${ROOTS.DASHBOARD}/administracion/newPerfiles`,
      editPerfiles: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editPerfiles`,
      rootUsuarios: `${ROOTS.DASHBOARD}/administracion/usuarios`,
      newUsuarios: `${ROOTS.DASHBOARD}/administracion/newUsuarios`,
      editUsuarios: (id) => `${ROOTS.DASHBOARD}/administracion/${id}/editUsuarios`,


    },
    gestion: {
      rootG: `${ROOTS.DASHBOARD}/gestion/rootG`,
      gestionProyectosActivos: `${ROOTS.DASHBOARD}/gestion/gestionProyectosActivos`,
      gestionProyectosHistorico: `${ROOTS.DASHBOARD}/gestion/gestionProyectosHistorico`,
      gestionProyectosSeguimiento: `${ROOTS.DASHBOARD}/gestion/gestionProyectosSeguimiento`,
      nuevoProyecto: `${ROOTS.DASHBOARD}/gestion/nuevoProyecto`,
      editarProyecto: `${ROOTS.DASHBOARD}/gestion/editarProyecto`,
      detalleProyecto: `${ROOTS.DASHBOARD}/gestion/detalleProyecto`,
      detalleSeguimiento: `${ROOTS.DASHBOARD}/gestion/detalleSeguimiento`,
      formularioSeguimiento: `${ROOTS.DASHBOARD}/gestion/formularioSeguimiento`,

    },
    reportes: {
      rootRe: `${ROOTS.DASHBOARD}/reportes/rootRe`,
      enfoqueCualitativo: `${ROOTS.DASHBOARD}/reportes/enfoqueCualitativo`,

    }

  },
};
