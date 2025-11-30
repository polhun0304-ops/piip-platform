/*
  One-off script: create User rows for detectives that don't have a linked user.
  This runs inside the backend container so it uses the same sqlite DB file.
*/
(async () => {
  try {
    const path = require("path");
    const { v4: uuidv4 } = require("uuid");
    const bcrypt = require("bcryptjs");

    // load compiled AppDataSource
    const possible = [
      "/app/dist/app/src/config/database",
      "/app/dist/backend/src/config/database",
      path.join(
        __dirname,
        "..",
        "packages",
        "backend",
        "dist",
        "app",
        "src",
        "config",
        "database"
      ),
      path.join(
        __dirname,
        "..",
        "packages",
        "backend",
        "dist",
        "backend",
        "src",
        "config",
        "database"
      ),
    ];
    let dbModule;
    for (const p of possible) {
      try {
        dbModule = require(p);
        console.log("Loaded DB module from", p);
        break;
      } catch (e) {
        // ignore
      }
    }
    if (!dbModule)
      throw new Error(
        "Cannot find compiled database module; looked at: " +
          possible.join(", ")
      );
    const AppDataSource = dbModule.AppDataSource;
    await AppDataSource.initialize();
    console.log("AppDataSource initialized");

    const DEFAULT_PW =
      process.env.DETECTIVE_DEFAULT_PASSWORD || "detective123!";

    const detectives = await AppDataSource.query(
      "SELECT id, email, name, phone FROM detective"
    );
    console.log(`Found ${detectives.length} detectives`);
    let created = 0;
    for (const d of detectives) {
      const existing = await AppDataSource.query(
        "SELECT id FROM user WHERE detectiveId = ? OR email = ? LIMIT 1",
        [d.id, d.email]
      );
      if (existing && existing.length) {
        console.log(`Skipping ${d.email} (user exists)`);
        continue;
      }
      const hashed = await bcrypt.hash(DEFAULT_PW, 10);
      const id = uuidv4();
      await AppDataSource.query(
        `INSERT INTO user (id, email, password, name, phone, role, isActive, detectiveId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          id,
          d.email,
          hashed,
          d.name || d.email,
          d.phone || null,
          "detective",
          1,
          d.id,
        ]
      );
      console.log(`Created user ${d.email} -> id ${id} (pw: ${DEFAULT_PW})`);
      created++;
    }

    console.log(`Done. Created ${created} users`);
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
})();
