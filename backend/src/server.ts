import "dotenv/config";

import { app } from "./app.js";
import { validateEnvironment } from "./config/env.js";

const port = Number(process.env.PORT ?? 4000);

validateEnvironment();

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});
