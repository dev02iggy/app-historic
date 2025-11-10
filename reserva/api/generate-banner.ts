import { defineEventHandler } from 'h3'
import puppeteer from 'puppeteer'
import sharp from 'sharp'

export default defineEventHandler(async (event) => {
  const width = 400
  const height = 720
  const scale = 2 // para alta qualidade (Retina, etc.)

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            width: ${width}px;
            height: ${height}px;
            font-family: Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            background: red;
            color: white;
          }
          .container {
            text-align: center;
            background: blue;
            width: 100%;
            height: 100%;
          }
          .title {
            font-size: 32px;
            font-weight: bold;
          }
          .subtitle {
            font-size: 20px;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div>
            <img src="https://upload.wikimedia.org/wikipedia/pt/thumb/9/90/ECBahia.png/330px-ECBahia.png" alt="Escudo do Bahia" />
          </div>
          <div class="title">Título do Story</div>
          <div class="subtitle">Subtítulo com link ou algo assim</div>
        </div>
      </body>
    </html>
  `

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  await page.setViewport({
    width,
    height,
    deviceScaleFactor: scale,
  })

  await page.setContent(html, { waitUntil: 'networkidle0' })

  // Captura a tela com área ajustada ao scale
  const buffer = await page.screenshot({
    type: 'png',
    clip: {
      x: 0,
      y: 0,
      width: width,
      height: height,
    },
  })

  await browser.close()

  // Redimensiona de volta com qualidade usando sharp
  const finalBuffer = await sharp(buffer)
    .resize(width, height) // volta ao tamanho "lógico" 400x720
    .png({ quality: 100 })
    .toBuffer()

  const res = event.node.res
  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Content-Disposition', 'inline; filename=story-banner.png')
  res.setHeader('Content-Length', finalBuffer.length)
  res.end(finalBuffer)
})
