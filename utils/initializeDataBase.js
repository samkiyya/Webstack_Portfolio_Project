const initializeDatabase = async () => {
  try {
    const sequelize = require("../config/db"); // Ensure this is the correct path to your Sequelize instance

    // Insert Free subscription if it doesn't already exist
    const [freeSubscription] = await sequelize.query(
      "SELECT COUNT(*) AS count FROM subscriptions WHERE name = 'Free';"
    );
    if (freeSubscription[0].count === 0) {
      await sequelize.query(
        "INSERT INTO subscriptions (name, limitCount, price, createdAt, updatedAt) VALUES ('Free', 0, 0, NOW(), NOW());"
      );
      console.log("Free subscription inserted.");
    }

    // Insert levels if they don't already exist
    const [gashaLevel] = await sequelize.query(
      "SELECT COUNT(*) AS count FROM levels WHERE name = 'gasha';"
    );
    if (gashaLevel[0].count === 0) {
      await sequelize.query(
        "INSERT INTO levels (name, createdAt, updatedAt) VALUES ('gasha', NOW(), NOW());"
      );
      console.log("gasha level inserted.");
    }
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};

module.exports = initializeDatabase;
