# InsightHub

InsightHub is a web platform that connects students seeking financial support for their education with potential investors. It facilitates the process of finding and securing funding for students who aspire to study abroad.

## Features

- **Student Profiles:** Students can create detailed profiles showcasing their academic achievements, aspirations, and financial needs.
- **Investor Search:** Investors can browse student profiles and filter based on criteria such as university, major, and desired investment amount.
- **Secure Communication:** The platform provides a safe and secure environment for students and investors to interact and discuss potential funding opportunities.
- **User Authentication:** Robust authentication mechanisms are in place to ensure the security and privacy of user data.

## Technologies Used

- **Backend:** Node.js with Express.js framework
- **Database:** Sequelize ORM (likely interacting with a relational database like PostgreSQL)
- **Frontend:** HTML, CSS, JavaScript
- **Other:** bcrypt (for password hashing), cookie-parser (for managing cookies), cors (for handling Cross-Origin Resource Sharing)

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/n1dlee/insighthub

   ```

2. **Install dependencies:**

   ```bash
   cd InsightHub
   npm install

   ```

3. **Set up the database:**

- Create a database and configure the connection details in your environment variables or a configuration file.
- Run the database migrations to create the necessary tables.

4. **Start the server:**

- **For Production:**
  ```bash
  npm start
  ```
- **For Developers:**
  ```bash
  npm run dev
  ```

5. **Access the application:**

- Open your web browser and navigate to http://localhost:8080 (or the port specified in your environment).

## Project Structure

- **server.js:** The main Node.js server file handling routing, middleware, and database interactions.
- **assets/:** Contains frontend assets such as CSS, JavaScript, images, and icons.
- **assets/routes/:** Contains route definitions for handling API requests related to users, investor posts, student posts, and investors.
- **assets/middleware/:** Contains middleware functions for error handling and other functionalities.
- **db.js:** Configuration for the Sequelize database connection.
- **index.html, main.html, profile.html, etc.:** HTML files for different pages of the application.

## Contributing

**Contributions are welcome! Please follow these steps:**

1. **Fork the repository.**
2. **Create a new branch for your feature or bug fix.**
3. **Make your changes and commit them with descriptive messages.**
4. **Push your changes to your forked repository.**
5. **Submit a pull request to the main repository.**

## License

This project is licensed under the GNU License
