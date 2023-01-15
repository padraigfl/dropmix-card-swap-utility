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
    try {
      const newImage = await new Promise<{ height: number, width: number, arrayBuffer: ArrayBuffer, name: CardKey, alt: string}>(res => 
        setTimeout(() => {
          window.fetch(`/assets/images/print/card_${cards[i]}.png.jpeg`)
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
    } catch (e) {
      alert(e);
      return;
    }

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
            top: 500,
            bottom: 500,
            left: 500,
            right: 500,
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
              transformation: { width: (v.width * 10) / 29.67 , height: (v.height * 10) / 29.67 },
              // transformation: { width: 239.298955173576, height: 335.6926188068756 },
              altText: {
                name: v.name,
                description: v.alt,
                title: v.name,
              }
            })
          }),
          spacing: {
            // // TODO resolve whitespace between rows of cards
            // line: 0,
            // lineRule: LineRuleType.EXACT,
            // beforeAutoSpacing: false,
            // afterAutoSpacing: false,

          }
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
