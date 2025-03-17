import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchEmployees,
  updateEmployee,
  deleteEmployee,
  resetUpdateStatus,
} from "../../redux/features/employeesSlice";
import DataTable from "../MuiComponents/DataTable";


const BdmUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchEmployees());
  }, [dispatch]);

  const { employeesList, fetchStatus, fetchError } = useSelector(
    (state) => state.employees
  );

  // Filter employees with the "BDM" role
  const bdmUsers = employeesList.filter((employee) =>
    employee.roles.includes("BDM")
  );

  const columns = [
    { key: "employeeId", label: "Employee ID", type: "select" },
    { key: "userName", label: "User Name", type: "text" },
    { key: "roles", label: "Roles", type: "select" },
    { key: "email", label: "Email", type: "text" },
    { key: "designation", label: "Designation", type: "text" },
    { key: "joiningDate", label: "Joining Date", type: "select" },
    { key: "gender", label: "Gender", type: "select" },
    { key: "dob", label: "Date of Birth", type: "select" },
    { key: "phoneNumber", label: "Phone Number", type: "text" },
    { key: "personalemail", label: "Personal Email", type: "text" },
    { key: "status", label: "Status", type: "select" },
   
  ];

  return (
    <div>
      <DataTable
        data={bdmUsers} // Pass the filtered list
        columns={columns}
        title="BDM Users List"
      />
    </div>
  );
};

export default BdmUsers;
