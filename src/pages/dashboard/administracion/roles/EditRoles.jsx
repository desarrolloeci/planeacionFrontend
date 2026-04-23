import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { getRolById } from 'src/utils/apiRequests';

import { CONFIG } from 'src/global-config';
import { _userList } from 'src/_mock/_user';

import { RolesEditView } from 'src/sections/dashboard/roles/roles-edit-view';






const metadata = { title: `Editar rol | Dashboard - ${CONFIG.appName}` };

export default function EditRoles() {
  const { id = '' } = useParams();

  const [currentTipo, setCurrentTipo] = useState();

  useEffect(() => {


    getRegistro()


  }, []);

  const getRegistro = async () => {

    var editarRegistro = await getRolById(id)

    setCurrentTipo(editarRegistro)

  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <RolesEditView currentTipo={currentTipo} />

    </>
  );
}
