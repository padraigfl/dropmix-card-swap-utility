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
  // as the ID can vary in length, we need to ensure database size remains consistent
  // this needs to cut down longer strings and pad out shorter ones
  let cp = copyright;
  if (rowLengthAdjuster < 0) {
    const abs = Math.abs(rowLengthAdjuster);
    cp = cp.substring(0, cp.length - abs);
  } else if (rowLengthAdjuster > 0) {
    cp = cp.padEnd(cp.length + rowLengthAdjuster, ' ')
  }
  const regex = new RegExp(`^(.*)(.{${oldId.length + 4}})("\n?)$`);
  return cp.replace(regex, `$1__${oldId}__$3`)
}
