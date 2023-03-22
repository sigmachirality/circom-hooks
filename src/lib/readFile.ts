import fs from "fs"

export default function readFile(path: string) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (error, data) => (error ? reject(error) : resolve(data)))
  })
}
