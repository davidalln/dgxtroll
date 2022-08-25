const DEFAULTS = {
  msb: 0,
  lsb: 0,
  pgm: 0,
  atk: 0,
  rel: 0
}

const dgx = {
  voices: []
}

$(document).ready(async () => {
  const maxVoices = await dgxAPI.maxVoices()
  
  for (var i = 0; i < maxVoices; i++) {
    const renderedVoice = await dgxAPI.renderedVoice(i)
    $("#controller #parts").append(renderedVoice)

    dgx.voices.push({
      id: i,
      msb: DEFAULTS["msb"],
      lsb: DEFAULTS["lsb"],
      pgm: DEFAULTS["pgm"],
      atk: DEFAULTS["atk"],
      rel: DEFAULTS["rel"],
    })
  }

  console.log(dgx)
})

