const fs = require("fs");

function getDecadesWithAlbums() {
  var data = "";
  try {
    data = fs.readFileSync("./discography.txt", "utf8");
  } catch (err) {
    console.error(err);
  }

  const albums = data.trim().split("\n").sort();

  const decadesAlbum = albums.reduce((prevValue, album) => {
    if (!prevValue[album.substring(0, 3) + "0s"]) {
      prevValue[album.substring(0, 3) + "0s"] = [];
    }
    prevValue[album.substring(0, 3) + "0s"].push(album);
    return prevValue;
  }, {});
  return decadesAlbum;
}

module.exports = { getDecadesWithAlbums };
