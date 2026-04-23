import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

import { useParams } from 'src/routes/hooks';

import { getUsuarioById } from 'src/utils/apiRequests';

import { CONFIG } from 'src/global-config';
import { _userList } from 'src/_mock/_user';

import { UsuariosEditView } from 'src/sections/dashboard/usuarios/usuarios-edit-view';






const metadata = { title: `Editar usuario | Dashboard - ${CONFIG.appName}` };

export default function EditUsuarios() {
  const { id = '' } = useParams();

  const [currentTipo, setCurrentTipo] = useState();

  useEffect(() => {


    getRegistro()


  }, []);

  const getRegistro = async () => {

    var editarRegistro = await getUsuarioById(id)

    setCurrentTipo(editarRegistro)

  }

  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <UsuariosEditView currentTipo={currentTipo} />

    </>
  );
}
