const keyboard = {
  armed: {
    90:   { type: "note", value: 60 },
    83:   { type: "note", value: 61 },
    88:   { type: "note", value: 62 },
    68:   { type: "note", value: 63 },
    67:   { type: "note", value: 64 },
    86:   { type: "note", value: 65 },
    71:   { type: "note", value: 66 },
    66:   { type: "note", value: 67 },
    72:   { type: "note", value: 68 },
    78:   { type: "note", value: 69 },
    74:   { type: "note", value: 70 },
    77:   { type: "note", value: 71 },
    188:  { type: "note", value: 72 },
    76:   { type: "note", value: 73 },
    190:  { type: "note", value: 74 },
    186:  { type: "note", value: 75 },
    191:  { type: "note", value: 76 },
    81:   { type: "note", value: 72 },
    50:   { type: "note", value: 73 },
    87:   { type: "note", value: 74 },
    51:   { type: "note", value: 75 },
    69:   { type: "note", value: 76 },
    82:   { type: "note", value: 77 },
    53:   { type: "note", value: 78 },
    84:   { type: "note", value: 79 },
    54:   { type: "note", value: 80 },
    89:   { type: "note", value: 81 },
    55:   { type: "note", value: 82 },
    85:   { type: "note", value: 83 },
    73:   { type: "note", value: 84 },
    57:   { type: "note", value: 85 },
    79:   { type: "note", value: 86 },
    48:   { type: "note", value: 87 },
    80:   { type: "note", value: 88 },
    219:  { type: "note", value: 89 },
  },

  pressed: {},
  released: {}
}

$(document).ready(async function() {
  const bpm = 120
  const spb = 1.0 / ((1.0 / 60.0) * bpm)
  const intv = (1000.0 / 128.0) * spb

  const notes = {}
  const noteOnQueue = []
  const noteOffQueue = []

  var start = window.performance.now()
  setInterval(function() {
    const keysPressed = Object.keys(keyboard.pressed)
    const keysReleased = Object.keys(keyboard.released)

    const getActivePorts = function() {
      const ports = []

      $(".component.note").each(function() {
        if ($(this).find(".active").is(":checked")) {
          const type = $(this).find(".send_to :selected").val()

          $(this).find(".outports input").each(function() {
            if ($(this).is(":checked")) {
              ports.push({
                ch: $(this).parent().find("label").text(),
                type: type
              })
            }
          })
        }
      })

      return ports
    }

    if (Object.keys(keysPressed).length > 0) {
      keysPressed.forEach((key) => {
        keyboard.pressed[key].forEach((n) => {
          if (!(n.note in notes)) {
            notes[n.note] = {}
          }

          if (!(key in notes[n.note])) {
            getActivePorts().forEach((port) => {
              noteOnQueue.push({ note: n.note, ch: port.ch, vel: 127 })
            })
          }

          notes[n.note][key] = true
        })
      })
    }

    if (Object.keys(keysReleased).length > 0) {
      keysReleased.forEach((key) => {
        if (key in keyboard.pressed) {
          delete keyboard.pressed[key]
        }

        keyboard.released[key].forEach((n) => {
          if (n.note in notes) {
            delete notes[n.note][key]
            if (!(Object.keys(notes[n.note]).length > 0)) {
              getActivePorts().forEach((port) => {
                noteOffQueue.push({ note: n.note, ch: port.ch })
              })
              delete notes[n.note]
            }
          }
        })

        delete keyboard.released[key]
      })
    }
  }, 5)

  setInterval(function() {
    notesOn = Object.keys(noteOnQueue)
    while (notesOn.length > 0) {
      const note = notesOn.pop() 
      dgxAPI.sendControlInput("ch", noteOnQueue[note].ch, "note_on", noteOnQueue[note].note)
      delete noteOnQueue[note]
    }

    notesOff = Object.keys(noteOffQueue)
    while (notesOff.length > 0) {
      const note = notesOff.pop()
      dgxAPI.sendControlInput("ch", noteOffQueue[note].ch, "note_off", noteOffQueue[note].note)
      delete noteOffQueue[note]
    }
  }, 1)
})

$(document).keydown(async function(e) {
  const key = e.which
  if (key in keyboard.armed) {
    if (!(key in keyboard.pressed)) {
      keyboard.pressed[key] = []
      switch (keyboard.armed[key].type) {
        case "note":
          keyboard.pressed[key].push({ note: keyboard.armed[key].value })
          break
      }
    }
  }
})

$(document).keyup(async function(e) {
  const key = e.which
  if (key in keyboard.pressed) {
    switch (keyboard.armed[key].type) {
      case "note":
        keyboard.released[key] = keyboard.pressed[key]

        break
    }
  }
})

