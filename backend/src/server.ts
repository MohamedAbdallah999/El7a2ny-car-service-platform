import "dotenv/config";

import { app } from "./app.js";
import { env, validateEnvironment } from "./config/env.js";

validateEnvironment();

app.listen(env.port, () => {
  console.log(`Backend listening on port ${env.port}`);
});
