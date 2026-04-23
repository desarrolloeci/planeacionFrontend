import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { UsuariosCreateView } from 'src/sections/dashboard/usuarios/usuarios-create-view';






const metadata = { title: `Crear usuario | Dashboard - ${CONFIG.appName}` };

export default function CreateUsuarios() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <UsuariosCreateView />
        </>
    );
}
