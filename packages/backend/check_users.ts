import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./src/entities/User";

const dataSource = new DataSource({
  type: "sqlite",
  database: "piip.db",
  entities: [User],
  synchronize: false,
});

async function checkUsers() {
  await dataSource.initialize();
  const userRepo = dataSource.getRepository(User);

  const users = await userRepo.find({
    where: [
      { email: "testuser1@piip.com" },
      { email: "testuser2@piip.com" },
      { email: "testuser3@piip.com" },
    ],
  });

  console.log("User roles:");
  users.forEach((user) => {
    console.log(`${user.email}: ${user.role}`);
  });

  await dataSource.destroy();
}

checkUsers().catch(console.error);
