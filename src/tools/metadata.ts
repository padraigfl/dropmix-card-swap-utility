// Formats:
// - LIC_0000_Instrument
// - HMX_0000_Instrument
// - FX_0000
// - FX_0000_FX
const cardIdRegEx = /[A-Z]{2,3}_\d{4}_?[A-Z]{0,2}[a-z]{0,3}/

// formatted to match stored data in updated DB
const prevIdRegex = new RegExp(
  `__${
    cardIdRegEx.toString()
      .replace(/^\//, '')
      .replace(/\/$/, '')
  }__`)

// get previous ID from data string
export const getPrevId = (dataString: string) => {
  return dataString.match(prevIdRegex)?.[0];
}

export const addOldIdToString = (copyright: string, oldId: string, rowLengthAdjuster = 0) => {
  // length of previous ID
  // + 4 for the wrapper characters
  // + the length difference between the old and new id to ensure DB remains same length
  const regex = new RegExp(`(.*).{${oldId.length + 4 + rowLengthAdjuster}}("\n?)$`);
  return copyright.replace(regex, `$1__${oldId}__$2`)
}
