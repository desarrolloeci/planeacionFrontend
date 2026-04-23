import 'dayjs/locale/en';
import 'dayjs/locale/vi';
import 'dayjs/locale/fr';
import 'dayjs/locale/zh-cn';
import 'dayjs/locale/ar-sa';

import dayjs from 'dayjs';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider as Provider } from '@mui/x-date-pickers/LocalizationProvider';




export function LocalizationProvider({ children }) {

  dayjs.locale("ES");

  return (
    <Provider dateAdapter={AdapterDayjs} adapterLocale="ES">
      {children}
    </Provider>
  );
}
