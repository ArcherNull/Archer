
import fg from 'fast-glob';
import type { Plugin } from 'vite';

interface PreloadImagesOptions {
    dir: string
    attrs: {
        rel: 'preload' | 'prefetch'
    }
}

export const preloadImages = (options: PreloadImagesOptions): Plugin => {
    const { dir } = options

    return {
        name: 'vite-plugin-image-prefetch',
        transformIndexHtml(html, ctx) {
            const files = fg.sync(dir, {
                // 获取vite.config.ts中设置的publicDir，默认'public'
                cwd: ctx.server?.config.publicDir
            })

            // 相对于dist包，获取vite.config.ts中设置的base，默认'/'
            const images = files.map((file) => ctx.server?.config.base + file)

            return images.map((href) => {
                return {
                    tag: 'link',
                    attrs: {
                        // preload优先级比prefetch高，preload只会请求一次直接展示到界面，
                        // 下次进入会很快看见图片，prefetch是在浏览器空闲的时候加载到磁盘，当访问图片是再从磁盘中读取展示，磁盘加载到界面过程中会有图片一闪的情况
                        rel: 'prefetch',
                        href: href,
                        as: 'image'
                    }
                }
            })
        }
    }
}