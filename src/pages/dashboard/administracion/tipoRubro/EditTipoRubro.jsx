import { API_BASE_URL } from 'src/config/api';
import { z as zod } from 'zod';
import { useParams } from 'react-router';
import { TickCircle } from 'iconsax-react';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { getStorage as getStorageValue, setStorage } from 'minimal-shared/utils';

import { LoadingButton } from '@mui/lab';
import { Box, Card, Stack, Grid } from '@mui/material';

import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { Form, Field, schemaHelper } from 'src/components/hook-form';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import EditTipoRubroForm from './EditTipoRubroForm';




const metadata = { title: `Editar tipo de rubro | Dashboard - ${CONFIG.appName}` };


export default function EditEjes() {
  const { id = '' } = useParams();

  const [registroEditar, setRegistroEditar] = useState()



  useEffect(() => {


    getRegistro()


  }, []);

  const getRegistro = async () => {

    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/parametros/` + id, requestOptions)
      .then((response) => response.text())
      .then((result) => {

        var resultJSON = JSON.parse(result)

        var a = {
          id: resultJSON.idparametro,
          tipo: resultJSON.tipo,
          name: resultJSON.valor,
          description: resultJSON.descripcion,
          secuencial: resultJSON.secuencial
        }

        setRegistroEditar(a)

      })
      .catch((error) => console.error(error));




  }


  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EditTipoRubroForm registroEditar={registroEditar} />



    </>
  );
}
