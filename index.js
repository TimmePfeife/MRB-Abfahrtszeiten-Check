const Axios = require('axios');
const CTable = require('console.table');
const Fs = require('fs');
const Mailer = require('nodemailer');
const Path = require('path');

const Config = require('./config')
const Stations = require('./stations');

/**
 * Abfrage der Abfahrtszeiten von der API.
 */
async function getDeparture() {
  try {
    const options = {
      params: {
        limit: Config.LIMIT
      },
      data: {
        station: Config.DEPARTURE,
        offset: Config.OFFSET
      }
    }

    const result = await Axios.get(Config.URL, options);

    return result.data;
  } catch (err) {
    console.log(err);
    return null;
  }
}

/**
 * Status der abgefragten Abfahrtszeiten.
 * @param {Array} departures 
 * @returns {Boolean} true/false
 */
function isDelayed(departures) {
  if (!departures) return true;

  for (const el in departures) {
    if (el.status !== "puenktlich") {
      return false;
    }
  }

  return true;
}

/**
 * Liefert die Abfahrtszeiten im HTML-Format zurück.
 * @param {Array} departures 
 */
function getHtml(departures = []) {
  const station = Stations.find(st => st.ds100 === Config.DEPARTURE);

  let table = "";
  if (departures) {
    departures.forEach((el) => {
      let trStyle = "";
      if (el.departure_time === Config.DEPARTURE_TIME) {
        trStyle = "background-color: lightblue;";
      }

      let delayStyle = "font-weight: bold;";
      if (el.delay > 0) {
        delayStyle += "color: red;";
      } else {
        delayStyle += "color: green;";
      }

      table += `
      <tr style="${trStyle}">
          <td>
            ${el.departure_time} <span style="${delayStyle}">+${el.delay}</span>
          </td>
          <td>
            ${el.direction}
          </td>
          <td>
            ${el.transport}
          </td>
          <td>
            ${el.cancellation ? 'Ausgefallen' : el.status}
          </td>
      </tr>
    `;
    });
  }

  const html = `
  <html>
      <head></head>
      <body>
          <h1>${station ? station.name : Config.DEPARTURE}</h1>
          <table style="table-layout: fixed;">
              <thead>
                  <th style="width:100px;">Abfahrt</th>
                  <th style="width:300px;">Zielbahnhof</th>
                  <th style="width:100px;">Zug</th>
                  <th style="width:100px;">Status</th>
              </thead>
              <tbody>
                ${table}
              </tbody>
          </table>
      </body>
  </html>
  `;

  return html;
}

/**
 * Speichert die Abfahrtszeiten als HTML-File.
 * @param {String} html 
 */
function saveHtml(html) {
  if (!Fs.existsSync(Config.DIRECTORY)) {
    Fs.mkdirSync(Config.DIRECTORY);
  }

  const filePath = Path.join(Config.DIRECTORY, Config.FILENAME);

  Fs.writeFileSync(filePath, html);
}

/**
 * Versendet eine E-Mail mit den Ergebnissen.
 * @param {String} html 
 * @param {Boolean} status 
 */
async function sendMail(html, status) {
  const transportOptions = {
    host: Config.HOST,
    port: Config.PORT,
    auth: {
      user: Config.USER,
      pass: Config.PASS
    }
  };

  let subject = 'pünktliche';
  if (!status) {
    subject = 'verspätete';
  }

  const mailOptions = {
    from: Config.FROM,
    to: Config.TO,
    subject: Config.SUBJECT.replace('##STATUS##', subject),
    html: html
  };

  const transporter = Mailer.createTransport(transportOptions);
  const info = await transporter.sendMail(mailOptions)

  console.log(info);
}

/**
 * Darstellung der Ergebnisse als Tabelle auf der Konsole.
 * @param {Array} departures 
 */
function printAsTable(departures = []) {
  const table = departures.map((el) => {
    return {
      Abfahrt: `${el.departure_time} +${el.delay}`,
      Zielbahnhof: el.direction,
      Zug: el.transport,
      Status: `${el.cancellation ? 'Ausgefallen' : el.status}`,
    }
  });

  console.table(table);
}

/**
 * MAIN
 */
async function main() {
  const zeiten = await getDeparture();
  const html = getHtml(zeiten.departures);

  if (Config.PRINT_CONSOLE) {
    printAsTable(zeiten.departures);
  }

  if (Config.SAVE_HTML) {
    saveHtml(html);
  }

  if (Config.SEND_MAIL) {
    await sendMail(html, isDelayed(zeiten.departures));
  }
}

main();