import React from "react";
import { Autocomplete, TextField } from "@mui/material";
import { Field } from "formik";

const qualifications = [
    // High School and Basic Education
    "High School",
    "GED (General Educational Development)",
    
    // Associate Degrees
    "Associate of Arts (A.A)",
    "Associate of Science (A.S)",
    "Associate of Applied Science (A.A.S)",
    "Associate of Business Administration (A.B.A)",
    "Associate of Engineering (A.E)",
    
    // Bachelor's Degrees
    "Bachelor of Arts (B.A)",
    "Bachelor of Science (B.S)",
    "Bachelor of Business Administration (BBA)",
    "Bachelor of Technology (B.Tech)",
    "Bachelor of Commerce (B.Com)",
    "Bachelor of Engineering (B.E)",
    "Bachelor of Computer Applications (BCA)",
    "Bachelor of Architecture (B.Arch)",
    "Bachelor of Fine Arts (BFA)",
    "Bachelor of Education (B.Ed)",
    "Bachelor of Laws (LLB)",
    "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
    "Bachelor of Dental Surgery (BDS)",
    "Bachelor of Pharmacy (B.Pharm)",
    "Bachelor of Nursing (B.N)",
    "Bachelor of Veterinary Science (BVSc)",
    
    // Master's Degrees
    "Master of Arts (M.A)",
    "Master of Science (M.S)",
    "Master of Business Administration (MBA)",
    "Master of Technology (M.Tech)",
    "Master of Commerce (M.Com)",
    "Master of Computer Applications (MCA)",
    "Master of Engineering (M.E)",
    "Master of Architecture (M.Arch)",
    "Master of Fine Arts (MFA)",
    "Master of Education (M.Ed)",
    "Master of Laws (LLM)",
    "Master of Medicine (MD)",
    "Master of Dental Surgery (MDS)",
    "Master of Pharmacy (M.Pharm)",
    "Master of Nursing (M.N)",
    "Master of Public Health (MPH)",
    "Master of Social Work (MSW)",
    "Master of International Business (MIB)",
    
    // Doctoral Degrees
    "Doctor of Philosophy (PhD)",
    "Doctor of Philosophy in Computer Science (PhD)",
    "Doctor of Philosophy in Engineering (PhD)",
    "Doctor of Business Administration (DBA)",
    "Doctor of Medicine (MD)",
    "Doctor of Dental Surgery (DDS)",
    "Doctor of Veterinary Medicine (DVM)",
    "Doctor of Pharmacy (Pharm.D)",
    "Doctor of Education (Ed.D)",
    "Doctor of Laws (JD)",
    "Doctor of Public Health (DrPH)",
    
    // Professional Certifications
    "Chartered Accountant (CA)",
    "Certified Public Accountant (CPA)",
    "Chartered Financial Analyst (CFA)",
    "Project Management Professional (PMP)",
    "Certified Information Systems Security Professional (CISSP)",
    "Certified Ethical Hacker (CEH)",
    "Certified ScrumMaster (CSM)",
    
    // Technical Certifications
    "AWS Certified Solutions Architect",
    "Microsoft Certified: Azure Administrator",
    "Google Certified Professional Cloud Architect",
    "Cisco Certified Network Associate (CCNA)",
    "CompTIA A+ Certification",
    "Red Hat Certified Engineer (RHCE)",
    
    // Specialized Diplomas and Postgraduate Certifications
    "Postgraduate Diploma in Management (PGDM)",
    "Postgraduate Diploma in Business Administration (PGDBA)",
    "Advanced Diploma in Software Development",
    "Advanced Diploma in Digital Marketing",
    "Advanced Diploma in Artificial Intelligence",
    
    // Other Options
    "Professional Training Certificate",
    "Industry-Specific Certification",
    "Other",
    "Not Specified"
];

const QualificationDropdown = ({ field, form }) => {
  return (
    <Autocomplete
      options={qualifications}
      value={field.value || ""}
      onChange={(event, newValue) => form.setFieldValue(field.name, newValue)}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Qualification"
          variant="outlined"
          fullWidth
          error={form.touched[field.name] && Boolean(form.errors[field.name])}
          helperText={form.touched[field.name] && form.errors[field.name]}
          sx={{
            borderRadius: 2,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        />
      )}
      fullWidth
      clearOnEscape
    />
  );
};

export default function QualificationField() {
  return (
    <Field name="qualification" component={QualificationDropdown} />
  );
}