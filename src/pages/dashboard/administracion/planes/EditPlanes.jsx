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

import EditPlanesForm from './EditPlanesForm';




const metadata = { title: `Editar plan | Dashboard - ${CONFIG.appName}` };


export default function EditPlanes() {
  const { id = '' } = useParams();

  const [planEditar, setPlanEditar] = useState()


  useEffect(() => {


    getRegistro()


  }, []);

  const getRegistro = async () => {

    const requestOptions = {
      method: "GET",
      redirect: "follow"
    };

    fetch(`${API_BASE_URL}/planes/` + id, requestOptions)
      .then((response) => response.text())
      .then((result) => {

        var resultJSON = JSON.parse(result)

        var a = {
          id: resultJSON.idplan,
          name: resultJSON.nombrepl,
          state: resultJSON.estadopl === 1 ? true : false
        }
        setPlanEditar(a)

      })
      .catch((error) => console.error(error));



  }


  return (
    <>
      <Helmet>
        <title> {metadata.title}</title>
      </Helmet>

      <EditPlanesForm editPlan={planEditar} />



    </>
  );
}
