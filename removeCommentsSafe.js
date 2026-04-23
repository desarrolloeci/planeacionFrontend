// removeCommentsSafe.js
import fs from "fs";
import path from "path";

const directoryPath = "./src"; // 📁 cambia esto según tu proyecto

/**
 * Explicación del regex:
 * - Ignora contenido dentro de comillas simples, dobles o backticks.
 * - Elimina:
 *    // comentarios simples (no dentro de cadenas, ni después de http)
 *    /* ... * / comentarios multilínea
 */
const commentRegex = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\/(?!\s*http).*?$|\/\*[\s\S]*?\*\/)/gm;

function removeCommentsFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  // Reemplazamos solo las coincidencias del grupo 2 (comentarios reales)
  const cleaned = content.replace(commentRegex, (match, g1, g2) => {
    return g1 ? g1 : ""; // si es una cadena (g1), se conserva
  });

  fs.writeFileSync(filePath, cleaned.trim() + "\n", "utf-8");
  //////console.log(`🧹 Limpiado: ${filePath}`);
}

function processDirectory(dir) {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith(".jsx") || file.endsWith(".js")) {
      removeCommentsFromFile(fullPath);
    }
  });
}

processDirectory(directoryPath);
