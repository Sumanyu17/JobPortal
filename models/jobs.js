const { Sequelize, Model, DataTypes } = require("sequelize");


// let deleteSubTasks = function (task, options) {
//   try {
//     let time = new Date();
//     global.databaseConnection.models.subTasks.update({ deletedAt: time }, { where: { taskId: task.id } }).then((result) => {
//       if (result) {
//         console.log("associated subTasks Deleted");
//       }
//       else {
//         console.log("failed to delete assocaiated subTasks");
//       }
//       return;
//     });
//     return;
//   } catch (error) {
//     console.log(error);
//   }

// }
const Jobs = global.databaseConnection.define("jobs", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV1,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(255),
    required: true
  },
  description: {
    type: DataTypes.STRING(255),
  },
  location: {
    type: DataTypes.STRING(255),
    required: true
  },
  contactPhoneNumber: {
    type: DataTypes.STRING(255),
    required: true
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    required: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    required: true
  },
  dueDate: {
    type: DataTypes.DATE,
    required: true
  },
},
  {
    paranoid: true
  }
);

module.exports = Jobs;