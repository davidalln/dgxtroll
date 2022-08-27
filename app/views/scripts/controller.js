const DEFAULTS = {
  msb: 0,
  lsb: 0,
  pgm: 0,
  atk: 0,
  rel: 0
}

const dgx = {
  pgmData: [],
  parts: []
}

$(document).ready(async () => {
  // fill available midi outputs
  const renderedMidi = await dgxAPI.renderedMidi()
  $("#controller #midi").append(renderedMidi)

  const maxParts = await dgxAPI.maxParts()
  dgx.pgmData = await dgxAPI.dgxPgmData()
  
  for (var part = 0; part < maxParts; part++) {
    // add the UI elements of the voice to the DOM
    const renderedPart = await dgxAPI.renderedPart(part)
    $("#controller #parts").append(renderedPart)

    dgx.parts.push({
      id: part,
      msb: DEFAULTS["msb"],
      lsb: DEFAULTS["lsb"],
      pgm: DEFAULTS["pgm"],
      atk: DEFAULTS["atk"],
      rel: DEFAULTS["rel"],
    })
  }
})

