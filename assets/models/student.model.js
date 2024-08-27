const sequelize = require('../../db'); // Assuming your db.js is located at '../../db'
const { DataTypes } = require('sequelize');

const Student = sequelize.define('student', {  // Note: using lowercase 'student' for consistency
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    surname: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    middle: { type: DataTypes.STRING, allowNull: true },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // Assuming password is required
    livesOutsideUS: { type: DataTypes.BOOLEAN, allowNull: true },
    educationPlace: { type: DataTypes.STRING, allowNull: false },
    primaryDegree: { type: DataTypes.STRING, allowNull: false },
    bio: { type: DataTypes.TEXT, allowNull: true }, // Assuming bio can be longer text
    major: { type: DataTypes.STRING, allowNull: true },
    achievements: { type: DataTypes.TEXT, allowNull: true }, // Assuming achievements can be longer text
    profile_image: { type: DataTypes.STRING, allowNull: true },
    gpa: { type: DataTypes.FLOAT, allowNull: true }, // Using FLOAT for decimal GPA values
    sat: { type: DataTypes.INTEGER, allowNull: true },
    ielts: { type: DataTypes.FLOAT, allowNull: true }, // Using FLOAT for decimal IELTS scores
    location: { type: DataTypes.STRING, allowNull: true }
}, {
    tableName: 'students' // If you need to explicitly specify the table name
});

module.exports = Student;
