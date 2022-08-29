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

const octaveInputMap = [
  -4, -4, -4, -4, -4, -4, -4, -4, -4, -4, -4,
  -3, -3, -3, -3, -3, -3, -3, -3, -3, -3, -3,
  -2, -2, -2, -2, -2, -2, -2, -2, -2, -2, -2,
  -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
]

const semitoneInputMap = [
  -12, -12, -12,
  -11, -11, -11, -11,
  -10, -10, -10, -10,
  -9, -9, -9, -9,
  -8, -8, -8, -8,
  -7, -7, -7, -7,
  -6, -6, -6, -6,
  -5, -5, -5, -5,
  -4, -4, -4, -4,
  -3, -3, -3, -3,
  -2, -2, -2, -2,
  -1, -1, -1, -1,
  0, 0, 0, 0, 0, 0, 0, 
  1, 1, 1, 1,
  2, 2, 2, 2,
  3, 3, 3, 3,
  4, 4, 4, 4,
  5, 5, 5, 5,
  6, 6, 6, 6,
  7, 7, 7, 7,
  8, 8, 8, 8,
  9, 9, 9, 9,
  10, 10, 10, 10,
  11, 11, 11, 11,
  12, 12, 12,
]

const dgxState = {
  numParts: 0,
  activeKeysDown: {},
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
  })

  // update note mode ui oct/semi sliders
  $(`#part-${part}-note-oct`).on("input", async function() {
    $(`#part-${part}-note-oct-data`).html(`[${octaveInputMap[$(this).val()]}]`)
  })
  $(`#part-${part}-note-oct-data`).html(`[${octaveInputMap[$(`#part-${part}-note-oct`).val()]}]`)

  $(`#part-${part}-note-semi`).on("input", async function() {
    $(`#part-${part}-note-semi-data`).html(`[${semitoneInputMap[$(this).val()]}]`)
  })
  $(`#part-${part}-note-semi-data`).html(`[${semitoneInputMap[$(`#part-${part}-note-semi`).val()]}]`)
}

$(document).ready(async () => {
  ui_touchMidi()

  dgxState.numParts = await dgxAPI.maxParts()
  
  for (var part = 0; part < dgxState.numParts; part++) {
    $("<div>").attr({class: "element part", id: `part-${part}`}).appendTo("#parts")
    await ui_touchPart(part)
    await dgxAPI.sendProgramChange(part, $(`#part-${part}-voice option:selected`).val())
  }

})

async function sendKeyNotesOff(k) {
  if (k in dgxState.activeKeysDown) {
    if (Object.keys(dgxState.activeKeysDown[k].parts).length > 0) {
      Object.keys(dgxState.activeKeysDown[k].parts).forEach((part) => {
        console.log("gonna remove some notes")
        for (var i = 0; i < dgxState.activeKeysDown[k].parts[part].notes.length; i++) {
          dgxAPI.sendNoteOff(part, dgxState.activeKeysDown[k].parts[part].notes[i])
        }
      })
    }
    delete dgxState.activeKeysDown[k]
  }

  console.log(dgxState.activeKeysDown)
}

$(document).keydown(async function(e) {
  if (e.which in noteKeyMap && !(e.which in dgxState.activeKeysDown)) {
    dgxState.activeKeysDown[e.which] = {
      base: noteKeyMap[e.which],
      parts: {}
    }

    for (var part = 0; part < dgxState.numParts; part++) {
      const notes = []

      if ($(`#part-${part}-recv-keys`).is(":checked")) {
        switch ($(`#part-${part}-note-mode`).val()) {
          case "note":
              const oct = octaveInputMap[$(`#part-${part}-note-oct`).val()]
              const semi = semitoneInputMap[$(`#part-${part}-note-semi`).val()]

              notes.push(
                (12 * oct) + semi + noteKeyMap[e.which]
              )
          break;
        }
      }

      if (notes.length > 0) {
        for (var i = 0; i < notes.length; i++) {
          dgxAPI.sendNoteOn(part, notes[i])
        }

        dgxState.activeKeysDown[e.which].parts[part] = {
          notes: [...notes]
        }
      }
    }
  }
})

$(document).keyup(async function(e) {
  sendKeyNotesOff(e.which)
})

