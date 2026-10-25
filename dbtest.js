
const db = require("./db");

async function testConnection() {
    try {
        const [rows] = await db.query("SELECT 1 AS result");

        console.log("Database connected:", rows[0].result);
    } catch (error) {
        console.error("Database connection failed:", error.message);
    } finally {
        await db.end();
    }
}

testConnection();
