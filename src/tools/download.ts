import { Document, ImageRun, Packer, Paragraph } from "docx";
import { CardKey } from "../datasets";
import { Swapped } from "../Swap/SwapContext";

const getImageSizeFromBlob = (dataBlob: Blob) => new Promise<{ width: number, height: number }>(resolve => {
  const dataURL = URL.createObjectURL(dataBlob);
  const img = new Image()
  img.onload = () => {
    resolve({
      height: img.height,
      width: img.width
    })
  }
  img.src = dataURL
});

export function downloadFile(blob: Blob, name: string) {
  const aElement = window.document.createElement('a');
  aElement.setAttribute('download', name);
  const href = URL.createObjectURL(blob);
  aElement.href = href;
  aElement.setAttribute('target', '_blank');
  aElement.click();
  URL.revokeObjectURL(href);
  aElement.remove();
}

export async function downloadCardPrintsheet(cards: CardKey[], altTags: string[], filename: string){
  const images = [];
  for (let i = 0; i < cards.length; i++){

    const newImage = await new Promise<{ height: number, width: number, arrayBuffer: ArrayBuffer, name: CardKey, alt: string}>(res => 
      setTimeout(() => {
        window.fetch(`/assets/cards/${cards[i]}.jpeg`)
        .then(res => res.arrayBuffer())
        .then(async ab => {
          const imgBlob = new Blob([new Uint8Array(ab)]);
          let { height, width } = await getImageSizeFromBlob(imgBlob);
          res({
            height,
            width,
            arrayBuffer: ab,
            name: cards[i],
            alt: altTags?.[i] ? `${cards[i]} swapped for ${altTags[i]}` : cards[i],
          })
        })
      }, 100)
    )
    images.push(newImage);
  }
  // const groupedImages = [] as any[];
  // images.forEach((i, idx) => {
  //   if (idx % 3 === 0) {
  //     groupedImages.push([i]);
  //   } else {
  //     groupedImages[groupedImages.length - 1].push(i);
  //   }
  // })
  const document = new Document({
    sections: [{
      properties: {
        page: {
          size: {
            // orientation: PageOrientation.LANDSCAPE,
          },
          margin: {
            top: 400,
            bottom: 400,
            left: 400,
            right: 400,
          },
        },
      },
      children: [
        new Paragraph({
          children: images.map((v, idx) => {
            if (!v || !v.arrayBuffer) {

              new Text(`Missing image for ${v?.name}` || 'error')
            }
            return new ImageRun({
              data: v.arrayBuffer,
              transformation: { width: v.width / 2.4 , height: v.height / 2.4 },
              altText: {
                name: v.name,
                description: v.alt,
                title: v.name,
              }
            })
          })
        })
      ]
    }]
  })
  return Packer.toBlob(document).then(blob => {
    downloadFile(blob, filename+'.docx')
  });
}

export function downloadSwapData(swapData: Swapped, filename: string) {
  const swapBlob = new Blob(
    [JSON.stringify(swapData)],
    {type : "application/json"}
  );
  downloadFile(swapBlob, filename);
}
