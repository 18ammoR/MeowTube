function extractYouTubeId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

function thumbnailFromId(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

module.exports = { extractYouTubeId, thumbnailFromId };