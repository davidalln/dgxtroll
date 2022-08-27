async function ui_touchMidi() {
  const renderedMidi = await dgxAPI.renderedMidi()
  $("#midi").html(renderedMidi)

  $("#midi-connect").click(async () => {
    await dgxAPI.setMidiOutput($("#midi-outputs option:selected").val())
    await ui_touchMidi()
  })

  $("#midi-test-note").click(async () => {
    await dgxAPI.sendTestNote()
  })
}

async function ui_touchPart_VoiceSelector(part) {
  const _part = part

  const renderedPart_VoiceSelector = await dgxAPI.renderedPart_VoiceSelector(_part)
  $(`#part-${_part}-voice-selector`).html(renderedPart_VoiceSelector)

  $(`#part-${_part}-category`).change(async () => {
    await dgxAPI.setPartVoiceCategory(_part, $(`#part-${_part}-category option:selected`).val())
    await ui_touchPart_VoiceSelector(_part)
    await dgxAPI.sendProgramChange(_part, $(`#part-${_part}-voice option:selected`).val())
  })

  $(`#part-${_part}-voice`).change(async () => {
    await dgxAPI.sendProgramChange(_part, $(`#part-${_part}-voice option:selected`).val())
  })
}

async function ui_touchPart(part) {
  const _part = part

  const renderedPart = await dgxAPI.renderedPart(part)
  $(`#part-${_part}`).html(renderedPart)

  $(`#part-${_part}-volume`).change(async () => {
    await dgxAPI.sendVolume(_part, $(`#part-${_part}-volume`).val())
  })

  $(`#part-${_part}-pan`).change(async () => {
    await dgxAPI.sendPan(_part, $(`#part-${_part}-pan`).val())
  })

  await ui_touchPart_VoiceSelector(part)
}

$(document).ready(async () => {
  ui_touchMidi()

  const maxParts = await dgxAPI.maxParts()
  
  for (var part = 0; part < maxParts; part++) {
    $("<div>").attr({id: `part-${part}`}).appendTo("#parts")
    await ui_touchPart(part)
    await dgxAPI.sendProgramChange(part, $(`#part-${part}-voice option:selected`).val())
  }
})

