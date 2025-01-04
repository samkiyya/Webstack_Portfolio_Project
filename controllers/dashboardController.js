const { Sequelize } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize('book_store', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
});

// List of tables
const tables = [
    "account_names",
    "admins",
    "announcements",
    "books",
    "book_audios",
    "categories",
    "comments",
    "communications",
    "coupons",
    "followings",
    "levels",
    "likes",
    "notifications",
    "orders",
    "permissions",
    "promotions",
    "quality",
    "reports",
    "reviews",
    "sold_contents",
    "subscriptions",
    "subscriptiontiers",
    "subscription_orders",
    "two_factor",
    "userroles",
    "users",
    "usersubscriptions",
    "user_interactions"
];

const getRowCounts = async (req, res) => {
    try {
        const rowCounts = {};

        for (const table of tables) {
            const [result] = await sequelize.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
            rowCounts[table] = result[0].count;
        }

        res.json(rowCounts);
    } catch (error) {
        console.error("Error fetching row counts:", error.message);
        res.status(500).json({ error: "Failed to fetch row counts" });
    }
};

module.exports = { getRowCounts };
