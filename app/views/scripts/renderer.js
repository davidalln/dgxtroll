$(document).ready(async () => {
  // fill available midi outputs
  const renderedMidi = await dgxAPI.renderedMidi()
  $("#controller #midi").append(renderedMidi)

  const maxParts = await dgxAPI.maxParts()
  
  for (var part = 0; part < maxParts; part++) {
    // add the UI elements of the voice to the DOM
    const renderedPart = await dgxAPI.renderedPart(part)
    $("#controller #parts").append(renderedPart)

    const renderedPart_VoiceSelector = await dgxAPI.renderedPart_VoiceSelector(part)
    $(`#controller #parts #part-${part}-voice-selector`).append(renderedPart_VoiceSelector)
  }
})

