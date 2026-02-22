
const images = [
    'http://localhost:3000/image1.jpg',
    'http://localhost:3000/image2.jpg',
    'http://localhost:3000/image3.jpg',
    'http://localhost:3000/image4.jpg',
    'http://localhost:3000/image5.jpg',
    'http://localhost:3000/image6.jpg',
    'http://localhost:3000/image7.jpg',
    'http://localhost:3000/image8.jpg',
    'http://localhost:3000/image9.jpg',
]

async function preloadImages(imgs) {
    const _images = [...imgs]
    function loadImage() {
        const src = _images.shift()
        return new Promise((resolve, reject) => {
            const link = document.createElement('link')
            link.rel = 'preload'
            link.as = 'image'
            link.href = src
            document.head.appendChild(link)
            link.onload = resolve
            link.onerror = reject
            setTimeout(reject, 10000)
        })
    }

    function _loadImage() {
        loadImage().finally(() => {
            if (_images.length) {
                _loadImage()
            }
        })
    }

    for (let i = 0; i < 3; i++) {
        _loadImage()
    }
}

preloadImages(images)