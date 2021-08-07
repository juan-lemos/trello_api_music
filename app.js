const utils = require("./utils");
const { getDecadesWithAlbums } = require("./readAlbums");
require("dotenv").config();
const trelloApiUrl = "api.trello.com";
const spotifyApiUrl = "api.spotify.com";
const trelloApiKey = process.env.TRELLO_API_KEY;
const trelloApiToken = process.env.TRELLO_API_TOKEN;
const spotifyToken = process.env.SPOTIFY_TOKEN;

const decadesAlbum = getDecadesWithAlbums();

async function createTrelloBoard() {
  const board = await utils.doRequest(
    {
      hostname: trelloApiUrl,
      path: `/1/boards?key=${trelloApiKey}&token=${trelloApiToken}&name=Bob%20Dylan%20Albums&defaultLists=false&defaultLabels=false`,
      method: "POST",
    },
    ""
  );
  if (board && board.id) {
    for (const decade of Object.keys(decadesAlbum).sort().reverse()) {
      const decadeList = await utils.doRequest(
        {
          hostname: trelloApiUrl,
          path: `/1/lists?key=${trelloApiKey}&token=${trelloApiToken}&name=${decade}&idBoard=${board.id}`,
          method: "POST",
        },
        ""
      );
      for (const album of decadesAlbum[decade]) {
        if (decadeList && decadeList.id) {
          const card = await utils.doRequest(
            {
              hostname: trelloApiUrl,
              path: `/1/cards?key=${trelloApiKey}&token=${trelloApiToken}&name=${encodeURIComponent(
                album
              )}&idList=${decadeList.id}`,
              method: "POST",
            },
            ""
          );

          const albumData = await utils.doRequest(
            {
              hostname: spotifyApiUrl,
              path: `/v1/search?q=${encodeURIComponent(
                album.substring(5) + " Bob Dylan"
              )}&type=album&market=US&limit=1&offset=0`,
              method: "GET",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${spotifyToken}`,
              },
            },
            ""
          );

          if (
            card &&
            card.id &&
            albumData &&
            albumData.albums &&
            albumData.albums.items &&
            albumData.albums.items[0] &&
            albumData.albums.items[0].images &&
            albumData.albums.items[0].images.length
          ) {
            await utils.doRequest(
              {
                hostname: trelloApiUrl,
                path: `/1/cards/${card.id}/attachments?key=${trelloApiKey}&token=${trelloApiToken}`,
                method: "POST",
              },
              JSON.stringify({
                url: albumData.albums.items[0].images.sort((imageA, imageB) =>
                  imageA.height < imageB.height ? 1 : -1
                )[0].url,
                setCover: "true",
              })
            );
          }
        }
      }
    }
  }
  console.log("Todo ha sido creado");
}

createTrelloBoard();
