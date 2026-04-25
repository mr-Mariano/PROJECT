import path from "path";
import { __dirname } from "../env.js";

const send_views = (res, file) => {
    res.sendFile(path.resolve(__dirname, `../FRONTEND/views/${file}.html`))
}

export default send_views