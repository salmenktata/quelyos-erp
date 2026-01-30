const { fileTypeFromBuffer } = require('file-type');
const { parse } = require('csv-parse/sync');
const ExcelJS = require('exceljs');
const logger = require('../../logger');

/**
 * Valide les magic bytes d'un fichier
 * @param {Buffer} buffer - Buffer du fichier
 * @param {string} mimetype - MIME type déclaré
 * @returns {Promise<{valid: boolean, detectedType: string}>}
 */
async function validateMagicBytes(buffer, mimetype) {
  try {
    // CSV n'a pas de magic bytes, vérification manuelle
    if (mimetype === 'text/csv') {
      const text = buffer.toString('utf-8', 0, Math.min(100, buffer.length));
      // Pattern basique CSV: contient des séparateurs communs
      const valid = /^[^<>{}]*[,;|\t]/.test(text);
      return { valid, detectedType: valid ? 'text/csv' : 'unknown' };
    }

    // XLSX validation avec magic bytes
    if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      const detected = await fileTypeFromBuffer(buffer);

      if (!detected) {
        // Fallback: vérifier signature ZIP (xlsx sont des archives ZIP)
        const zipSignature = buffer.slice(0, 4).toString('hex');
        const isZip = zipSignature === '504b0304' || zipSignature === '504b0506';
        return {
          valid: isZip,
          detectedType: isZip ? 'application/zip' : 'unknown'
        };
      }

      // Accepter zip/xlsx
      const valid = detected.mime === mimetype ||
                   detected.mime === 'application/zip';

      return {
        valid,
        detectedType: detected.mime
      };
    }

    // Type non supporté
    return {
      valid: false,
      detectedType: 'unsupported'
    };
  } catch (err) {
    logger.error('[FileValidation] Error validating magic bytes:', err);
    return {
      valid: false,
      detectedType: 'error'
    };
  }
}

/**
 * Parse un fichier CSV/XLSX en headers et rows
 * @param {Buffer} buffer - Buffer du fichier
 * @param {string} mimetype - MIME type
 * @returns {Promise<{headers: string[], rows: Object[]}>}
 */
async function parseFile(buffer, mimetype) {
  try {
    let data;

    if (mimetype === 'text/csv') {
      // Détection encoding: UTF-8 par défaut, fallback Latin1
      let text;
      try {
        text = buffer.toString('utf-8');
        // Vérifier si le texte contient des caractères invalides
        if (text.includes('\uFFFD')) {
          throw new Error('Invalid UTF-8');
        }
      } catch {
        // Fallback pour fichiers banques françaises souvent en Latin1
        logger.info('[FileValidation] UTF-8 failed, trying Latin1 encoding');
        text = buffer.toString('latin1');
      }

      // Parsing CSV avec détection auto du délimiteur
      data = parse(text, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relaxColumnCount: true, // Tolérance sur nombre de colonnes
        delimiter: [',', ';', '\t'], // Auto-détection
        cast: false, // Garder tout en string pour analyse
      });

    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      // Parsing XLSX avec exceljs
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);

      if (workbook.worksheets.length === 0) {
        throw new Error('Fichier Excel vide (aucune feuille)');
      }

      const worksheet = workbook.worksheets[0];
      data = [];
      let headers = [];

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) {
          // Extraire les headers
          row.eachCell((cell, colNumber) => {
            headers[colNumber - 1] = String(cell.value || '');
          });
        } else {
          // Extraire les données
          const rowData = {};
          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber - 1] || `Column${colNumber}`;
            let value = cell.value;

            // Convertir en string (équivalent raw: false)
            if (value instanceof Date) {
              // Format date normalisé (équivalent dateNF: 'yyyy-mm-dd')
              const year = value.getFullYear();
              const month = String(value.getMonth() + 1).padStart(2, '0');
              const day = String(value.getDate()).padStart(2, '0');
              value = `${year}-${month}-${day}`;
            } else if (value !== null && value !== undefined) {
              value = String(value);
            } else {
              value = ''; // Valeur par défaut (équivalent defval: '')
            }

            rowData[header] = value;
          });
          data.push(rowData);
        }
      });

    } else {
      throw new Error(`Type de fichier non supporté: ${mimetype}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Aucune donnée trouvée dans le fichier');
    }

    const headers = Object.keys(data[0]);

    logger.info(`[FileValidation] File parsed successfully: ${headers.length} colonnes, ${data.length} lignes`);

    return { headers, rows: data };

  } catch (err) {
    logger.error('[FileValidation] Error parsing file:', err);
    throw new Error(`Erreur de parsing: ${err.message}`);
  }
}

/**
 * Valide la taille et le contenu d'un fichier
 * @param {Buffer} buffer - Buffer du fichier
 * @param {Object} options - Options de validation
 * @returns {{valid: boolean, errors: string[]}}
 */
function validateFileConstraints(buffer, options = {}) {
  const errors = [];
  const {
    maxSizeMB = 15,
    maxRows = 10000,
  } = options;

  // Taille
  const sizeMB = buffer.length / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    errors.push(`Fichier trop volumineux (${sizeMB.toFixed(1)} MB > ${maxSizeMB} MB)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    sizeMB: sizeMB.toFixed(2),
  };
}

module.exports = {
  validateMagicBytes,
  parseFile,
  validateFileConstraints,
};
