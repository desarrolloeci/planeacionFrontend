import sign from 'jwt-encode';
import { removeStorage } from 'minimal-shared/utils';

import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { JWT_STORAGE_KEY } from './constant';





export const signInWithPassword = async ({ email }) => {
  try {
    const params = { email };

    const secret = import.meta.env.VITE_APP_SECRET_KEY;

    var date = new Date();
    var fechaExp = addDays(date, 5)
    var milliseconds = fechaExp.getTime();

    const object = {
      email: email,
      exp: milliseconds
    }

    const accessToken = sign(object, secret);



    setSession(accessToken);




  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}





export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(JWT_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};





export const signOut = async () => {
  try {

    await setSession(null);
    removeStorage("arrayRoles")

  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};
