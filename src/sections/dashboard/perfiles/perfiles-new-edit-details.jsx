import { sumBy } from 'es-toolkit';
import { useEffect, useCallback } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { inputBaseClasses } from '@mui/material/InputBase';

import { INVOICE_SERVICE_OPTIONS } from 'src/_mock';

import { Field } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';




const ROLES = [
  { label: 'Rol 1', value: '1' },
  { label: 'Rol 2', value: '2' }]

export function PerfilesNewEditDetails() {
  const { watch } = useFormContext();

  const values = watch();

  return (
    <Box sx={{ p: 3 }}>

      <Stack spacing={1}>
        <Typography variant="subtitle2">Roles</Typography>
        <Field.MultiCheckbox
          name="items"
          options={ROLES}
          sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)' }}
        />
      </Stack>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />




    </Box>
  );
}



export function RolItem({ onRemoveItem, fieldNames }) {
  const { getValues, setValue } = useFormContext();


  return (
    <Box
      sx={{
        gap: 1.5,
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'row',
      }}
    >
      <Box
        sx={{
          gap: 2,
          width: 1,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >


        <Field.Select
          size="small"
          name={fieldNames.id}
          label="Rol"
          slotProps={{ inputLabel: { shrink: true } }}
          sx={{ maxWidth: { md: 160 } }}
        >
          <MenuItem
            value=""
            sx={{ fontStyle: 'italic', color: 'text.secondary' }}
          >
            None
          </MenuItem>

          <Divider sx={{ borderStyle: 'dashed' }} />
          {ROLES.map((roles) => (
            <MenuItem
              key={roles.id}
              value={roles.id}
            >
              {roles.description}
            </MenuItem>
          ))}

        </Field.Select>


      </Box>

      <Button
        size="small"
        color="error"
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        onClick={onRemoveItem}
      >
        Borrar
      </Button>
    </Box>
  );
}
