import React, { useState, useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import {
  Box,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Divider,
  Alert,
  Stack,
  Container,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  Email,
  Phone,
  Work,
  DateRange,
  VpnKey,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useSelector, useDispatch } from "react-redux";
import {
  submitFormData,
  clearFormData,
  clearResponse,
} from "../../redux/features/formSlice";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddUser = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { status, error, response } = useSelector((state) => state.form || {});

  const availableRoles = ["ADMIN", "EMPLOYEE", "SUPERADMIN", "TEAMLEAD","BDM"];

  const SignUpSchema = Yup.object().shape({
    userId: Yup.string()
      .matches(
        /^DQIND\d{2,4}$/,
        "User ID must start with 'DQIND' followed by 2 to 4 digits"
      )
      .required("User ID is required"),
    userName: Yup.string()
      .matches(
        /^[a-zA-Z\s]+$/,
        "User Name must only contain letters and spaces"
      )
      .min(1, "User Name must be at least 1 character")
      .max(20, "User Name must not exceed 20 characters")
      .required("User Name is required"),
    email: Yup.string()
      .matches(
        /^[a-z0-9._%+-]+@dataqinc\.com$/,
        "Please enter a valid company email (e.g., example@dataqinc.com)"
      )
      .required("Company email is required"),
    personalemail: Yup.string()
      .matches(
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        "Please enter a valid personal email"
      )
      .required("Personal email is required"),
    phoneNumber: Yup.string()
      .matches(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .required("Phone number is required"),
    designation: Yup.string()
      .required("Designation is required")
      .matches(
        /^[A-Za-z\s]+$/,
        "Designation can only contain letters and spaces"
      ),
    gender: Yup.string().required("Gender is required"),
    roles: Yup.array()
      .min(1, "At least one role must be selected")
      .required("Roles are required"),
    dob: Yup.date()
      .max(new Date(), "Date of birth cannot be in the future")
      .test("age", "Must be at least 20 years old", function (value) {
        const cutoff = new Date();
        cutoff.setFullYear(cutoff.getFullYear() - 20);
        return value <= cutoff;
      })
      .required("Date of birth is required"),
    joiningDate: Yup.date()
      .min(
        new Date(new Date().setMonth(new Date().getMonth() - 2)),
        "Joining date must be within the last 2 months"
      )
      .max(
        new Date(new Date().setMonth(new Date().getMonth() + 2)),
        "Joining date must be within the next 2 months"
      )
      .required("Joining date is required"),
    password: Yup.string()
      .matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must be 8+ characters with uppercase, lowercase, number, special character"
      )
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const response = await dispatch(submitFormData(values)).unwrap();
  
     
      if (response.success) {
        resetForm();
        toast.success("User registered successfully!");
      } else {
        toast.error(response.message || "Registration failed.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to Register user");
      
      
    } finally {
      setSubmitting(false);
    }
  };
  

  useEffect(() => {
    if (status === "loading") {
      toast.info("Processing...");
    }

    if (status === "failed" && error?.general) {
      const errorMessage =
        typeof error.general === "object"
          ? error.general.errormessage || "An unknown error occurred."
          : error.general;
      toast.error(errorMessage);
      dispatch(clearResponse());
    }

    if (status === "succeeded" && response && !response.success) {
      const { userId, email } = response.data;
      toast.success(
        <Box>
          <Typography variant="h6">Created Successfully!</Typography>
          <Typography variant="body2">UserID: {userId}</Typography>
          <Typography variant="body2">Email: {email}</Typography>
        </Box>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
        }
      );
      dispatch(clearFormData());
      dispatch(clearResponse());
    }
  }, [status, error, response, dispatch]);

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        width: "75%",
        height: "calc(100vh - 20px)",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      <ToastContainer />
      <Card elevation={3}>
        <CardContent>
          <Stack spacing={3}>
            <Typography
              variant="h5"
              color="primary"
              sx={{
                backgroundColor: "#00796b",
                color: "#FFFFFF",
                padding: 2,
                borderRadius: 1,
              }}
            >
              User Registration
            </Typography>

            <Divider />

            <Formik
              initialValues={{
                userId: "",
                userName: "",
                email: "",
                personalemail: "",
                phoneNumber: "",
                designation: "",
                gender: "",
                roles: ["EMPLOYEE"],
                dob: "",
                joiningDate: "",
                password: "",
                confirmPassword: "",
              }}
              validationSchema={SignUpSchema}
              onSubmit={handleSubmit}
            >
              {(formikProps) => {
                const { errors, touched, values, setFieldValue } = formikProps;
                return (
                  <Form>
                    <Box sx={{ mt: 3, mb: 3 }}>
                      {/* Personal Details Section */}
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="userId"
                            label="Employee ID"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <PersonAdd />
                                </InputAdornment>
                              ),
                            }}
                            error={touched.userId && Boolean(errors.userId)}
                            helperText={touched.userId && errors.userId}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="userName"
                            label="Employee Name"
                            fullWidth
                            error={touched.userName && Boolean(errors.userName)}
                            helperText={touched.userName && errors.userName}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl
                            fullWidth
                            error={touched.gender && Boolean(errors.gender)}
                          >
                            <InputLabel>Gender</InputLabel>
                            <Field
                              as={Select}
                              name="gender"
                              label="Gender"
                              value={values.gender}
                            >
                              <MenuItem value="Male">Male</MenuItem>
                              <MenuItem value="Female">Female</MenuItem>
                            </Field>
                            {touched.gender && errors.gender && (
                              <Typography variant="caption" color="error">
                                {errors.gender}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>

                        {/* Contact Information Section */}
                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="designation"
                            label="Employee Designation"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Work />
                                </InputAdornment>
                              ),
                            }}
                            error={
                              touched.designation && Boolean(errors.designation)
                            }
                            helperText={
                              touched.designation && errors.designation
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="email"
                            label="Official Email"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email />
                                </InputAdornment>
                              ),
                            }}
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="personalemail"
                            label="Personal Email"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Email />
                                </InputAdornment>
                              ),
                            }}
                            error={
                              touched.personalemail &&
                              Boolean(errors.personalemail)
                            }
                            helperText={
                              touched.personalemail && errors.personalemail
                            }
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="phoneNumber"
                            label="Phone Number"
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Phone />
                                </InputAdornment>
                              ),
                            }}
                            error={
                              touched.phoneNumber && Boolean(errors.phoneNumber)
                            }
                            helperText={
                              touched.phoneNumber && errors.phoneNumber
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <FormControl
                            fullWidth
                            error={touched.roles && Boolean(errors.roles)}
                          >
                            <InputLabel>Roles</InputLabel>
                            <Field
                              as={Select}
                              name="roles"
                              value={values.roles}
                              onChange={(event) =>
                                setFieldValue("roles", [event.target.value])
                              }
                              label="Roles"
                            >
                              {availableRoles.map((role) => (
                                <MenuItem key={role} value={role}>
                                  {role}
                                </MenuItem>
                              ))}
                            </Field>
                            {touched.roles && errors.roles && (
                              <Typography variant="caption" color="error">
                                {errors.roles}
                              </Typography>
                            )}
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="dob"
                            label="Date of Birth"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DateRange />
                                </InputAdornment>
                              ),
                            }}
                            error={touched.dob && Boolean(errors.dob)}
                            helperText={touched.dob && errors.dob}
                          />
                        </Grid>

                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="joiningDate"
                            label="Joining Date"
                            type="date"
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <DateRange />
                                </InputAdornment>
                              ),
                              inputProps: {
                                min: new Date(
                                  new Date().setMonth(new Date().getMonth() - 2)
                                )
                                  .toISOString()
                                  .split("T")[0],
                                max: new Date(
                                  new Date().setMonth(new Date().getMonth() + 2)
                                )
                                  .toISOString()
                                  .split("T")[0],
                              },
                            }}
                            error={
                              touched.joiningDate && Boolean(errors.joiningDate)
                            }
                            helperText={
                              touched.joiningDate && errors.joiningDate
                            }
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="password"
                            label="Password"
                            type={showPassword ? "text" : "password"}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <VpnKey />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowPassword(!showPassword)
                                    }
                                    edge="end"
                                  >
                                    {showPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            error={touched.password && Boolean(errors.password)}
                            helperText={touched.password && errors.password}
                          />
                        </Grid>
                        <Grid item xs={12} md={4}>
                          <Field
                            as={TextField}
                            name="confirmPassword"
                            label="Confirm Password"
                            type={showConfirmPassword ? "text" : "password"}
                            fullWidth
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <VpnKey />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() =>
                                      setShowConfirmPassword(
                                        !showConfirmPassword
                                      )
                                    }
                                    edge="end"
                                  >
                                    {showConfirmPassword ? (
                                      <VisibilityOff />
                                    ) : (
                                      <Visibility />
                                    )}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            error={
                              touched.confirmPassword &&
                              Boolean(errors.confirmPassword)
                            }
                            helperText={
                              touched.confirmPassword && errors.confirmPassword
                            }
                          />
                        </Grid>
                      </Grid>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 3,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => formikProps.resetForm()}
                        sx={{ mr: 1 }}
                      >
                        Clear
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={
                          formikProps.isSubmitting || !formikProps.isValid
                        }
                      >
                        {formikProps.isSubmitting
                          ? "Registering..."
                          : "Register"}
                      </Button>
                    </Box>

                    
                  </Form>
                );
              }}
            </Formik>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddUser;
