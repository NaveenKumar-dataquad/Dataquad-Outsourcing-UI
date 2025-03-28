import axios from "axios";
import BASE_URL from "../../redux/config";



export const candidateAPI = {
  prepareFormData(values) {
    const formData = new FormData();

    // Required fields
    formData.append("fullName", values.fullName.trim());
    formData.append("email", values.email.trim());
    formData.append("contactNumber", values.contactNumber.trim());
    formData.append(
      "relevantExperience",
      parseFloat(values.relevantExperience) || 0
    );
    formData.append("totalExperience", parseFloat(values.totalExperience) || 0);

    // Skills as JSON array string
    if (values.skills?.length > 0) {
      formData.append("skills", JSON.stringify(values.skills));
    }

    // Optional fields
    if (values.linkedin) {
      formData.append(
        "linkedin",
        `https://www.linkedin.com/in/${values.linkedin.trim()}`
      );
    }
    if (values.referredBy) {
      formData.append("referredBy", values.referredBy.trim());
    }

    // Resume file
    if (values.resumeFile) {
      formData.append("resumeFiles", values.resumeFile);
    }

    return formData;
  },

  async fetchBenchList() {
    return await axios.get(`${BASE_URL}/candidate/bench/getBenchList`);
  },

  async create(formData) {
    return await axios({
      method: "post",
      url: `${BASE_URL}/candidate/bench/save`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async update(formData, candidateId) {
    return await axios({
      method: "put",
      url: `${BASE_URL}/candidate/bench/updatebench/${candidateId}`,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  async delete(candidateId) {
    return await axios.delete(
      `${BASE_URL}/candidate/bench/deletebench/${candidateId}`
    );
  },

  async downloadResume(candidateId) {
    return await axios.get(
      `${BASE_URL}/candidate/bench/download/${candidateId}`,
      {
        responseType: "blob",
      }
    );
  },
};