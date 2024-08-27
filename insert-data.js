const fs = require("fs");
const iconv = require("iconv-lite");
const sequelize = require("./db");
const Sequelize = require("sequelize");

// Import your models (adjust the paths if needed)
const University = require("./assets/models/university.model");
const Major = require("./assets/models/major.model");

// Read data from text files
const universitiesData = fs.readFileSync("uzb_unis.txt", "utf-8");
const majorsData = fs.readFileSync("majors.txt", "utf-8");

// Split and trim data, handling the " - " separator for universities
const universities = universitiesData.split("\n").map((line) => {
  const parts = line.split(" - ").map((part) => part.trim());
  // Handle cases where the separator might be missing or there are extra parts
  const name = parts[0] || "";
  const location = parts[1] || "";
  return { name, location };
});

const majors = majorsData.split("\n").map((major) => major.trim());

/* // Drop the 'universities' table if it exists (optional - uncomment if needed)
 University.drop()
   .then(() => {
     console.log('Universities table dropped successfully!');
   })
   .catch(err => {
     console.error('Error dropping universities table:', err);
   });
*/
// Ensure tables are created (this will recreate 'universities' if dropped)
sequelize
  .sync()
  .then(() => {
    // Insert universities into the database
    Promise.all(
      universities.map((university) => {
        // Convert to WIN1251
        const convertedName = iconv
          .encode(university.name, "win1251")
          .toString();
        const convertedLocation = iconv
          .encode(university.location, "win1251")
          .toString();

        return University.create({
          name: convertedName,
          location: convertedLocation,
        })
          .then(() =>
            console.log(
              `Inserted university: ${convertedName} - ${convertedLocation}`
            )
          )
          .catch((err) => {
            // Handle potential unique constraint violation (duplicate university name)
            if (err.name === "SequelizeUniqueConstraintError") {
              console.warn(
                `University '${convertedName}' already exists. Skipping...`
              );
            } else {
              console.error("Error inserting university:", err);
            }
          });
      })
    )
      .then(() => {
        console.log("All universities inserted successfully!");
      })
      .catch((err) => {
        console.error("Error inserting universities:", err);
      });

    // Insert majors into the database
    Promise.all(
      majors.map((major) => {
        return Major.create({ name: major })
          .then(() => console.log(`Inserted major: ${major}`))
          .catch((err) => {
            // Handle potential unique constraint violation (duplicate major name)
            if (err.name === "SequelizeUniqueConstraintError") {
              console.warn(`Major '${major}' already exists. Skipping...`);
            } else {
              console.error("Error inserting major:", err);
            }
          });
      })
    )
      .then(() => {
        console.log("All majors inserted successfully!");
      })
      .catch((err) => {
        console.error("Error inserting majors:", err);
      });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });
