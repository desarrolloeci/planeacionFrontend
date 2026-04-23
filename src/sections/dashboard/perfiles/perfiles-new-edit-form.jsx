import axios from 'axios';
import moment from 'moment';
import sign from 'jwt-encode';
import { z as zod } from 'zod';
import { jwtDecode } from "jwt-decode";
import { useForm } from 'react-hook-form';
import { useBoolean } from 'minimal-shared/hooks';
import { zodResolver } from '@hookform/resolvers/zod';
import { getStorage as getStorageValue } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import LoadingButton from '@mui/lab/LoadingButton';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { today, fIsAfter } from 'src/utils/format-time';

import { _addressBooks } from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Form, schemaHelper } from 'src/components/hook-form';

import { useMockedUser, useAuthContext } from 'src/auth/hooks';

import { PerfilesNewEditGeneral } from './perfiles-new-edit-general';
import { PerfilesNewEditDetails } from './perfiles-new-edit-details';






export const NewInvoiceSchema = zod
  .object({
    items: zod.array(zod.number()).min(1, { message: 'Debe seleccionar al menos un rol' }),
    code_profile: zod.string().min(1, { message: 'Required!' }),
    description: zod.string().min(1, { message: 'Required!' }),
  })
  ;



export function PerfilesNewEditForm({ currentTipo }) {
  const router = useRouter();
  const user = JSON.parse(getStorageValue("user"))

  const loadingSave = useBoolean();
  const loadingSend = useBoolean();

  const defaultValues = {

    description: '',
    code_profile: '',
    items: [],
  };

  const methods = useForm({
    mode: 'all',
    resolver: zodResolver(NewInvoiceSchema),
    defaultValues,
    values: currentTipo,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;


  const handleCreateAndSend = handleSubmit(async (data) => {
    loadingSend.onTrue();


    try {

      const secret = import.meta.env.VITE_APP_SECRET_KEY;

      const baseURL = import.meta.env.VITE_APP_BACK_URL;




      if (!currentTipo) {

        const dataToSave = {
          description: data.description,
          code_profile: data.code_profile,
          created_at: moment(new Date()).format("YYYY-MM-DD"),
          created_user_id: Number(user.id),
          updated_at: moment(new Date()).format("YYYY-MM-DD"),
          updated_user_id: Number(user.id)
        }


        const jwt = sign(dataToSave, secret);




        let dataJSON = JSON.stringify(jwt);



        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${baseURL}/Profile`,
          headers: {
            'Content-Type': 'application/json'
          },
          data: dataJSON
        };

        axios.request(config)
          .then((response) => {


            const decoded = jwtDecode(response.data);
            const decodedJSON = JSON.parse(decoded.data)

            const roles2 = data.items;



            roles2.forEach(element => {


              const dataToSaveEditR2 = {
                profile_id: decodedJSON.id,
                role_id: element,
                created_at: moment(new Date()).format("YYYY-MM-DD"),
                created_user_id: Number(user.id),
                updated_at: moment(new Date()).format("YYYY-MM-DD"),
                updated_user_id: Number(user.id)
              }


              const jwtEditR2 = sign(dataToSaveEditR2, secret);




              let dataJSONEditR2 = JSON.stringify(jwtEditR2);

              let configEditR2 = {
                method: 'POST',
                maxBodyLength: Infinity,
                url: `${baseURL}/ProfileRole`,
                headers: {
                  'Content-Type': 'application/json'
                },
                data: dataJSONEditR2
              };

              axios.request(configEditR2)
                .then((responseR) => {



                });


            });


            toast.success(currentTipo ? 'Se actualizó correctamente!' : 'Se creó correctamente!');
            router.back()
          });

      } else {

        const dataToSaveEdit = {
          id: currentTipo ? currentTipo.id : null,
          description: data.description,
          code_profile: data.code_profile,
          
          created_at: moment(new Date()).format("YYYY-MM-DD"),
          created_user_id: Number(user.id),
          updated_at: moment(new Date()).format("YYYY-MM-DD"),
          updated_user_id: Number(user.id)
        }


        const jwtEdit = sign(dataToSaveEdit, secret);




        let dataJSONEdit = JSON.stringify(jwtEdit);

        let configEdit = {
          method: 'put',
          maxBodyLength: Infinity,
          url: `${baseURL}/Profile/${currentTipo.id}`,
          headers: {
            'Content-Type': 'application/json'
          },
          data: dataJSONEdit
        };

        axios.request(configEdit)
          .then((response) => {

            const roles = data.items;



            roles.forEach(element => {


              const dataToSaveEditR = {
                profile_id: currentTipo ? currentTipo.id : null,
                role_id: element,
                created_at: moment(new Date()).format("YYYY-MM-DD"),
                created_user_id: Number(user.id),
                updated_at: moment(new Date()).format("YYYY-MM-DD"),
                updated_user_id: Number(user.id)
              }


              const jwtEditR = sign(dataToSaveEditR, secret);




              let dataJSONEditR = JSON.stringify(jwtEditR);

              let configEditR = {
                method: 'POST',
                maxBodyLength: Infinity,
                url: `${baseURL}/ProfileRole`,
                headers: {
                  'Content-Type': 'application/json'
                },
                data: dataJSONEditR
              };

              axios.request(configEditR)
                .then((responseR) => {



                });


            });


            toast.success(currentTipo ? 'Se actualizó correctamente!' : 'Se creó correctamente!');
            router.back()


          })

      }

    }



    catch (error) {
      console.error(error);
      loadingSend.onFalse();
    }
  });

  return (
    <Form methods={methods}>

      <Card>
        <PerfilesNewEditGeneral />

      </Card>

      <Box
        sx={{
          mt: 3,
          gap: 2,
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >




        <LoadingButton
          size="large"
          variant="contained"
          loading={isSubmitting}
          onClick={handleCreateAndSend}
        >
          {currentTipo ? 'Actualizar' : 'Crear'}
        </LoadingButton>
      </Box>
    </Form>
  );
}
