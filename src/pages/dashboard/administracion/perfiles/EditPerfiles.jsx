import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { getPerfilById } from 'src/utils/apiRequests';

import { CONFIG } from 'src/global-config';
import { _userList } from 'src/_mock/_user';

import { PerfilesEditView } from 'src/sections/dashboard/perfiles/perfiles-edit-view';







const metadata = { title: `Editar perfil | Dashboard - ${CONFIG.appName}` };

export default function EditPerfiles() {
  const { id = '' } = useParams();

  const [currentTipo, setCurrentTipo] = useState();

  useEffect(() => {


    getRegistro()


  }, []);

  const getRegistro = async () => {

    var editarRegistro = await getPerfilById(id)

    setCurrentTipo(editarRegistro)

  }
  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <PerfilesEditView currentTipo={currentTipo} />
    </>
  );
}
