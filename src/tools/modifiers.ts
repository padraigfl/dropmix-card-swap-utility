import { addOldIdToString } from "./metadata";
import { DBRowData } from "./parseDatabase";

// hacky way of combining copyright string
const splitDataCleanly = (dataString: string): string[] => {
  const splitData = dataString.split(',');
  let finalEntry = '';
  let i = splitData.length - 1;
  while (i >= 0) {
    if (Number.isNaN(+splitData[i])) {
      finalEntry = `${splitData[i]},${finalEntry}`
    } else if (!Number.isNaN(splitData[i])) {
      break;
    }
    i--
  }
  return [
    ...splitData.slice(0, i+1),
    finalEntry.replace(/,$/, ''),
  ]
}

export const changeCardRelation = (data: DBRowData, newId: string): DBRowData => {
  const splitData = splitDataCleanly(data.content);
  splitData[0] = splitData[0].replace(data.id, newId);
  splitData[splitData.length - 1] = addOldIdToString(splitData[splitData.length - 1], data.id, data.id.length - newId.length);
  const newContent = splitData.join(',');
  if (newContent.length !== data.content.length) {
    let start = (newContent.length < data.content.length ? newContent.length : data.content.length) - 10;
    throw Error(`Lengths do not match: new ${newContent.length} vs old ${data.content.length};\n\`${newContent.substring(start)}\`\n\`${data.content.substring(start)}\``);
  }
  return {
    ...data,
    id: newId,
    content: newContent,
  }
}