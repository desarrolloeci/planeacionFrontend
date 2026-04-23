import { useCallback } from 'react';
import { useMsal } from '@azure/msal-react';
import { removeStorage } from 'minimal-shared/utils';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';
import { signOut } from 'src/auth/context/jwt/action';



export function SignOutButton({ onClose, sx, ...other }) {
  const router = useRouter();

  const { instance, accounts } = useMsal();



  function signOutClickHandler() {

    
    removeStorage("perfilUser");
    removeStorage("user");
    removeStorage("arrayRoles");
    removeStorage("parametricas");


    const logoutRequest = {
      account: accounts[0],
      postLogoutRedirectUri: import.meta.env.VITE_POST_LOGOUT_REDIRECT_URI,
    };
    instance.logoutRedirect(logoutRequest);
  }



  return (
    <Button
      fullWidth
      variant="soft"
      size="large"
      color="error"
      onClick={signOutClickHandler}
      sx={sx}
      {...other}
    >
      Cerrar sesión
    </Button>
  );
}
