import { useState } from "react";

const { KeyboardArrowRight, KeyboardArrowLeft } = require("@mui/icons-material");
const { Box, IconButton, useTheme, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, TableFooter, TablePagination, Switch } = require("@mui/material");
import LastPageIcon from "@mui/icons-material/LastPage";
import FirstPageIcon from "@mui/icons-material/FirstPage";
const { Paper } = require("@mui/material/Paper");


function TablePaginationActions(props) {
    const theme = useTheme();
    const { count, page, rowsPerPage, onPageChange } = props;
  
    const handleFirstPageButtonClick = (
      event
    ) => {
      onPageChange(event, 0);
    };
  
    const handleBackButtonClick = (
      event
    ) => {
      onPageChange(event, page - 1);
    };
  
    const handleNextButtonClick = (
      event
    ) => {
      onPageChange(event, page + 1);
    };
  
    const handleLastPageButtonClick = (
      event
    ) => {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };
  
    return (
      <Box sx={{ flexShrink: 0, ml: 2.5 }}>
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          {theme.direction === "rtl" ? <LastPageIcon /> : <FirstPageIcon />}
        </IconButton>
        <IconButton
          onClick={handleBackButtonClick}
          disabled={page === 0}
          aria-label="previous page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowRight />
          ) : (
            <KeyboardArrowLeft />
          )}
        </IconButton>
        <IconButton
          onClick={handleNextButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="next page"
        >
          {theme.direction === "rtl" ? (
            <KeyboardArrowLeft />
          ) : (
            <KeyboardArrowRight />
          )}
        </IconButton>
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={page >= Math.ceil(count / rowsPerPage) - 1}
          aria-label="last page"
        >
          {theme.direction === "rtl" ? <FirstPageIcon /> : <LastPageIcon />}
        </IconButton>
      </Box>
    );
  }

  // userData.push({
    // id: user._id,
    // email: user.email,
    // permissionRequested: user.permissionRequested ? user.permissionRequested : false,
    // hasPermission: user.hasPermission ? user.hasPermission : false,
    // isAdmin: user.isAdmin ? user.isAdmin : false,

  export default function CustomTable(props) {
    const { data, togglePermission } = props;
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    function handleTogglePermission(id, value) {
      // Update the user's permissions in the state
      console.log("Updating the permission of user with id", id, "to", value);
      togglePermission(id, value);
    }
  
    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
      page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;
  
    const handleChangePage = (
      event,
      newPage
    ) => {
      setPage(newPage);
    };
  
    const handleChangeRowsPerPage = (
      event
    ) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
  
    return (
      <TableContainer sx={{ margin: 10 }} component={Paper}>
        <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
          <TableHead>
            <TableRow>
              <TableCell>
                {" "}
                <b>Email</b>
              </TableCell>
              <TableCell align="right">
                <b>Role</b>
              </TableCell>
              <TableCell align="right">
                <b>Permission Requested</b>
              </TableCell>
              <TableCell align="right">
                <b>Permission</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : data
            ).map((row) => (
              <TableRow key={row.email}>
                <TableCell component="th" scope="row">
                  {row.email}
                </TableCell>
                <TableCell style={{ width: 160 }} align="right">
                  {row.isAdministrator ? "Admin" : "User"}
                </TableCell>
                <TableCell style={{ width: 160 }} align="right">
                  {row.permissionRequested ? "Yes" : "No"}
                </TableCell>
                <TableCell style={{ width: 160 }} align="right">
                {row.isAdministrator ? (
                    <Switch defaultChecked disabled />
                    ) : (
                    <Switch
                        checked={row.hasPermission}
                        onChange={(e) => {
                            console.log("Change called")                        
                            console.log("e.target.checked", e.target.checked);
                            handleTogglePermission(row.id, e.target.checked);

                        }}
                        // disabled={!row.permissionRequested}  // Disable the switch if permission is not requested
                    />
                    )}
                </TableCell>
              </TableRow>
            ))}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
                colSpan={3}
                count={data.length}
                rowsPerPage={rowsPerPage}
                page={page}
                SelectProps={{
                  inputProps: {
                    "aria-label": "rows per page",
                  },
                  native: true,
                }}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                ActionsComponent={TablePaginationActions}
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    );
  }