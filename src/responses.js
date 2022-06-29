import sqlite3 from 'sqlite3';

sqlite3.verbose();

const db = new sqlite3.Database('bot.db');

let _search = function(sql, params) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err)
            else resolve(rows);
        });
    });
}

/**
 * Search result object representation
 */
class SearchResult {
    /**
     * Creates SearchResult object from database row
     * @param {Object} row 
     */
    constructor(row) {
        this.id = row.id;
        this.original_text = row.original_text;
        this.hero_name = row.hero_name;
        this.response_link = row.response_link;
    }
}

/**
 * Search responses containing query string
 * @param {string} query 
 * @returns {Promise<SearchResult[]>}
 */
async function search(query)
{
    query = normalize(query);
    const sql = 
    `SELECT R.id, original_text, hero_name, response_link
    FROM Responses R 
    LEFT JOIN Heroes H ON R.hero_id = H.id 
    WHERE processed_text LIKE (?) LIMIT 10
    `;

    return _search(sql, [`%${query}%`]).then(
        r => r.map(row => new SearchResult(row))
    );
}
/**
 * 
 * replaces all punctuations with spaces
 * replaces all whitespace characters (tab, newline etc) with spaces
 * removes trailing and leading spaces
 * removes double spaces
 * changes to lowercase
 * @param {string} query 
 * @returns {string}
 */
function normalize(query)
{
    let result = query.replace(/[^\w ]/g, ' ');
    result = result.toLowerCase();
    result = result.replace(/\s{2,}/g, ' ');
    return result;
}

export { search as searchResponse};
