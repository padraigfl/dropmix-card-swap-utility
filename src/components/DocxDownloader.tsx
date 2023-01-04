import { Packer, Document, Table, TableRow, TableCell, Paragraph, ImageRun, PageOrientation } from "docx";
import { useCallback } from "react";
import { playlists, Playlists } from "../datasets";

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

export const DocxDownloader = (props: { playlist: keyof Playlists }) => {
  const cards = playlists[props.playlist];
  const onDownload = useCallback(async () => {
    const images = await Promise.all(
      cards.map(card =>
        window.fetch(`/assets/cards/${card}.jpeg`)
          .then(res => res.arrayBuffer())
          .then(async ab => {

            const imgBlob = new Blob([new Uint8Array(ab)]);
            let { height, width } = await getImageSizeFromBlob(imgBlob);
            debugger;
            return {
              height,
              width,
              arrayBuffer: ab,
            }
          })
      )
    );
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
            children: images.map(v => new ImageRun({ data: v.arrayBuffer, transformation: { width: v.width / 2.4 , height: v.height / 2.4 } }))
          })
        ]
      }]
    })
    return Packer.toBlob(document).then(blob => {
      const aElement = window.document.createElement('a');
      aElement.setAttribute('download', 'testfile.docx');
      const href = URL.createObjectURL(blob);
      aElement.href = href;
      aElement.setAttribute('target', '_blank');
      aElement.click();
      URL.revokeObjectURL(href);
      aElement.remove();
    });
  }, [cards])

  return <button onClick={onDownload}>Download Docx</button>;
}