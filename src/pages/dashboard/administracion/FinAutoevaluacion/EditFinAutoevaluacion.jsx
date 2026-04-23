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

import EditFinAutoevaluacionForm from './EditFinAutoevaluacionForm';




const metadata = { title: `Editar fin de autoevaluación | Dashboard - ${CONFIG.appName}` };


export default function EditFinAutoevaluacion() {
  const { id = '' } = useParams();

  const [registroEditar, setRegistroEditar] = useState()


  useEffect(() => {


    getRegistro()


  }, []);

  const getRegistro = async () => {

    var editarRegistro = {
      idfactor: 1,
      nombrefacfin: "Acreditación Institucional",
      secuencial: "1",

    }

    setRegistroEditar(editarRegistro)

  }


  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EditFinAutoevaluacionForm registroEditar={registroEditar} />



    </>
  );
}
