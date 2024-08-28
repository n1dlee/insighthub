document.addEventListener("DOMContentLoaded", async () => {
  const profileEditForm = document.getElementById("profileEditForm");
  const workHistoryEntries = document.getElementById("work-history-entries");
  const workExperienceEntries = document.getElementById(
    "work-experience-entries"
  );
  const addWorkHistoryButton = document.getElementById("add-work-history");
  const addWorkExperienceButton = document.getElementById(
    "add-work-experience"
  );

  const urlParams = new URLSearchParams(window.location.search);
  const investorId = urlParams.get("id");

  if (!investorId) {
    window.location.href = "/login";
    return;
  }

  try {
    const investorData = await loadInvestorData(investorId);

    if (!investorData || !investorData.id) {
      throw new Error("Invalid investor data received from server");
    }

    populateFormFields(profileEditForm, investorData);

    // Parse data from JSON strings and populate corresponding sections
    populateWorkHistory(
      workHistoryEntries,
      investorData.workHistory ? JSON.parse(investorData.workHistory) : []
    );
    populateWorkExperience(
      workExperienceEntries,
      investorData.workExperience ? JSON.parse(investorData.workExperience) : []
    );

    addWorkHistoryButton.addEventListener("click", () => {
      addWorkHistoryEntry(workHistoryEntries);
    });

    addWorkExperienceButton.addEventListener("click", () => {
      addWorkExperienceEntry(workExperienceEntries);
    });
  } catch (error) {
    handleError("Error loading investor data:", error);
  }

  profileEditForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(profileEditForm);
    const updatedData = {};

    for (const [key, value] of formData.entries()) {
      if (
        key !== "id" &&
        value !== "" &&
        !key.startsWith("workHistory") &&
        !key.startsWith("workExperience")
      ) {
        updatedData[key] = value;
      }
    }

    updatedData.workHistory = collectExperienceData(
      workHistoryEntries,
      "workHistory"
    );
    updatedData.workExperience = collectExperienceData(
      workExperienceEntries,
      "workExperience"
    );

    // Convert arrays workHistory and workExperience to JSON strings before sending
    updatedData.workHistory = JSON.stringify(updatedData.workHistory);
    updatedData.workExperience = JSON.stringify(updatedData.workExperience);

    try {
      const response = await fetch(`/api/investor/${investorId}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Profile updated successfully");
        window.location.href = `/investor-profile?id=${investorId}`;
      } else {
        const errorText = await response.text();
        console.error("Failed to update profile:", errorText);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  });
});

async function loadInvestorData(investorId) {
  try {
    const response = await fetch(`/api/investor/${investorId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        "Error response from /api/investor/:id",
        response.status,
        errorText
      );
      throw new Error(
        `Network response was not ok. Status: ${response.status}`
      );
    }

    const investorData = await response.json();
    if (!investorData || !investorData.id) {
      console.error(
        "Invalid investor data received from server:",
        investorData
      );
      throw new Error("No investor data or ID found.");
    }

    return investorData;
  } catch (error) {
    console.error("Error loading investor data:", error);
    throw error;
  }
}

function populateWorkHistory(container, workHistory) {
  workHistory.forEach((experience, index) => {
    addWorkHistoryEntry(container, experience, index);
  });
}

function populateFormFields(form, data) {
  for (const key in data) {
    if (data.hasOwnProperty(key) && key !== "id" && key !== "workHistory") {
      const field = form.querySelector(`[name="${key}"]`);
      if (field) {
        if (field.tagName.toLowerCase() === "textarea") {
          field.value = data[key] || "";
        } else {
          field.value = data[key] || "";
        }
      }
    }
  }
}

function handleError(message, error) {
  console.error(message, error);
  alert(error?.message || message);
}

function handleFetchResponse(response) {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
}

function populateWorkExperience(container, workExperience) {
  workExperience.forEach((experience, index) => {
    addWorkExperienceEntry(container, experience, index);
  });
}

function addWorkHistoryEntry(container, experience = {}, index = -1) {
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("work-history-entry");

  const companyNameId = `companyName_${index}`;
  const jobTitleId = `jobTitle_${index}`;
  const startDateId = `startDate_${index}`;
  const endDateId = `endDate_${index}`;
  const descriptionId = `description_${index}`;

  entryDiv.innerHTML = `
          <div class="achievements-title">Work History</div>
          <label for="${companyNameId}">Company Name:</label>
          <input type="text" id="${companyNameId}" name="workHistory[${index}][companyName]" value="${
    experience.companyName || ""
  }">
  
          <label for="${jobTitleId}">Job Position:</label>
          <input type="text" id="${jobTitleId}" name="workHistory[${index}][jobTitle]" value="${
    experience.jobTitle || ""
  }">
  
          <label for="${startDateId}">Start Date:</label>
          <input type="date" id="${startDateId}" name="workHistory[${index}][startDate]" value="${
    experience.startDate || ""
  }">
  
          <label for="${endDateId}">End Date:</label>
          <input type="date" id="${endDateId}" name="workHistory[${index}][endDate]" value="${
    experience.endDate || ""
  }">
  
          <label for="${descriptionId}">Description:</label>
          <textarea id="${descriptionId}" name="workHistory[${index}][description]">${
    experience.description || ""
  }</textarea>
  
          <button type="button" class="remove-work-history">Remove</button>
      `;

  container.appendChild(entryDiv);

  const removeButton = entryDiv.querySelector(".remove-work-history");
  removeButton.addEventListener("click", () => {
    entryDiv.remove();
  });
}

function addWorkExperienceEntry(container, experience = {}, index = -1) {
  const entryDiv = document.createElement("div");
  entryDiv.classList.add("work-experience-entry");

  const companyNameId = `companyName_${index}`;
  const jobTitleId = `jobTitle_${index}`;
  const startDateId = `startDate_${index}`;
  const endDateId = `endDate_${index}`;
  const descriptionId = `description_${index}`;

  entryDiv.innerHTML = `
          <div class="achievements-title">Work Experience</div>
          <label for="${companyNameId}">Company Name:</label>
          <input type="text" id="${companyNameId}" name="workExperience[${index}][companyName]" value="${
    experience.companyName || ""
  }">
  
          <label for="${jobTitleId}">Job Position:</label>
          <input type="text" id="${jobTitleId}" name="workExperience[${index}][jobTitle]" value="${
    experience.jobTitle || ""
  }">
  
          <label for="${startDateId}">Start Date:</label>
          <input type="date" id="${startDateId}" name="workExperience[${index}][startDate]" value="${
    experience.startDate || ""
  }">
  
          <label for="${endDateId}">End Date:</label>
          <input type="date" id="${endDateId}" name="workExperience[${index}][endDate]" value="${
    experience.endDate || ""
  }">
  
          <label for="${descriptionId}">Description:</label>
          <textarea id="${descriptionId}" name="workExperience[${index}][description]">${
    experience.description || ""
  }</textarea>
  
          <button type="button" class="remove-work-experience">Remove</button>
      `;

  container.appendChild(entryDiv);

  const removeButton = entryDiv.querySelector(".remove-work-experience");
  removeButton.addEventListener("click", () => {
    entryDiv.remove();
  });
}

function collectExperienceData(entriesContainer, experienceType) {
  const experiences = [];
  const entries = entriesContainer.querySelectorAll(
    `.work-${experienceType}-entry`
  );
  entries.forEach((entry) => {
    const companyName = entry.querySelector(
      `input[name="${experienceType}[companyName]"]`
    ).value;
    const jobTitle = entry.querySelector(
      `input[name="${experienceType}[jobTitle]"]`
    ).value;
    const startDate = entry.querySelector(
      `input[name="${experienceType}[startDate]"]`
    ).value;
    const endDate = entry.querySelector(
      `input[name="${experienceType}[endDate]"]`
    ).value;
    const description = entry.querySelector(
      `textarea[name="${experienceType}[description]"]`
    ).value;
    if (companyName && jobTitle) {
      experiences.push({
        companyName,
        jobTitle,
        startDate,
        endDate,
        description,
      });
    }
  });

  return experiences;
}
