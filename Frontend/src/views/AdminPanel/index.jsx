import CustomTable from "components/CustomTable";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useAuth } from "shared/context/authContext";
import axiosInstance from "shared/services/axiosInstance";
import { BACKEND_ADDRESS } from "shared/utils/common/constants";
import { getAuthAndJsonHeader } from "shared/utils/common/utils";

const { Container, Typography, CircularProgress, Box } = require("@mui/material");
const { useEffect, useState } = require("react");

const AdminPanel = () => {
  const [user, setUser] = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [dataForTable, setDataForTable] = useState();
  const navigate = useHistory();
  if (user.isAdministrator === false) {
    navigate.push("/gene-mapper");
  }

  // Function to fetch user permissions and requests from the backend
  const fetchPermissions = async () => {
    const response = await axiosInstance.get("/users");

    if (response.status !== 200) {
      throw Error("Couldn't fetch user permissions");
    }
    // console.log("response is ", response.data);

    const tableData = makeUserDataFromResponse(response);
    setDataForTable(tableData);
  };

  const togglePermission = async (userId, value) => {
    // Update the user's permissions in the state
    try {
      const response = await fetch(
        `${BACKEND_ADDRESS}/users/${userId}/permission`,
        {
          method: "PUT",
          headers: getAuthAndJsonHeader(),
          body: JSON.stringify({
            id: userId,
            permission: value,
          }),
        }
      );
      console.log(response);

      fetchPermissions();
    } catch (error) {
      console.log("error in togglePermission", error);
    }
  };

  const compareUsers = (a, b) => {
    if (a.permissionRequested && !b.permissionRequested) {
      return -1; // a comes first if permissionRequested is true and b's is false
    }
    if (a.isAdministrator && !b.isAdministrator) {
      return -1; // a comes first if isAdministrator is true and b's is false
    }
    return 0; // otherwise, preserve the original order
  };

  const makeUserDataFromResponse = (response) => {
    let userData = [];

    if (response.data) {
      response.data.forEach((user) => {
        userData.push({
          id: user._id,
          email: user.email,
          permissionRequested: user.permissionRequested
            ? user.permissionRequested
            : false,
          hasPermission: user.hasPermission ? user.hasPermission : false,
          isAdministrator: user.isAdministrator ? user.isAdministrator : false,
        });
      });

      userData.sort(compareUsers);
    }

    const dataForTable = {
      data: userData,
      togglePermission: togglePermission,
    };
    return dataForTable;
  };

  useEffect(() => {
    setIsLoading(true);
    fetchPermissions();
    setIsLoading(false);

    console.log("useEffect");
  }, []);

  

  return (
    <Container>
      <div
        style={{
          textAlign: "center",
          background: "#f2f2f2",
          padding: "10px",
          marginBottom: "20px",
          border: "1px solid #ccc",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          marginLeft: 80,
        }}
      >
        <Typography variant="h4" style={{ display: "inline-block" }}>
          Admin Panel
        </Typography>
      </div>
      {dataForTable ? (
        <CustomTable {...dataForTable} togglePermission={togglePermission} />
      ) : (
        <Box sx={{ display: "flex" }}>
          <CircularProgress />
        </Box>

      )}
      <></>
    </Container>
  );
};

export default AdminPanel;
