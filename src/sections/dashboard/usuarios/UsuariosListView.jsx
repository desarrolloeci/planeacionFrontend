import axios from 'axios';
import moment from 'moment';
import sign from 'jwt-encode';
import { useState, useCallback } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';
import { _roles, _userList, USER_STATUS_OPTIONS } from 'src/_mock';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
    useTable,
    emptyRows,
    rowInPage,
    TableNoData,
    getComparator,
    TableEmptyRows,
    TableHeadCustom,
    TableSelectedAction,
    TablePaginationCustom,
} from 'src/components/table';

import { UsuariosToolbar } from './usuarios-toolbar';
import { UsuariosTableRow } from './usuarios-table-row';
import { UsuariosFiltersResult } from './usuarios-filters-result';

const TABLE_HEAD = [
    { id: 'identificador', label: 'Identificador', align: 'left' },
    { id: 'name', label: 'Nombre', align: 'left' },
    { id: 'email', label: 'Email', align: 'left' },
    { id: 'perfilName', label: 'Perfil', align: 'left' },
    { id: '', width: 88 },
];



export function UsuariosListView({ arrayUsuarios }) {

    const table = useTable();

    const confirmDialog = useBoolean();

    const [tableData, setTableData] = useState(arrayUsuarios);

    const filters = useSetState({ name: '' });
    const { state: currentFilters, setState: updateFilters } = filters;

    const dataFiltered = applyFilter({
        inputData: tableData,
        comparator: getComparator(table.order, table.orderBy),
        filters: currentFilters,
    });

    const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

    const canReset =
        !!currentFilters.name;

    const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

    const handleDeleteRow = useCallback(
        (id) => {
            const deleteRow = tableData.filter((row) => row.id !== id);

            const baseURL = import.meta.env.VITE_APP_BACK_URL;
            const secret = import.meta.env.VITE_APP_SECRET_KEY;


            const dataToSave = {
                id: Number(id)
            }


            const jwt = sign(dataToSave, secret);




            let dataJSON = JSON.stringify(jwt);

            let config = {
                method: 'DELETE',
                maxBodyLength: Infinity,
                url: `${baseURL}/User`,
                headers: {
                    'Content-Type': 'application/json'
                },
                data: dataJSON
            };

            axios.request(config)
                .then((response) => {
                    toast.success('Se eliminó correctamente el registro!');

                    setTableData(deleteRow);

                    table.onUpdatePageDeleteRow(dataInPage.length);
                });
        },
        [dataInPage.length, table, tableData]
    );

    const handleDeleteRows = useCallback(() => {
        const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

        toast.success('Se eliminó correctamente el registro!');

        setTableData(deleteRows);

        table.onUpdatePageDeleteRows(dataInPage.length, dataFiltered.length);
    }, [dataFiltered.length, dataInPage.length, table, tableData]);

    const handleFilterStatus = useCallback(
        (event, newValue) => {
            table.onResetPage();
            updateFilters({ status: newValue });
        },
        [updateFilters, table]
    );

    const renderConfirmDialog = () => (
        <ConfirmDialog
            open={confirmDialog.value}
            onClose={confirmDialog.onFalse}
            title="Eliminar"
            content={
                <>
                    ¿Esta seguro de querer eliminar <strong> {table.selected.length} </strong> registros?
                </>
            }
            action={
                <Button
                    variant="contained"
                    color="error"
                    onClick={() => {
                        handleDeleteRows();
                        confirmDialog.onFalse();
                    }}
                >
                    Eliminar
                </Button>
            }
        />
    );


    return (
        <>

            <DashboardContent>
                <CustomBreadcrumbs
                    heading="Usuarios"
                    links={[
                        { name: 'Dashboard', href: paths.dashboard.root },
                        { name: 'Usuarios' },
                    ]}
                    action={
                        <Button
                            component={RouterLink}
                            href={paths.dashboard.administracion.newUsuarios}
                            variant="contained"
                            color="primary"
                            startIcon={<Iconify icon="mingcute:add-line" />}
                        >
                            Nuevo usuario
                        </Button>
                    }
                    sx={{ mb: { xs: 3, md: 5 } }}
                />

                <UsuariosToolbar
                    filters={filters}
                    onResetPage={table.onResetPage}
                    options={{ roles: _roles }}
                />

                {canReset && (
                    <UsuariosFiltersResult
                        filters={filters}
                        totalResults={dataFiltered.length}
                        onResetPage={table.onResetPage}
                        sx={{ p: 2.5, pt: 0 }}
                    />
                )}

                <Box sx={{ position: 'relative' }}>
                    <TableSelectedAction
                        dense={table.dense}
                        numSelected={table.selected.length}
                        rowCount={dataFiltered.length}
                        action={
                            <Tooltip title="Eliminar">
                                <IconButton color="primary" onClick={confirmDialog.onTrue}>
                                    <Iconify icon="solar:trash-bin-trash-bold" />
                                </IconButton>
                            </Tooltip>
                        }
                    />

                    <Scrollbar>
                        <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                            <TableHeadCustom
                                order={table.order}
                                orderBy={table.orderBy}
                                headCells={TABLE_HEAD}
                                rowCount={dataFiltered.length}
                                numSelected={table.selected.length}
                                onSort={table.onSort}

                            />

                            <TableBody>
                                {dataFiltered
                                    .slice(
                                        table.page * table.rowsPerPage,
                                        table.page * table.rowsPerPage + table.rowsPerPage
                                    )
                                    .map((row) => (
                                        <UsuariosTableRow
                                            key={row.id}
                                            row={row}
                                            selected={table.selected.includes(row.id)}
                                            onSelectRow={() => table.onSelectRow(row.id)}
                                            onDeleteRow={() => handleDeleteRow(row.id)}
                                            editHref={paths.dashboard.administracion.editUsuarios(row.id)}
                                        />
                                    ))}

                                <TableEmptyRows
                                    height={table.dense ? 56 : 56 + 20}
                                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                                />

                                <TableNoData notFound={notFound} />
                            </TableBody>
                        </Table>
                    </Scrollbar>
                </Box>

                <TablePaginationCustom
                    page={table.page}
                    dense={table.dense}
                    count={dataFiltered.length}
                    rowsPerPage={table.rowsPerPage}
                    onPageChange={table.onChangePage}
                    onChangeDense={table.onChangeDense}
                    onRowsPerPageChange={table.onChangeRowsPerPage}
                />
                {renderConfirmDialog()}
            </DashboardContent>
        </>
    )

}

function applyFilter({ inputData, comparator, filters }) {
    const { name } = filters;

    const stabilizedThis = inputData.map((el, index) => [el, index]);

    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });

    inputData = stabilizedThis.map((el) => el[0]);

    if (name) {
        inputData = inputData.filter((user) => user.name.toLowerCase().includes(name.toLowerCase()));
    }

    return inputData;
}
