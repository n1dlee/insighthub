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

  // Extract investorId from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const investorId = urlParams.get("id");

  console.log(
    "Investor Profile Edit page loaded. Investor ID from URL:",
    investorId
  );

  if (!investorId) {
    console.error("Investor ID not found in URL. Redirecting...");
    window.location.href = "/login-investor";
    return;
  }

  try {
    // Fetch investor data
    const investorData = await loadInvestorData(investorId);
    console.log("Fetched investor data for editing:", investorData);

    // Populate form fields
    populateFormFields(profileEditForm, investorData);
    populateWorkHistory(workHistoryEntries, investorData.WorkHistories || []);
    populateWorkExperience(
      workExperienceEntries,
      investorData.WorkExperiences || []
    );

    // Set up event listeners for adding work history and experience entries
    addWorkHistoryButton.addEventListener("click", () =>
      addEntry(workHistoryEntries, addWorkHistoryEntry, 10)
    );
    addWorkExperienceButton.addEventListener("click", () =>
      addEntry(workExperienceEntries, addWorkExperienceEntry, 10)
    );

    // Handle form submission
    profileEditForm.addEventListener("submit", handleFormSubmit);
  } catch (error) {
    handleError("Error loading investor data:", error);
  }

  async function loadInvestorData(investorId) {
    try {
      const response = await fetch(`/api/investor/${investorId}`, {
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          "Error response from server:",
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

  function populateFormFields(form, data) {
    const nonEditableFields = ["name", "surname", "email"];

    for (const [key, value] of Object.entries(data)) {
      if (
        key !== "id" &&
        key !== "WorkHistories" &&
        key !== "WorkExperiences"
      ) {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
          if (nonEditableFields.includes(key)) {
            // Create a span element for non-editable fields
            const span = document.createElement("span");
            span.textContent = value || "N/A";
            field.parentNode.replaceChild(span, field);
          } else if (field.tagName.toLowerCase() === "textarea") {
            field.value = value || "";
          } else if (field.type === "checkbox") {
            field.checked = value;
          } else {
            field.value = value || "";
          }
        }
      }
    }
  }

  function populateWorkHistory(container, workHistories) {
    workHistories.forEach((history, index) => {
      addWorkHistoryEntry(container, history, index);
    });
  }

  function populateWorkExperience(container, workExperiences) {
    workExperiences.forEach((experience, index) => {
      addWorkExperienceEntry(container, experience, index);
    });
  }

  function addEntry(container, entryFunction, maxEntries) {
    const count = container.children.length;
    if (count < maxEntries) {
      entryFunction(container);
    } else {
      alert(`Maximum of ${maxEntries} entries allowed.`);
    }
  }

  function addWorkHistoryEntry(container, history = {}, index) {
    const entryDiv = createEntryDiv(
      "work-history-entry",
      [
        { label: "Company Name", name: "companyName", type: "text" },
        { label: "Position", name: "position", type: "text" },
        { label: "Start Date", name: "startDate", type: "date" },
        { label: "End Date", name: "endDate", type: "date" },
        {
          label: "Responsibilities",
          name: "responsibilities",
          type: "textarea",
        },
      ],
      history,
      index,
      "workHistory"
    );

    container.appendChild(entryDiv);
  }

  function addWorkExperienceEntry(container, experience = {}, index) {
    const entryDiv = createEntryDiv(
      "work-experience-entry",
      [
        { label: "Skill Name", name: "skillName", type: "text" },
        {
          label: "Years of Experience",
          name: "yearsOfExperience",
          type: "number",
        },
        {
          label: "Proficiency Level",
          name: "proficiencyLevel",
          type: "select",
          options: ["Beginner", "Intermediate", "Advanced", "Expert"],
        },
        { label: "Description", name: "description", type: "textarea" },
      ],
      experience,
      index,
      "workExperience"
    );

    container.appendChild(entryDiv);
  }

  function createEntryDiv(className, fields, data, index, prefix) {
    const entryDiv = document.createElement("div");
    entryDiv.classList.add(className);

    fields.forEach((field) => {
      const label = document.createElement("label");
      label.setAttribute("for", `${field.name}_${index}`);
      label.textContent = `${field.label}:`;
      entryDiv.appendChild(label);

      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
      } else if (field.type === "select") {
        input = document.createElement("select");
        field.options.forEach((option) => {
          const optionElement = document.createElement("option");
          optionElement.value = option;
          optionElement.textContent = option;
          if (data[field.name] === option) {
            optionElement.selected = true;
          }
          input.appendChild(optionElement);
        });
      } else {
        input = document.createElement("input");
        input.type = field.type;
      }

      input.id = `${field.name}_${index}`;
      input.name = `${prefix}[${index}][${field.name}]`;
      input.value = data[field.name] || "";
      entryDiv.appendChild(input);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.classList.add(`remove-${prefix}`);
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", () => {
      entryDiv.remove();
    });
    entryDiv.appendChild(removeButton);

    return entryDiv;
  }

  async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
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

    updatedData.WorkHistories = collectExperienceData(
      document.getElementById("work-history-entries"),
      "workHistory"
    );
    updatedData.WorkExperiences = collectExperienceData(
      document.getElementById("work-experience-entries"),
      "workExperience"
    );

    try {
      const investorId = new URLSearchParams(window.location.search).get("id");
      const response = await fetch(`/api/investor/${investorId}`, {
        method: "PUT",
        body: JSON.stringify(updatedData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        alert("Profile updated successfully");
        window.location.href = `investor-profile?id=${investorId}`;
      } else {
        const errorText = await response.text();
        console.error("Failed to update profile:", errorText);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile.");
    }
  }

  function collectExperienceData(container, type) {
    return Array.from(container.children).map((entry) => {
      const entryData = {};
      entry.querySelectorAll("input, textarea, select").forEach((field) => {
        const key = field.name.match(/\[(\w+)\]$/)[1];
        entryData[key] = field.value;
      });
      return entryData;
    });
  }

  function handleError(message, error) {
    console.error(message, error);
    alert(error?.message || message);
  }
});
