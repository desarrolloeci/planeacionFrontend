import { Helmet } from 'react-helmet-async';

import { CONFIG } from 'src/global-config';

import { RolesCreateView } from 'src/sections/dashboard/roles/roles-create-view';






const metadata = { title: `Crear rol | Dashboard - ${CONFIG.appName}` };

export default function CreateRoles() {
    return (
        <>
            <Helmet>
                <title> {metadata.title}</title>
            </Helmet>

            <RolesCreateView />
        </>
    );
}
