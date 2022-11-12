import { addOldIdToString } from "./metadata";
import { DBRowData } from "./parseDatabase";

export const changeCardRelation = (data: DBRowData, newId: string) => {
  const splitData = data.content.split(',');
  splitData[0].replace(data.id, newId);
  splitData[splitData.length - 1] = addOldIdToString(splitData[splitData.length - 1], data.id, data.id.length - newId.length);
  const newContent = splitData.join(',');
  if (newContent.length !== data.content.length) {
    throw Error("Lengths do not match");
  }
  return {
    ...data,
    id: newId,
    content: newContent,
  }
}