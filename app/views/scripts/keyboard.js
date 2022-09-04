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

  pressed: {}
}

$(document).keydown(async function(e) {
  const key = e.which
  if (key in keyboard.armed) {
    if (!(key in keyboard.pressed)) {
      keyboard.pressed[key] = []
      switch (keyboard.armed[key].type) {
        case "note":
          console.log("note down")
          keyboard.pressed[key].push({ note: keyboard.armed[key].value })
          console.log(keyboard.pressed)
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
        delete keyboard.pressed[key]
        console.log(keyboard.pressed)
        break
    }
  }
})

