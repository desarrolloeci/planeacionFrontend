import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';

import { getPerfiles, getRoles } from 'src/utils/apiRequests';

import { Field } from 'src/components/hook-form';



export function PerfilesNewEditGeneral() {
  const { watch } = useFormContext();

  const values = watch();

  const [arrayRoles, setArrayRoles] = useState([])

  useEffect(() => {

    
    getRolesList()


  }, []);

  const getRolesList = async () => {


    var requestResult = await getRoles();

    var array = [];
    requestResult.forEach(element => {

      var a = {
        label: element.description,
        value: element.id
      }
      array.push(a)
    });



    setArrayRoles(array);



  }


  return (
    <>
      <Box
        sx={{
          p: 3,
          gap: 2,
          display: 'flex',
          bgcolor: 'background.neutral',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Field.Text name="description" label="Descripción" />
        <Field.Text name="code_profile" label="Código" />

      </Box>
      <Box
        sx={{
          p: 3,
          gap: 2,
          display: 'flex',
          bgcolor: 'background.neutral',
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2">Roles</Typography>
          <Field.MultiCheckbox
            name="items"
            options={arrayRoles}
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}
          />
        </Stack>
      </Box>
    </>
  );
}
