import { MovieHistoryJSON, SeriesHistoryJSON } from '../shared/types'

// state

const state = {
  isMenuActive: false,
  menuTimeout: null,
  history: [],
  selectedIndex: 0,
}

const originalFontSize = mp.get_property_number('osd-font-size')

// init

mp.add_key_binding(config.menu.toggleKey, 'mpv-history-menu', toggleMenu)
mp.observe_property('osd-dimensions', 'native', () => {
  if (state.isMenuActive) {
    updateMenu()
  }
})

// render menu

function updateMenu() {
  if (state.isMenuActive) {
    updateMenuHistory()

    let menuText = 'Recents: ' + '\n\n'

    state.history.forEach((entry, index) => {
      let cursor = ''

      if (state.selectedIndex === index) {
        cursor = '> '
      }

      menuText = menuText + cursor + entry.file.name + '\n'
    })

    mp.commandv('show-text', menuText, `${1000 * config.menu.timeoutInSeconds}`)
    clearTimeout(state.menuTimeout)
    state.menuTimeout = setTimeout(() => {
      hideMenu()
      state.isMenuActive = false
    }, 1000 * config.menu.timeoutInSeconds)
  }
}

function toggleMenu() {
  state.isMenuActive = !state.isMenuActive

  if (state.isMenuActive) {
    showMenu()
  } else {
    hideMenu()
  }
}

function showMenu() {
  // state.isMenuActive = true
  mp.set_property_number('osd-font-size', config.menu.fontSize)
  updateMenu()

  mp.add_forced_key_binding('UP', 'recents_osd_menu.up', navigateMenuUp)
  mp.add_forced_key_binding('DOWN', 'recents_osd_menu.down', navigateMenuDown)
  mp.add_forced_key_binding('ENTER', 'recents_osd_menu.select', selectMenuEntry)
}

function hideMenu() {
  // state.isMenuActive = false
  mp.set_property_number('osd-font-size', originalFontSize)
  mp.commandv('show-text', '', '0')

  mp.remove_key_binding('recents_osd_menu.up')
  mp.remove_key_binding('recents_osd_menu.down')
  mp.remove_key_binding('recents_osd_menu.select')
}

// navigate and select entries

function navigateMenuUp() {
  // state.selectedIndex = state.selectedIndex - 1
  state.selectedIndex = clamp(
    0,
    config.menu.maxEntries - 1,
    state.selectedIndex - 1,
  )

  updateMenu()
}

function navigateMenuDown() {
  // state.selectedIndex = state.selectedIndex + 1
  state.selectedIndex = clamp(
    0,
    config.menu.maxEntries - 1,
    state.selectedIndex + 1,
  )

  updateMenu()
}

function selectMenuEntry() {
  if (state.isMenuActive) {
    const selectedEntry = state.history[state.selectedIndex]

    if (selectedEntry) {
      hideMenu()
      state.selectedIndex = 0
      mp.commandv('loadfile', selectedEntry.file.path)
    }
  }
}

// utilities

function updateMenuHistory() {
  let smashedArray = []

  try {
    const fullHistoryJSON = mp.utils.read_file(
      scriptsFolder + config.file.history,
    )
    const fullHistoryArray = JSON.parse(fullHistoryJSON)

    smashedArray = fullHistoryArray.movies
      .concat(fullHistoryArray.series)
      .reverse()
    smashedArray = smashedArray.sort(
      (
        a: MovieHistoryJSON | SeriesHistoryJSON,
        b: MovieHistoryJSON | SeriesHistoryJSON,
      ) => {
        return b.timestamp - a.timestamp
      },
    )
  } catch (error) {
    mp.utils.write_file(
      'file://' + scriptsFolder + config.file.error,
      JSON.stringify(error, null, 2),
    )
  }

  state.history = smashedArray.slice(0, config.menu.maxEntries)
}

function clamp(min: number, max: number, value: number) {
  return Math.min(max, Math.max(min, value))
}
