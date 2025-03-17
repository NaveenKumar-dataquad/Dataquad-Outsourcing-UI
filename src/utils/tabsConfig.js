// Updated tabsConfig.js with better icons

import WorkIcon from "@mui/icons-material/Work";
import AssignmentIcon from "@mui/icons-material/Assignment";
import GroupIcon from "@mui/icons-material/Group";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import InterpreterModeIcon from "@mui/icons-material/InterpreterMode";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BusinessIcon from "@mui/icons-material/Business";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import SendIcon from "@mui/icons-material/Send";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import GroupWorkIcon from "@mui/icons-material/GroupWork";
import DescriptionIcon from "@mui/icons-material/Description";

// Import components
import BdmUsers from "../components/Bdm/BdmUsers";
import Assigned from "../components/Tabs/Assigned";
import Submissions from "../components/Tabs/Submissions";
import Interview from "../components/Tabs/Interview";
import AttendanceTracker from "../components/AttendanceTracker";
import Planned from "../components/Tabs/Planned";
import Bench from "../components/Tabs/Bench";
import AddUser from "../components/Tabs/AddUser";
import AdminDashboard from "../components/AdminDashboard";
import Requirements from "../components/Requirements/Requirements";
import JobForm from "../components/Requirements/JobForm";
import UsersList from "../components/Tabs/UsersList";
import AllSubmissions from "../components/Tabs/AllSubmissions";
import AllInterviews from "../components/Tabs/AllInterviews";
import EmployeeTimesheet from "../components/EmployeeTimesheet";
import ClientForm from "../components/Bdm/ClientForm";
import Clients from "../components/Bdm/Clients";
import BdmMain from "../components/Bdm/BdmMain";

const TABS_BY_ROLE = {
  EMPLOYEE: [
    {
      label: "Assigned",
      value: "ASSIGNED",
      component: <Assigned />,
      icon: <WorkIcon />,
    },
    {
      label: "Submissions",
      value: "SUBMISSIONS",
      component: <Submissions />,
      icon: <SendIcon />,
    },
    {
      label: "Interview",
      value: "INTERVIEW",
      component: <Interview />,
      icon: <GroupIcon />,
    },
    {
      label: "Timesheet",
      value: "TIMESHEET",
      component: <AttendanceTracker />,
      icon: <AccessTimeIcon />,
    },
  ],
  ADMIN: [
    {
      label: "Timesheet",
      value: "TIMESHEET",
      component: <AttendanceTracker />,
      icon: <AccessTimeIcon />,
    },
    {
      label: "Planned",
      value: "PLANNED",
      component: <Planned />,
      icon: <HomeIcon />,
    },
    {
      label: "Bench",
      value: "BENCH",
      component: <Bench />,
      icon: <HourglassEmptyIcon />,
    },
    {
      label: "Add User",
      value: "ADDUSER",
      component: <AddUser />,
      icon: <PersonAddIcon />,
    },
  ],
  SUPERADMIN: [
    {
      label: "Dashboard",
      value: "DASHBOARD",
      component: <AdminDashboard />,
      icon: <DashboardIcon />,
    },
    {
      label: "Requirements ",
      value: "REQ_MANAGEMENT",
      icon: <AssignmentIcon />,
      isParent: true,
      children: [
        {
          label: "Requirements",
          value: "REQUIREMENTS",
          component: <Requirements />,
          icon: <AssignmentIcon />,
        },
        {
          label: "Job Form",
          value: "JOB_FORM",
          component: <JobForm />,
          icon: <AddCircleOutlineIcon />,
        },
        {
          label: "Submissions",
          value: "ALLSUBMISSIONS",
          component: <AllSubmissions />,
          icon: <SendIcon />,
        },
        {
          label: "Interviews",
          value: "ALLINTERVIEWS",
          component: <AllInterviews />,
          icon: <InterpreterModeIcon />,
        },
      ],
    },
    {
      label: "User Management",
      value: "USER_MANAGEMENT",
      icon: <PeopleIcon />,
      isParent: true,
      children: [
        {
          label: "Users",
          value: "USERS",
          component: <UsersList />,
          icon: <PeopleIcon />,
        },
        {
          label: "Add User",
          value: "ADDUSER",
          component: <AddUser />,
          icon: <PersonAddIcon />,
        },
        {
          label: "Bench",
          value: "BENCH",
          component: <Bench />,
          icon: <HourglassEmptyIcon />,
        },
      ],
    },
    

    {
      label: "BDM",
      value: "CLIENT_MANAGEMENT",
      icon: <BusinessIcon />,
      isParent: true,
      children: [
        {
          label: "OnBoard Client",
          value: "BOARDCLIENT",
          component: <ClientForm />,
          icon: <BusinessIcon />,
        },
        {
          label: "Client List",
          value: "CLIENTLIST",
          component: <Clients />,
          icon: <FormatListBulletedIcon />,
        },
        {
          label: "BDM List",
          value: "BDMLIST",
          component: <BdmUsers />,
          icon: <SupervisorAccountIcon />,
        },
      ],
    },
    {
      label: "Timesheet",
      value: "TIMESHEET",
      component: <EmployeeTimesheet />,
      icon: <AccessTimeIcon />,
    },


  ],
  TEAMLEAD: [
    {
      label: "Requirements",
      value: "REQ_MANAGEMENT",
      icon: <AssignmentIcon />,
      isParent: true,
      children: [
        {
          label: "Requirements List",
          value: "REQUIREMENTS",
          component: <Requirements />,
          icon: <AssignmentIcon />,
        },
        {
          label: "Job Form",
          value: "JOB_FORM",
          component: <JobForm />,
          icon: <AddCircleOutlineIcon />,
        },
      ],
    },
    {
      label: "My Activities",
      value: "MY_ACTIVITIES",
      icon: <WorkIcon />,
      isParent: true,
      children: [
        {
          label: "My Assigned",
          value: "ASSIGNED",
          component: <Assigned />,
          icon: <WorkIcon />,
        },
        {
          label: "My Submissions",
          value: "SUBMISSIONS",
          component: <Submissions />,
          icon: <SendIcon />,
        },
        {
          label: "My Interview",
          value: "INTERVIEW",
          component: <Interview />,
          icon: <GroupIcon />,
        },
      ],
    },
    {
      label: "Team Management",
      value: "TEAM_MANAGEMENT",
      icon: <GroupWorkIcon />,
      isParent: true,
      children: [
        {
          label: "Users",
          value: "USERS",
          component: <UsersList />,
          icon: <PeopleIcon />,
        },
        {
          label: "Add User",
          value: "ADDUSER",
          component: <AddUser />,
          icon: <PersonAddIcon />,
        },
        {
          label: "Submissions",
          value: "ALLSUBMISSIONS",
          component: <AllSubmissions />,
          icon: <SendIcon />,
        },
        {
          label: "Interviews",
          value: "ALLINTERVIEWS",
          component: <AllInterviews />,
          icon: <InterpreterModeIcon />,
        },
      ],
    },
    {
      label: "BDM",
      value: "CLIENT_MANAGEMENT",
      icon: <BusinessIcon />,
      isParent: true,
      children: [
        {
          label: "OnBoard Client",
          value: "BOARDCLIENT",
          component: <ClientForm />,
          icon: <BusinessIcon />,
        },
        {
          label: "Client List",
          value: "CLIENTLIST",
          component: <Clients />,
          icon: <FormatListBulletedIcon />,
        },
        {
          label: "BDM List",
          value: "BDMLIST",
          component: <BdmUsers />,
          icon: <SupervisorAccountIcon />,
        },
      ],
    },
  ],
  BDM: [
    {
      label: "Requirements",
      value: "REQ_MANAGEMENT",
      icon: <AssignmentIcon />,
      isParent: true,
      children: [
        {
          label: "Requirements List",
          value: "REQUIREMENTS",
          component: <Requirements />,
          icon: <AssignmentIcon />,
        },
        {
          label: "Job Form",
          value: "JOB_FORM",
          component: <JobForm />,
          icon: <AddCircleOutlineIcon />,
        },
      ],
    },
    {
      label: "My Activities",
      value: "MY_ACTIVITIES",
      icon: <WorkIcon />,
      isParent: true,
      children: [
        {
          label: "My Assigned",
          value: "ASSIGNED",
          component: <Assigned />,
          icon: <WorkIcon />,
        },
        {
          label: "My Submissions",
          value: "SUBMISSIONS",
          component: <Submissions />,
          icon: <SendIcon />,
        },
        {
          label: "My Interview",
          value: "INTERVIEW",
          component: <Interview />,
          icon: <GroupIcon />,
        },
      ],
    },
    {
      label: "Team Management",
      value: "TEAM_MANAGEMENT",
      icon: <GroupWorkIcon />,
      isParent: true,
      children: [
        {
          label: "Users",
          value: "USERS",
          component: <UsersList />,
          icon: <PeopleIcon />,
        },
        {
          label: "Add User",
          value: "ADDUSER",
          component: <AddUser />,
          icon: <PersonAddIcon />,
        },
        {
          label: "Submissions",
          value: "ALLSUBMISSIONS",
          component: <AllSubmissions />,
          icon: <SendIcon />,
        },
        {
          label: "Interviews",
          value: "ALLINTERVIEWS",
          component: <AllInterviews />,
          icon: <InterpreterModeIcon />,
        },
      ],
    },
    {
      label: "BDM",
      value: "CLIENT_MANAGEMENT",
      icon: <BusinessIcon />,
      isParent: true,
      children: [
        {
          label: "OnBoard Client",
          value: "BOARDCLIENT",
          component: <ClientForm />,
          icon: <BusinessIcon />,
        },
        {
          label: "Client List",
          value: "CLIENTLIST",
          component: <Clients />,
          icon: <FormatListBulletedIcon />,
        },
        {
          label: "BDM List",
          value: "BDMLIST",
          component: <BdmUsers />,
          icon: <SupervisorAccountIcon />,
        },
      ],
    },
  ],
};

export default TABS_BY_ROLE;