// Generates solid-color PNG icons using only Node.js built-ins
const fs = require('fs')
const zlib = require('zlib')

const crcTable = (() => {
  const t = []
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = (c & 1) ? 0xEDB88320 ^ (c >>> 1) : c >>> 1
    t.push(c >>> 0)
  }
  return t
})()

function crc32(buf) {
  let crc = 0xFFFFFFFF
  for (const b of buf) crc = (crcTable[(crc ^ b) & 0xFF] ^ (crc >>> 8)) >>> 0
  return (crc ^ 0xFFFFFFFF) >>> 0
}

function chunk(type, data) {
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length)
  const typeData = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(typeData))
  return Buffer.concat([lenBuf, typeData, crcBuf])
}

function createSolidPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // bit depth
  ihdr[9] = 2  // RGB colour type
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  // Raw image: one filter byte (0x00) + RGB per pixel, repeated for each row
  const row = Buffer.alloc(1 + size * 3)
  row[0] = 0
  for (let x = 0; x < size; x++) {
    row[1 + x * 3] = r
    row[2 + x * 3] = g
    row[3 + x * 3] = b
  }
  const raw = Buffer.concat(Array.from({ length: size }, () => row))
  const idat = zlib.deflateSync(raw, { level: 9 })

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))])
}

fs.mkdirSync('public/icons', { recursive: true })

// #1A6B3C → rgb(26, 107, 60)
const png192 = createSolidPNG(192, 26, 107, 60)
const png512 = createSolidPNG(512, 26, 107, 60)

fs.writeFileSync('public/icons/icon-192.png', png192)
fs.writeFileSync('public/icons/icon-512.png', png512)
console.log('Icons generated: public/icons/icon-192.png & icon-512.png')
