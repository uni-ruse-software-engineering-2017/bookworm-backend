import * as xml2js from "xml2js";

const xmlParser = new xml2js.Parser({
  explicitArray: false,
  mergeAttrs: true
});

export async function xmlToJSON(xml: string) {
  return new Promise((resolve, reject) => {
    xmlParser.parseString(xml, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data as any);
    });
  });
}
