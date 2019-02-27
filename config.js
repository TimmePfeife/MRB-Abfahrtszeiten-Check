/**
 * Anwendungsspezifische Einstellungen
 */
module.exports = {
    // API
    URL: 'https://www.mitteldeutsche-regiobahn.de/de/abfahrtsmonitor.json',
    // Abfahrtsbahnhof (siehe stations.js)
    DEPARTURE: "DH",
    // Abfahrtszeit
    DEPARTURE_TIME: "15:52",
    // Abfrage in die Zukunft
    OFFSET: 0,
    // Anzahl der Ergebnisse
    LIMIT: 10,
    // Zugangsdaten Mailversand
    HOST: '',
    PORT: 465,
    SSL: true,
    USER: '',
    PASS: '',
    // Anzeige
    PRINT_CONSOLE: true,
    // Versandoptionen
    SEND_MAIL: false,
    FROM: `"Verspätungsalarm" <mailer@test.com>`,
    TO: '"Max Mustermann" <max_mustermann@test.com>',
    SUBJECT: 'MRB ##STATUS## Abfahrtszeiten',
    // Ergebnis Speichern
    SAVE_HTML: false,
    FILENAME: 'result.html',
    DIRECTORY: './out'
};