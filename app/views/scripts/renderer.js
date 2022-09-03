const dgxState = {
  bank: {}
}

$(document).ready(async function() {
  dgxState.bank = await dgxAPI.getBank()

  for (let ch = 0; ch < dgxState.bank.activeChannels; ch++) {
    $("#controller").append(await dgxAPI.renderChannelUi(ch))
  }

  for (let n = 0; n < dgxState.bank.activeNotes; n++) {
    $("#controller").append(await dgxAPI.renderNoteUi(n))
  }
})

/*
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

const octaveToInputMap = [
  0, 13, 25, 38, 50, 63, 76, 88, 100
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

const semitoneToInputMap = [
  0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 50, 54, 58, 64, 68, 72, 76, 80, 84, 88, 92, 96, 100
]

const chordPresets = {
  "sus2": [[0,0], [0,2], [0,7]],
  "sus2 aug": [[0,0], [0,2], [0,8]],
  "dim": [[0,0], [0,3], [0,6]],
  "min": [[0,0], [0,3], [0,7]],
  "maj": [[0,0], [0,4], [0,7]],
  "aug": [[0,0], [0,4], [0,8]],
  "sus4": [[0,0], [0,5], [0,7]],
  "stack4": [[0,0], [0,5], [0,10]],
  "open4": [[0,0], [0,5], [1,0]],
  "lyd": [[0,0], [0,6], [0,7]],
  "open5": [[0,0], [0,5], [1,0]],
  "stack5": [[0,0], [0,5], [1,2]],
  "sus2 6": [[0,0], [0,2], [0,7], [0,9]],
  "sus2 b7": [[0,0], [0,2], [0,7], [0,10]],
  "sus2 maj7": [[0,0], [0,2], [0,7], [0,11]],
  "dim7": [[0,0], [0,3], [0,6], [0,9]],
  "hdim": [[0,0], [0,3], [0,6], [0,10]],
  "min b6": [[0,0], [0,3], [0,7], [0,8]],
  "min 6": [[0,0], [0,3], [0,7], [0,9]],
  "min7": [[0,0], [0,3], [0,7], [0,10]],
  "min maj7": [[0,0], [0,3], [0,7], [0,11]],
  "maj 6": [[0,0], [0,4], [0,7], [0,9]],
  "dom7": [[0,0], [0,4], [0,7], [0,10]],
  "maj7": [[0,0], [0,4], [0,7], [0,11]],
  "aug 6": [[0,0], [0,4], [0,8], [0,9]],
  "aug b7": [[0,0], [0,4], [0,8], [0,10]],
  "aug maj7": [[0,0], [0,4], [0,8], [0,11]],
  "sus4 b7": [[0,0], [0,5], [0,7], [0,10]],
  "sus4 maj7": [[0,0], [0,5], [0,7], [0,11]],
}

const spreadDownMap = [
  [[]],
  [[0,0]],
  [[-1,0], [0,0]],
  [[-1,0], [-1,0], [0,0]],
  [[-1,0], [-1,0], [0,0], [0,0]],
  [[-2,0], [-1,0], [-1,0], [0,0], [0,0]],
  [[-2,0], [-1,0], [-1,0], [-1,0], [0,0], [0,0]],
  [[-2,0], [-2,0], [-1,0], [-1,0], [0,0], [0,0], [0,0]],
  [[-2,0], [-2,0], [-1,0], [-1,0], [-1,0], [0,0], [0,0], [0,0]],
  [[-2,0], [-2,0], [-2,0], [-1,0], [-1,0], [-1,0], [0,0], [0,0], [0,0]]
]

const spreadUpMap = [
  [[]],
  [[0,0]],
  [[0,0], [1,0]],
  [[0,0], [1,0], [1,0]],
  [[0,0], [0,0], [1,0], [1,0]],
  [[0,0], [0,0], [1,0], [1,0], [2,0]],
  [[0,0], [0,0], [1,0], [1,0], [1,0], [2,0]],
  [[0,0], [0,0], [0,0], [1,0], [1,0], [2,0], [2,0]],
  [[0,0], [0,0], [0,0], [1,0], [1,0], [1,0], [2,0], [2,0]],
  [[0,0], [0,0], [0,0], [1,0], [1,0], [1,0], [2,0], [2,0], [2,0]]
]

const spreadOutMap = [
  [[]],
  [[0,0]],
  [[-1,0], [1,0]],
  [[-1,0], [0,0], [1,0]],
  [[-1,0], [-1,0], [1,0], [1,0]],
  [[-2,0], [-1,0], [0,0], [1,0], [2,0]],
  [[-2,0], [-1,0], [-1,0], [1,0], [1,0], [2,0]],
  [[-2,0], [-2,0], [-1,0], [0,0], [1,0], [2,0], [2,0]],
  [[-2,0], [-2,0], [-1,0], [-1,0], [1,0], [1,0], [2,0], [2,0]],
  [[-2,0], [-2,0], [-1,0], [-1,0], [0,0], [1,0], [1,0], [2,0], [2,0]]
]

const dgxState = {
  numParts: 0,
  activeKeysDown: {},
}

async function spreadChord(part, map) {
  const currentChord = {}
  for (let c = 0; c < 6; c++) {
    if ($(`#part-${part}-chord-${c}-active`).is(":checked")) {
      const oct = octaveInputMap[$(`#part-${part}-chord-${c}-oct`).val()]
      const semi = semitoneInputMap[$(`#part-${part}-chord-${c}-semi`).val()]

      currentChord[c] = {
        oct: oct,
        semi: semi
      }
    }
  }

  const currentChordLength = Object.keys(currentChord).length
  if (currentChordLength > 0) {
    Object.keys(currentChord).forEach((c, i) => {
      $(`#part-${part}-chord-${c}-oct`).val(
        octaveToInputMap[currentChord[c].oct + 4 + map[currentChordLength][i][0]]
      )
      $(`#part-${part}-chord-${c}-semi`).val(
        semitoneToInputMap[currentChord[c].semi + 12 + map[currentChordLength][i][1]]
      )

      $(`#part-${part}-chord-${c}-oct-data`).html(`[${octaveInputMap[$(`#part-${part}-chord-${c}-oct`).val()]}]`)
      $(`#part-${part}-chord-${c}-semi-data`).html(`[${semitoneInputMap[$(`#part-${part}-chord-${c}-semi`).val()]}]`)
    })
  }
}

async function invertChord(part, direction) {
  const currentChord = {}
  const highNote = {}

  for (let c = 0; c < 6; c++) {
    if ($(`#part-${part}-chord-${c}-active`).is(":checked")) {
      const oct = octaveInputMap[$(`#part-${part}-chord-${c}-oct`).val()]
      const semi = semitoneInputMap[$(`#part-${part}-chord-${c}-semi`).val()]
      const note = 12 * oct + semi

      let updateHighNote = false
      
      if (Object.keys(highNote).length == 0) {
        if ((direction > 0 && oct < 4) || (direction < 0 && oct > -4)) {
          updateHighNote = true
        }
      } else {
        updateHighNote = (direction > 0) ? note <= highNote.note : note >= highNote.note
      }

      if (updateHighNote) {
        highNote.position = c
        highNote.note = note
      }

      currentChord[c] = {
        oct: oct,
        semi: semi
      }
    }
  }

  if (Object.keys(currentChord).length > 0 && Object.keys(highNote).length > 0) {
    currentChord[highNote.position].oct += direction
  }

  Object.keys(currentChord).forEach((c) => {
    $(`#part-${part}-chord-${c}-oct`).val(octaveToInputMap[currentChord[c].oct + 4])
    $(`#part-${part}-chord-${c}-semi`).val(semitoneToInputMap[currentChord[c].semi + 12])
    $(`#part-${part}-chord-${c}-oct-data`).html(`[${octaveInputMap[$(`#part-${part}-chord-${c}-oct`).val()]}]`)
    $(`#part-${part}-chord-${c}-semi-data`).html(`[${semitoneInputMap[$(`#part-${part}-chord-${c}-semi`).val()]}]`)
  })
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

  // update chord mode ui oct/semi sliders
  Object.keys(chordPresets).forEach((chord) => {
    $(`#part-${part}-chord-preset`).append(new Option(chord, chord))
  })
  $(`#part-${part}-chord-preset`).change(async function() {
    const chord = chordPresets[$(this).val()]
    for (let c = 0; c < 6; c++) {
      if (c < chord.length) {
        $(`#part-${part}-chord-${c}-active`).prop("checked", true)
        $(`#part-${part}-chord-${c}-oct`).val(octaveToInputMap[chord[c][0] + 4])
        $(`#part-${part}-chord-${c}-semi`).val(semitoneToInputMap[chord[c][1] + 12])
      } else {
        $(`#part-${part}-chord-${c}-active`).prop("checked", false)
        $(`#part-${part}-chord-${c}-oct`).val(50)
        $(`#part-${part}-chord-${c}-semi`).val(50)
      }

      $(`#part-${part}-chord-${c}-oct`).prop("disabled", !($(`#part-${part}-chord-${c}-active`).is(":checked")))
      $(`#part-${part}-chord-${c}-semi`).prop("disabled", !($(`#part-${part}-chord-${c}-active`).is(":checked")))
      $(`#part-${part}-chord-${c}-oct-data`).html(`[${octaveInputMap[$(`#part-${part}-chord-${c}-oct`).val()]}]`)
      $(`#part-${part}-chord-${c}-semi-data`).html(`[${semitoneInputMap[$(`#part-${part}-chord-${c}-semi`).val()]}]`)
    }
  })

  $(`#part-${part}-chord-inv-down`).click(async function(_) { invertChord(part, -1) })
  $(`#part-${part}-chord-inv-up`).click(async function(_) { invertChord(part, 1) })
  $(`#part-${part}-chord-spread-down`).click(async function(_) { spreadChord(part, spreadDownMap) })
  $(`#part-${part}-chord-spread-out`).click(async function(_) { spreadChord(part, spreadOutMap) })
  $(`#part-${part}-chord-spread-up`).click(async function(_) { spreadChord(part, spreadUpMap) })

  for (let c = 0; c < 6; c++) {
    $(`#part-${part}-chord-${c}-active`).change(async function(_) {
      $(`#part-${part}-chord-${c}-oct`).prop("disabled", !($(this).is(":checked")))
      $(`#part-${part}-chord-${c}-semi`).prop("disabled", !($(this).is(":checked")))
    })
    $(`#part-${part}-chord-${c}-oct`).prop("disabled", !($(this).is(":checked")))
    $(`#part-${part}-chord-${c}-semi`).prop("disabled", !($(this).is(":checked")))

    $(`#part-${part}-chord-${c}-oct`).on("input", async function() {
      $(`#part-${part}-chord-${c}-oct-data`).html(`[${octaveInputMap[$(`#part-${part}-chord-${c}-oct`).val()]}]`)
    })
    $(`#part-${part}-chord-${c}-oct-data`).html(`[${octaveInputMap[$(`#part-${part}-chord-${c}-oct`).val()]}]`)

    $(`#part-${part}-chord-${c}-semi`).on("input", async function() {
      $(`#part-${part}-chord-${c}-semi-data`).html(`[${semitoneInputMap[$(`#part-${part}-chord-${c}-semi`).val()]}]`)
    })
    $(`#part-${part}-chord-${c}-semi-data`).html(`[${semitoneInputMap[$(`#part-${part}-chord-${c}-semi`).val()]}]`)
  }

  // display the proper note mode
  $(`#part-${part} .part_note_mode`).each(async function(_) {
    $(this).hide()
  })
  $(`#part-${part}-note-mode-none`).show()

  $(`#part-${part}-note-mode`).change(async function(_) {
    $(`#part-${part} .part_note_mode`).each(async function(_) {
      $(this).hide()
    })

    switch ($(`#part-${part}-note-mode`).val()) {
      case "none":
        $(`#part-${part}-note-mode-none`).show()
        break;
      case "note":
        $(`#part-${part}-note-mode-note`).show()
        break;
      case "chord":
        $(`#part-${part}-note-mode-chord`).show()
        break;
    }
  })
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
        for (var i = 0; i < dgxState.activeKeysDown[k].parts[part].notes.length; i++) {
          dgxAPI.sendNoteOff(part, dgxState.activeKeysDown[k].parts[part].notes[i])
        }
      })
    }
    delete dgxState.activeKeysDown[k]
  }
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
          case "chord":
            for (let c = 0; c < 6; c++) {
              const oct = octaveInputMap[$(`#part-${part}-chord-${c}-oct`).val()]
              const semi = semitoneInputMap[$(`#part-${part}-chord-${c}-semi`).val()]

              notes.push(
                (12 * oct) + semi + noteKeyMap[e.which]
              )
            }
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
*/
