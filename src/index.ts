import "./env-loader";
import app from "./app";
import { deleteOldPdfFiles } from "./util/util";

const port = process.env.PORT || 3000;
app.listen(port, () => {
  /* eslint-disable no-console */
  console.log(`Listening: http://localhost:${port}`);
  /* eslint-enable no-console */
});

setInterval(() => {
  deleteOldPdfFiles();
}, 12 * 60 * 60 * 1000);
