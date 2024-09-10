const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../db');

class Student extends Model {
  static associate(models) {
    // Define associations here
    Student.hasMany(models.Chat, { 
      foreignKey: 'senderId', 
      as: 'sentChats' 
    });
    Student.belongsToMany(models.Conversation, { 
      through: 'Participants', 
      foreignKey: 'studentId' 
    });
  }
}

Student.init({
  id: { 
    type: DataTypes.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  },
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  surname: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  age: { 
    type: DataTypes.INTEGER, 
    allowNull: false 
  },
  middle: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  email: { 
    type: DataTypes.STRING, 
    allowNull: false, 
    unique: true 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  livesOutsideUS: { 
    type: DataTypes.BOOLEAN, 
    allowNull: true 
  },
  educationPlace: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  primaryDegree: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  bio: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  major: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  achievements: { 
    type: DataTypes.TEXT, 
    allowNull: true 
  },
  profile_image: { 
    type: DataTypes.STRING, 
    allowNull: true 
  },
  gpa: { 
    type: DataTypes.FLOAT, 
    allowNull: true 
  },
  sat: { 
    type: DataTypes.INTEGER, 
    allowNull: true 
  },
  ielts: { 
    type: DataTypes.FLOAT, 
    allowNull: true 
  },
  location: { 
    type: DataTypes.STRING, 
    allowNull: true 
  }
}, {
  sequelize,
  modelName: 'Student',
  tableName: 'students'
});

module.exports = Student;