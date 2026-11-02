const db = require("./db");
const crypto = require("crypto");

async function checkToken() {
    const refreshToken = "116eee1975f44f76889838d36409f06204fca3ce88319a1de676d1c2f2724dbff3e7eb695db53264f890db54771330dee268551982e72fe35aa6634ac7e61c2f";

    console.log("Raw token length:", refreshToken.length);

    const tokenHash = crypto
        .createHash("sha256")
        .update(refreshToken)
        .digest("hex");

    console.log("Generated hash length:", tokenHash.length);

    const [rows] = await db.execute(
        "SELECT * FROM refresh_tokens WHERE token_hash = ?",
        [tokenHash]
    );

    console.log("Matching records:", rows);

    if (rows.length > 0) {
        console.log("Token found!");
        console.log("User ID:", rows[0].user_id);
        console.log("Family ID:", rows[0].family_id);
        console.log("Expiry:", rows[0].expires_at);
        console.log("Revoked at:", rows[0].revoked_at);
    } else {
        console.log("Token not found!");
    }

    await db.end();
}

checkToken().catch(console.error);