export const placementFormFields = [
  {
    name: "consultantName",
    label: "Consultant Name",
    type: "text",
    required: true,
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
    helperText: "Enter consultant's full name",
  },
  {
    name: "consultantEmail",
    label: "Email",
    type: "email",
    required: true,
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
    helperText: "Example: name@example.com",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    required: true,
    inputProps: { maxLength: 10 },
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
    helperText: "10 digits only",
  },
  {
    name: "technology",
    label: "Technology",
    type: "text",
    required: true,
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "client",
    label: "Client",
    type: "text",
    required: true,
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "vendorName",
    label: "Vendor Name",
    type: "text",
    required: true,
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "startDate",
    label: "Start Date",
    type: "date", // Explicitly set as date type
    required: true,
    InputLabelProps: { shrink: true },
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "endDate",
    label: "End Date",
    type: "date", // Explicitly set as date type

    InputLabelProps: { shrink: true },
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "billRateUSD",
    label: "Bill Rate (USD)",
    type: "number",
    required: true,
    inputProps: { step: "0.01" },
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "payRate",
    label: "Pay Rate (USD)",
    type: "number",
    required: true,
    inputProps: { step: "0.01" },
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "employmentType",
    label: "Employment Type",
    type: "select",
    required: true,
    options: [
      { value: "W2", label: "W2" },
      { value: "1099", label: "1099" },
      { value: "C2C", label: "C2C" },
      { value: "Full-time", label: "Full-time" },
      { value: "Part-time", label: "Part-time" },
      { value: "Contract", label: "Contract" },
      { value: "Contract-to-hire", label: "Contract-to-hire" },
    ],
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "recruiter",
    label: "Recruiter",
    type: "text",
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "sales",
    label: "Sales",
    type: "text",
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "Active", label: "Active" },
      { value: "On Hold", label: "On Hold" },
      { value: "Completed", label: "Completed" },
      { value: "Terminated", label: "Terminated" },
      { value: "Cancelled", label: "Cancelled" },
    ],
    gridProps: { xs: 12, sm: 6 },
    sx: { mb: 2 },
  },
  {
    name: "statusMessage",
    label: "Status Message",
    type: "text",
    gridProps: { xs: 12 },
    sx: { mb: 2 },
  },
  {
    name: "remarks",
    label: "Remarks",
    type: "textarea",
    multiline: true,
    rows: 3,
    gridProps: { xs: 12 },
    sx: { mb: 2 },
  },
];
