import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { PerfilesCreateView } from 'src/sections/dashboard/perfiles/perfiles-create-view';







const metadata = { title: `Crear perfil | Dashboard - ${CONFIG.appName}` };

export default function CreatePerfiles() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <PerfilesCreateView />

        </>
    );
}
