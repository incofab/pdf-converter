import dotenv from "dotenv";
import path from "path";
import fs from "fs";

function loadEnvFile() {
  const possibleFolders: string[] = [
    __dirname + "/./../",
    __dirname + "/./../../",
  ]; // Specify the possible folders where the .env file can be located

  for (const folder of possibleFolders) {
    const envFilePath = path.join(folder, ".env");
    if (fs.existsSync(envFilePath)) {
      dotenv.config({ path: envFilePath });
      console.log(`Loaded .env file from ${envFilePath}`);
      return;
    }
  }

  console.error("No .env file found in the specified folders");
}

// Call the loadEnvFile function when starting your Express.js application
loadEnvFile();

// Rest of your Express.js application code
// ...
