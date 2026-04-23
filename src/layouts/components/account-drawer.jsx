import { varAlpha } from 'minimal-shared/utils';
import { useBoolean } from 'minimal-shared/hooks';
import { getStorage as getStorageValue } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Avatar from '@mui/material/Avatar';
import Drawer from '@mui/material/Drawer';
import Tooltip from '@mui/material/Tooltip';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { _mock } from 'src/_mock';
import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { AnimateBorder } from 'src/components/animate';

import { UpgradeBlock } from './nav-upgrade';
import { AccountButton } from './account-button';
import { SignOutButton } from './sign-out-button';



export function AccountDrawer({ data = [], sx, ...other }) {
  const usuario = JSON.parse(getStorageValue("user")); 

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();

  const renderAvatar = () => (
    <AnimateBorder
      sx={{ mb: 2, p: '6px', width: 96, height: 96, borderRadius: '50%' }}
      slotProps={{
        primaryBorder: { size: 120, sx: { color: 'primary.main' } },
      }}
    >
      <Avatar sx={{ width: 1, height: 1 }}>
        {usuario?.name?.charAt(0).toUpperCase()}
      </Avatar>
    </AnimateBorder>
  );

  return (
    <>
      <AccountButton
        onClick={onOpen}
        displayName={usuario?.name}
        sx={sx}
        {...other}
      />

      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{ sx: { width: 320 } }}
      >
        {}
        <IconButton
          onClick={onClose}
          sx={{
            top: 12,
            left: 12,
            zIndex: 9,
            position: 'absolute',
          }}
        >
          <Iconify icon="mingcute:close-line" />
        </IconButton>

        <Scrollbar>
          <Box
            sx={{
              pt: 8,
              display: 'flex',
              alignItems: 'center',
              flexDirection: 'column',
            }}
          >


            {}
            {renderAvatar()}

            {}
            <Typography variant="subtitle1" noWrap sx={{ mt: 1 }}>
              {usuario?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }} noWrap>
              {usuario?.email}
            </Typography>
          </Box>

          {}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>ID:</strong> {usuario?.id}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Perfil:</strong> {usuario?.perfil}
            </Typography>
          </Box>
        </Scrollbar>

        {}
        <Box sx={{ p: 2.5 }}>
          <SignOutButton onClose={onClose} />
        </Box>
      </Drawer>
    </>
  );
}
