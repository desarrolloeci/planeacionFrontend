import axios from 'axios';
import moment from 'moment';
import sign from 'jwt-encode';
import { z as zod } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { isValidPhoneNumber } from 'react-phone-number-input/input';
import { getStorage as getStorageValue } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid2';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';
import { getPerfiles, getRoles } from 'src/utils/apiRequests';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useMockedUser, useAuthContext } from 'src/auth/hooks';



export const NewTipoSchema = zod.object({
  name: zod.string().min(1, { message: 'Requerido!' }),
  perfil: zod.number().min(1, { message: 'Requerido!' }),
  email: zod.string().min(1, { message: 'Requerido!' }).email("Debe ser un correo valido"),
});



export function UsuariosNewEditForm({ currentTipo }) {
  const router = useRouter();
  const user = JSON.parse(getStorageValue("user"))
  const defaultValues = {
    name: '',
    email: '',
    perfil: ''
  };

  const [perfilesList, setPerfilesList] = useState([])
  useEffect(() => {


    getPerfilesList()


  }, []);

  const getPerfilesList = async () => {


    var requestResult = await getPerfiles();

    var array = [];
    requestResult.forEach(element => {

      var a = {
        label: element.description,
        value: element.id
      }
      array.push(a)
    });



    setPerfilesList(array);



  }


  const methods = useForm({
    mode: 'onSubmit',
    resolver: zodResolver(NewTipoSchema),
    defaultValues,
    values: currentTipo,
  });

  const {
    reset,
    watch,
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      const secret = import.meta.env.VITE_APP_SECRET_KEY;
      const baseURL = import.meta.env.VITE_APP_BACK_URL;




      if (!currentTipo) {

        const dataToSave = {
          name: data.name,
          mail: data.email,
          profile_id: data.perfil,
          created_at: moment(new Date()).format("YYYY-MM-DD"),
          created_user_id: Number(user.id),
          updated_user_id: Number(user.id)
        }


        const jwt = sign(dataToSave, secret);




        let dataJSON = JSON.stringify(jwt);



        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${baseURL}/User`,
          headers: {
            'Content-Type': 'application/json'
          },
          data: dataJSON
        };

        axios.request(config)
          .then((response) => {
            toast.success(currentTipo ? 'Se actualizó correctamente!' : 'Se creó correctamente!');
            router.back()
          });

      } else {

        const dataToSaveEdit = {
          id: currentTipo ? currentTipo.id : '',
          name: data.name,
          mail: data.email,
          profile_id: data.perfil,
          updated_at: moment(new Date()).format("YYYY-MM-DD"),
          updated_user_id: Number(user.id)
        }


        const jwtEdit = sign(dataToSaveEdit, secret);




        let dataJSONEdit = JSON.stringify(jwtEdit);

        let configEdit = {
          method: 'put',
          maxBodyLength: Infinity,
          url: `${baseURL}/User/${currentTipo.id}`,
          headers: {
            'Content-Type': 'application/json'
          },
          data: dataJSONEdit
        };

        axios.request(configEdit)
          .then((response) => {
            toast.success(currentTipo ? 'Se actualizó correctamente!' : 'Se creó correctamente!');
            router.back()
          });

      }

    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>


        <Grid size={{ xs: 12, md: 12, lg: 12 }}>

          <Card sx={{ p: 3 }}>
            <Box
              sx={{
                rowGap: 3,
                columnGap: 2,
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)' },
              }}
            >
              <Field.Text name="name" label="Nombre" />
              <Field.Text name="email" label="Email" />
              <Field.Select name="perfil" label="Perfil">
                {perfilesList.map((status) => (
                  <MenuItem key={status.value} value={status.value}>
                    {status.label}
                  </MenuItem>
                ))}
              </Field.Select>


            </Box>

            <Stack sx={{ mt: 3, alignItems: 'flex-end' }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentTipo ? 'Crear' : 'Actualizar'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Form>
  );
}
