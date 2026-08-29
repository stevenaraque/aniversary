// PLAYLIST DE CANCIONES
// Cada objeto tiene: title, artist, src (ruta .mp4/.mp3 o URL)
// Para URLs de YouTube, usa la URL completa
// Para archivos locales, colóchalos en /public/music/

// Cada objeto: { title, artist, duration ("m:ss"), seconds, src }
// duration/seconds se muestran en la playlist y la barra de progreso.
// src: ruta .mp3/.mp4 (colócalos en /public/music/) o URL completa.
// Dejar src:'' usa la reproducción simulada (progreso por duración).

const songs = [
  { title: 'Nuestra canción 1', artist: 'Artista', duration: '3:45', seconds: 225, src: '' },
  { title: 'Nuestra canción 2', artist: 'Artista', duration: '4:12', seconds: 252, src: '' },
  { title: 'Nuestra canción 3', artist: 'Artista', duration: '3:28', seconds: 208, src: '' },
  { title: 'Nuestra canción 4', artist: 'Artista', duration: '5:01', seconds: 301, src: '' },
  { title: 'Nuestra canción 5', artist: 'Artista', duration: '3:56', seconds: 236, src: '' },
]

export default songs
