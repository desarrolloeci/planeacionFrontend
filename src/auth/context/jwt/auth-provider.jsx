import sign from 'jwt-encode';
import { jwtDecode } from 'jwt-decode';
import { setStorage } from 'minimal-shared/utils';
import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { getRoles, getPerfiles, getUsuarioById, getUsuarioByEmail } from 'src/utils/apiRequests';

import axios, { endpoints } from 'src/lib/axios';

import { toast } from 'src/components/snackbar';

import { JWT_STORAGE_KEY } from './constant';
import { AuthContext } from '../auth-context';
import { setSession, isValidToken } from './utils';



export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true });

  const router = useRouter();
  const checkUserSession = useCallback(async () => {
    try {

      const accessToken = sessionStorage.getItem(JWT_STORAGE_KEY);


      if (accessToken && isValidToken(accessToken)) {
        setSession(accessToken);
        const baseURL = import.meta.env.VITE_APP_BACK_URL;

        const decoded = jwtDecode(accessToken);

        const res = await getUsuarioByEmail(decoded.email);


        if (res.id !== undefined) {

          var user = {
            "id": res.id,
            "displayName": res.name,
            "role": res.perfil,
            "email": res.email
          }




          setState({ user: { ...user, accessToken }, loading: false });

          await axios.get(`${baseURL}/Profile/${user.role}/roles`).then((response2) => {


            const decoded2 = jwtDecode(response2.data);
            const decodedJSON2 = JSON.parse(decoded2.data)

            const rolesByUser = [];

            decodedJSON2.forEach(element2 => {

              rolesByUser.push(element2.Description)
            });



            setStorage('arrayRoles', JSON.stringify(rolesByUser));

            axios.get(`${baseURL}/ParamType`).then(async (response3) => {




              const respuesta3 = response3.data;
              const decodedArray = jwtDecode(respuesta3);

              const docodedArrayJson = JSON.parse(decodedArray.data)



              const arrayParam = [];

              docodedArrayJson.forEach(element => {


                const ar = {
                  id: element.id,
                  name: element.name,
                  acronym: element.acronym
                }



                arrayParam.push(ar)

              });



              setStorage('arrayParam', JSON.stringify(arrayParam));

              const tipoParametro1 = arrayParam.find(item => item.acronym === "VOLTAJE")
              if (tipoParametro1 !== undefined) {
                var voltaje = await getParametrica(tipoParametro1.id);
                setStorage('arrayVoltaje', JSON.stringify(voltaje));
              }

              const tipoParametro2 = arrayParam.find(item => item.acronym === "ATMOSFERA_CORROSIVA")
              if (tipoParametro2 !== undefined) {
                var atmosfera = await getParametrica(tipoParametro2.id);
                setStorage('arrayAtmosfera', JSON.stringify(atmosfera));
              }


              const tipoParametro3 = arrayParam.find(item => item.acronym === "VANO_ESPECIAL")
              if (tipoParametro3 !== undefined) {
                var vanoEspecial = await getParametrica(tipoParametro3.id);
                setStorage('arrayVanoEspecial', JSON.stringify(vanoEspecial));
              }

              const tipoParametro4 = arrayParam.find(item => item.acronym === "TIPO_APOYO")
              if (tipoParametro4 !== undefined) {
                var tipoApoyo = await getParametrica(tipoParametro4.id);
                setStorage('arrayTipoApoyo', JSON.stringify(tipoApoyo));
              }

              const tipoParametro5 = arrayParam.find(item => item.acronym === "FUNCION_APOYO")
              if (tipoParametro5 !== undefined) {
                var funcionApoyo = await getParametrica(tipoParametro5.id);
                setStorage('arrayFuncionApoyo', JSON.stringify(funcionApoyo));
              }

              const tipoParametro6 = arrayParam.find(item => item.acronym === "POSICION_VERTICAL")
              if (tipoParametro6 !== undefined) {
                var posicionVertical = await getParametrica(tipoParametro6.id);
                setStorage('arrayPosicionVertical', JSON.stringify(posicionVertical));
              }

              const tipoParametro7 = arrayParam.find(item => item.acronym === "POSICION_HORIZONTAL")
              if (tipoParametro7 !== undefined) {
                var posicionHorizontal = await getParametrica(tipoParametro7.id);
                setStorage('arrayPosicionHorizontal', JSON.stringify(posicionHorizontal));
              }

              const tipoParametro8 = arrayParam.find(item => item.acronym === "TIPO_ELEMENTO")
              if (tipoParametro8 !== undefined) {
                var tipoElemento = await getParametrica(tipoParametro8.id);
                setStorage('arrayTipoElemento', JSON.stringify(tipoElemento));
              }

              const tipoParametro9 = arrayParam.find(item => item.acronym === "TIPO_MATERIAL")
              if (tipoParametro9 !== undefined) {
                var tipoMaterial = await getParametrica(tipoParametro9.id);
                setStorage('arrayTipoMaterial', JSON.stringify(tipoMaterial));
              }

              const tipoParametro10 = arrayParam.find(item => item.acronym === "UNIDAD_MEDIDA")
              if (tipoParametro10 !== undefined) {
                var unidadMedida = await getParametrica(tipoParametro10.id);
                setStorage('arrayUnidadMedida', JSON.stringify(unidadMedida));
              }

              const tipoParametro11 = arrayParam.find(item => item.acronym === "ESTADO_POSICION")
              if (tipoParametro11 !== undefined) {
                var estadoPosicion = await getParametrica(tipoParametro11.id);
                setStorage('arrayEstadoPosicion', JSON.stringify(estadoPosicion));
              }



              var roles = await getRoles()
              setStorage('arrayRolesParam', JSON.stringify(roles))

              var perfiles = await getPerfiles()
              setStorage('arrayPerfilesParam', JSON.stringify(perfiles))

            }).catch(error => {
              
            });

          }).catch(error => {
            
          });


        }
        else {
          console.error("Error");
          toast.error("El usuario no tiene acceso al sistema, favor verificar");
          setState({ user: null, loading: false });

        }
      } else {
        console.error("Error");
        setState({ user: null, loading: false });

      }

    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    checkUserSession();
    
  }, []);

  const getParametrica = async (tipoParametro) => {


    const baseURL = import.meta.env.VITE_APP_BACK_URL;

    const array = [];

    await axios.get(`${baseURL}/Param/filter/${tipoParametro}`).then((response) => {

      const decoded = jwtDecode(response.data);



      var arrayP = JSON.parse(decoded.data)


      arrayP.forEach(element => {





        const a = {
          id: element.id,
          name: element.name
        }

        array.push(a)


      });




    }).catch(error => {
      
    });
    return array;
  }

  

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
