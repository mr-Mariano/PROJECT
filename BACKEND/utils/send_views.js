import path from "path";
import { __dirname } from "../env.js";

const send_views = (res, file) => {
    const filePath = path.resolve(__dirname, `../FRONTEND/views/${file}.html`)

    res.sendFile(filePath, (err) => {
        if (err) {
            console.error('Error al enviar archivo:', err.message)
            res.status(404).send(`Archivo no encontrado: ${filePath}`)
        }
    })
}



export default send_views