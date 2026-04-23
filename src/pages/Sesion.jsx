import axios from 'axios';
import { useEffect, useState } from "react";
import { InteractionType } from "@azure/msal-browser";
import { removeStorage, setStorage } from 'minimal-shared/utils';
import { AuthenticatedTemplate, useMsal, useMsalAuthentication } from "@azure/msal-react";

import { LoadingButton } from '@mui/lab';
import { Box, Typography, Button } from '@mui/material';

import { paths } from "src/routes/paths";
import { useRouter } from "src/routes/hooks";

import { toast } from 'src/components/snackbar';
import { API_BASE_URL } from 'src/config/api';

export function Sesion() {
    const request = { scopes: ["User.Read"] };
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [usuarioNoEncontrado, setUsuarioNoEncontrado] = useState(false);

    const { login, result, error } = useMsalAuthentication(InteractionType.Silent, request);
    const { accounts, instance } = useMsal();

    const API_USER = (mail) => `${API_BASE_URL}/user/mail/${mail}`;
    const API_PROFILE = `${API_BASE_URL}/profile`;

    const fetchAndStore = async (url, storageKey, mapFn = (x) => x) => {
        try {
            const res = await axios.get(url);
            const mapped = res.data.map(mapFn);
            setStorage(storageKey, JSON.stringify(mapped));
            return mapped;
        } catch (err) {
            console.error(`Error en ${storageKey}:`, err);
            return [];
        }
    };

    const fetchUsuario = async (email) => {
        try {

            removeStorage('rolesMaterial')
            const resUser = await axios.get(API_USER(email));
            const usuario = resUser.data;

            if (!usuario || !usuario.id) {
                console.warn(`Usuario con email ${email} no encontrado.`);
                return null;
            }

            const resProfiles = await axios.get(API_PROFILE);
            const perfiles = resProfiles.data;

            const perfil = perfiles.find(p => p.id === usuario.profileId)?.name || 'Sin perfil';

            const usuarioFinal = {
                id: usuario.id,
                name: usuario.name,
                email: usuario.mail,
                perfil: perfil
            };



            setStorage('user', JSON.stringify(usuarioFinal));

            
            const roles = await fetchRoles(usuarioFinal);
            setStorage('rolesMaterial', JSON.stringify(roles));

            return usuarioFinal;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                console.warn(`Usuario con email ${email} no encontrado (404).`);
            } else {
                console.error('Error obteniendo usuario:', err);
                toast.error('No se pudo obtener información del usuario.');
            }
            return null;
        }
    };

    const fetchRoles = async (usuario) => {
        
        if (!usuario?.id) return [];
        try {
            const res = await axios.get(`${API_BASE_URL}/user/${usuario.id}/roles`);
            
            return res.data;
        } catch (err) {
            console.error("Error obteniendo roles:", err);
            toast.error('No se pudieron cargar los roles del usuario.');
            return [];
        }
    };

    const getParametricas = async () => {
        setLoading(true);
        await fetchAndStore(`${API_BASE_URL}/planes`, 'planesList', el => ({ id: el.idplan, name: el.nombrepl, state: el.estadopl }));
        await fetchAndStore(`${API_BASE_URL}/ejeprograma`, 'ejesList', el => ({ id: el.idejeprograma, name: el.nombreep, objective: el.objgeneralep, state: el.estadoep }));
        await fetchAndStore(`${API_BASE_URL}/unidadejecutora`, 'unidadesList', el => ({ id: el.idunidadej, name: el.nombreunidad, state: el.estadounidadej }));
        await fetchAndStore(`${API_BASE_URL}/rubrosplaneacion`, 'rubrosList', el => ({ id: el.idrubropl, name: el.nombre, state: el.estado }));
        await fetchAndStore(`${API_BASE_URL}/factoresfines`, 'factoresList', el => ({
            id: el.idfactor,
            name: el.nombrefacfin,
            secuencial: el.secuencial,
            relacionfin: el.relacionfin,
            relacionfactor: el.relacionfactor,
            facintegral: el.facintegral,
            eje: el.eje,
            idplan: el.idplan,
        }));
        await fetchAndStore(`${API_BASE_URL}/parametros/tipo/4`, 'tipoRubroList', el => ({
            id: el.idparametro, tipo: el.tipo, name: el.valor, description: el.descripcion, secuencial: el.secuencial
        }));
        await fetchAndStore(`${API_BASE_URL}/parametros/tipo/1`, 'estadosGenList', el => ({
            id: el.idparametro, tipo: el.tipo, name: el.valor, description: el.descripcion, secuencial: el.secuencial
        }));
        await fetchAndStore(`${API_BASE_URL}/parametros/tipo/2`, 'estadosEjeList', el => ({
            id: el.idparametro, tipo: el.tipo, name: el.valor, description: el.descripcion, secuencial: el.secuencial, state: el.state
        }));
        await fetchAndStore(`${API_BASE_URL}/parametros/tipo/6`, 'estadoSegList', el => ({
            id: el.idparametro, tipo: el.tipo, name: el.valor, description: el.descripcion, secuencial: el.secuencial, state: el.state
        }));
        await fetchAndStore(`${API_BASE_URL}/seguimientos`, 'seguimientosList');

        setLoading(false);
        router.push(paths.dashboard.root);
    };

    function signOutClickHandler() {

        
        removeStorage("perfilUser");
        removeStorage("user");
        removeStorage("arrayRoles");
        removeStorage("parametricas");


        const logoutRequest = {
            account: accounts[0],
            postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
        };
        instance.logoutRedirect(logoutRequest);
    }

    useEffect(() => {
        const init = async () => {
            if (accounts.length === 0) return;

            const email = accounts[0]?.username;
            if (!email) {
                console.error("Email no disponible en accounts[0]");
                setUsuarioNoEncontrado(true);
                return;
            }

            const usuario = await fetchUsuario(email);
            if (!usuario) {
                setUsuarioNoEncontrado(true);
                toast.error('Usuario no registrado. Por favor inicie sesión nuevamente.');
                return;
            }

            await getParametricas();
        };

        if (error) {
            login(InteractionType.Redirect, request);
        } else if (result && accounts.length > 0) {
            init();
        }
    }, [error, result, accounts]);

    return (
        <AuthenticatedTemplate>
            <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column', alignItems: "center" }}>
                {usuarioNoEncontrado ? (
                    <>
                        <Typography variant="h3" sx={{ mb: 2 }}>
                            Autenticación exitosa
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            {accounts[0]?.username}
                        </Typography>
                        <Typography variant="h4" color="error" sx={{ mb: 2 }}>
                            Usuario no registrado
                        </Typography>
                        <Button variant="outlined" color="error" onClick={signOutClickHandler}>
                            Cerrar sesión
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography variant="h3" sx={{ mb: 2 }}>
                            Autenticación exitosa
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                            {accounts[0]?.username}
                        </Typography>

                    </>
                )}
            </Box>
        </AuthenticatedTemplate>
    );
}
