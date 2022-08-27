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
    dgxAPI.sendProgramChange(_part, $(`#part-${_part}-voice option:selected`).val())
  })
}

async function ui_touchPart(part) {
  const renderedPart = await dgxAPI.renderedPart(part)
  $(`#part-${part}`).html(renderedPart)

  await ui_touchPart_VoiceSelector(part)

  $(`#part-${part} .part_control`).each(async function(_, ) {
    $(this).on("input", async function() {
      dgxAPI.sendControl(part, $(this).attr("name"), $(this).val())
    })
  })
}

$(document).ready(async () => {
  ui_touchMidi()

  const maxParts = await dgxAPI.maxParts()
  
  for (var part = 0; part < maxParts; part++) {
    $("<div>").attr({class: "part", id: `part-${part}`}).appendTo("#parts")
    await ui_touchPart(part)
    await dgxAPI.sendProgramChange(part, $(`#part-${part}-voice option:selected`).val())
  }

})

const noteKeyMap = {
  90: 60,
  83: 61,
  88: 62,
  68: 63,
  67: 64,
  86: 65,
  71: 66,
  66: 67,
  72: 68,
  78: 69,
  74: 70,
  77: 71,
  188: 72,
  76: 73,
  190: 74,
  186: 75,
  191: 76,
  81: 72,  // q - C4
  50: 73,   // 2 - C#4
  87: 74,  // w - D4
  51: 75,   // 3 - D#4
  69: 76,  // e - E4
  82: 77,  // r - F4
  53: 78,   // 5 - F#4
  84: 79,  // t - G4
  54: 80,   // 6 - G#4
  89: 81,  // y - A5
  55: 82,   // 7 - A#5
  85: 83,  // u - B5
  73: 84,  // i - C5
  57: 85,   // 9 - C#5
  79: 86,  // o - D5
  48: 87,   // 0 - D#5
  80: 88,  // p - E5
  219: 89,   // [ - F5
}

const keyState = {}

$(document).keydown(async function(e) {
  console.log(e.which)
  if (e.which in noteKeyMap) {
    if (!(e.which in keyState)) {
      keyState[e.which] = noteKeyMap[e.which]
      dgxAPI.sendNoteOn(0, keyState[e.which])
    }
  }
})

$(document).keyup(async function(e) {
  if (e.which in keyState) {
    dgxAPI.sendNoteOff(0, keyState[e.which])
    delete keyState[e.which]
  }
})


