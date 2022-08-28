const noteKeyMap = {
  90: 60,  83: 61,  88: 62,   68: 63,
  67: 64,  86: 65,  71: 66,   66: 67,
  72: 68,  78: 69,  74: 70,   77: 71,
  188: 72, 76: 73,  190: 74,  186: 75,
  191: 76, 81: 72,  50: 73,   87: 74,
  51: 75,  69: 76,  82: 77,   53: 78,
  84: 79,  54: 80,  89: 81,   55: 82,
  85: 83,  73: 84,  57: 85,   79: 86,
  48: 87,  80: 88,  219: 89,
}

const noteState = {
  numParts: 0,
  activeKeys: {},
  activeParts_Keys: {}
}

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

  // connect control sliders to sending CC midi
  $(`#part-${part} .part_control`).each(async function(_, ) {
    $(this).on("input", async function() {
      dgxAPI.sendControl(part, $(this).attr("name"), $(this).val())
    })
  })

  // connect option to receive keyboard/midi notes
  $(`#part-${part}-recv-keys`).change(async function(_) {
    console.log($(this).val())
    if ($(this).is(":checked")) noteState.activeParts_Keys[part] = true
    else delete noteState.activeParts_Keys[part]
  })
}

$(document).ready(async () => {
  ui_touchMidi()

  noteState.numParts = await dgxAPI.maxParts()
  
  for (var part = 0; part < noteState.numParts; part++) {
    $("<div>").attr({class: "element part", id: `part-${part}`}).appendTo("#parts")
    await ui_touchPart(part)
    await dgxAPI.sendProgramChange(part, $(`#part-${part}-voice option:selected`).val())
  }

})

$(document).keydown(async function(e) {
  if (e.which in noteKeyMap) {
    if (!(e.which in noteState.activeKeys)) {
      noteState.activeKeys[e.which] = noteKeyMap[e.which]
      for (var p = 0; p < noteState.numParts; p++) {
        if (p in noteState.activeParts_Keys) {
          dgxAPI.sendNoteOn(p, noteState.activeKeys[e.which])
        }
      }
    }
  }
})

$(document).keyup(async function(e) {
  if (e.which in noteState.activeKeys) {
    for (var p = 0; p < noteState.numParts; p++) {
      if (p in noteState.activeParts_Keys) {
        dgxAPI.sendNoteOff(p, noteState.activeKeys[e.which])
      }
    }

    delete noteState.activeKeys[e.which]
  }
})

