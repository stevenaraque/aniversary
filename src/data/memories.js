// PASEO DE RECUERDOS
// Cada objeto tiene: type ('image' | 'video'), src (ruta del archivo o URL), caption (texto descriptivo)
// Para videos, usa src con ruta .mp4 o URL de YouTube/Vimeo
// Para fotos, usa src con ruta .jpg/.png en la carpeta /public/ o URL externa

const memories = [
  {
    type: 'image',
    src: '/puzzle-main.jpg',
    caption: 'Nuestro disfraz de piratas',
  },
  {
    type: 'image',
    src: '/puzzle-main.jpg',
    caption: 'Juntos siempre',
  },
  {
    type: 'video',
    src: '',
    caption: 'Video especial (reemplaza con tu video)',
  },
  {
    type: 'image',
    src: '/puzzle-main.jpg',
    caption: 'Momentos que atesoro',
  },
  {
    type: 'image',
    src: '/puzzle-main.jpg',
    caption: 'Otro recuerdo bonito',
  },
]

export default memories
