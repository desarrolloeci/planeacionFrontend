import fs from "fs";
import path from "path";

function processFile(filePath) {
    let content = fs.readFileSync(filePath, "utf8");

    // Regex: busca cualquier cadena entre comillas simples o dobles que empiece con ${API_BASE_URL}
    const regex = /(['"])((?:\$\{API_BASE_URL\}[^'"]*))\1/g;

    if (!regex.test(content)) return; // si no hay coincidencias, no hace nada

    const newContent = content.replace(regex, "`$2`");

    fs.writeFileSync(filePath, newContent, "utf8");
    //////console.log(`✅ Corregido: ${filePath}`);
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else if (/\.(js|jsx|ts|tsx)$/.test(fullPath)) {
            processFile(fullPath);
        }
    });
}

// Cambia "./src" si tu código está en otra carpeta
walkDir("./src");
