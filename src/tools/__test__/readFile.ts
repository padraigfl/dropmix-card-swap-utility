import fs from 'fs';

const readFile = async (filePath: string) => {
  return new Promise<Uint8Array>((res) => {
    fs.readFile(filePath, (err, data) => {
      if (err) throw Error(err.message);
      const fileByteArray = new Uint8Array(data);
      res(fileByteArray);
    })
  })
}

export default readFile