// config

var scriptsFolder = '~~home/scripts/' + 'mpv-history/'
var configFile = mp.utils.read_file(scriptsFolder + 'config.json')
var config = JSON.parse(configFile)


// state

var isActive = false
var menuTimeout = null
var historyArray = []
var selectedEntryIndex = 0

var originalFontSize = mp.get_property_number('osd-font-size')


// init

mp.add_key_binding(config.menu.toggleKey, 'mpv-history-menu', toggleMenu)
mp.observe_property('osd-dimensions', 'native', function() {
  if (isActive) {
    updateMenu()
  }
})


// render menu

function updateMenu() {
  if (isActive) {
    updateHistory()

    var menuText = 'Recents: ' + "\n\n"

    historyArray.forEach(function (entry, index) {
      var cursor = ''

      if (selectedEntryIndex === index) {
        cursor = '> '
      }

      menuText = menuText + cursor + entry.file.name + "\n"
    })

    mp.commandv('show-text', menuText, 1000 * config.menu.timeoutInSeconds)
    clearTimeout(menuTimeout)
    menuTimeout = setTimeout(function () {
      hideMenu()
      isActive = false
    }, 1000 * config.menu.timeoutInSeconds)
  }
}

function toggleMenu() {
  isActive = !isActive

  if (isActive) {
    showMenu()
  } else {
    hideMenu()
  }
}

function showMenu() {
  // isActive = true
  mp.set_property_number('osd-font-size', config.menu.fontSize)
  updateMenu()
  
  mp.add_forced_key_binding('UP', 'recents_osd_menu.up', navigateMenuUp)
  mp.add_forced_key_binding('DOWN', 'recents_osd_menu.down', navigateMenuDown)
  mp.add_forced_key_binding('ENTER', 'recents_osd_menu.select', selectMenuEntry)
}

function hideMenu() {
  // isActive = false
  mp.set_property_number('osd-font-size', originalFontSize)
  mp.commandv('show-text', '', 0)
  
  mp.remove_key_binding('recents_osd_menu.up')
  mp.remove_key_binding('recents_osd_menu.down')
  mp.remove_key_binding('recents_osd_menu.select')
}


// navigate and select entries

function navigateMenuUp() {
  selectedEntryIndex = selectedEntryIndex - 1
  selectedEntryIndex = clamp(0, config.menu.maxEntries - 1, selectedEntryIndex)
  
  updateMenu()
}

function navigateMenuDown() {
  selectedEntryIndex = selectedEntryIndex + 1
  selectedEntryIndex = clamp(0, config.menu.maxEntries - 1, selectedEntryIndex)
  
  updateMenu()
}

function selectMenuEntry() {
  if (isActive) {
    var selectedEntry = historyArray[selectedEntryIndex]

    if (selectedEntry) {
      hideMenu()
      selectedEntryIndex = 0
      mp.commandv('loadfile', selectedEntry.file.path)
    }
  }
}


// utilities

function updateHistory() {
  var smashedArray = []

  try {
    var fullHistoryJSON = mp.utils.read_file(scriptsFolder + config.file.history)
    var fullHistoryArray = JSON.parse(fullHistoryJSON)
    
    smashedArray = fullHistoryArray.movies.concat(fullHistoryArray.series).reverse()
    smashedArray = smashedArray.sort(function(a, b) {
      var aTime = new Date(a.date_time)
      var bTime = new Date(b.date_time)
      
      return bTime - aTime
    })
  } catch (error) {
    mp.utils.write_file('file://' + scriptsFolder + config.file.error, JSON.stringify(error, null, 2))
  }

  historyArray = smashedArray.slice(0, config.menu.maxEntries)
}

function clamp(min, max, value) {
  return Math.min(max, Math.max(min, value))
}