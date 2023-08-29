// init

mp.add_hook('on_load', 50, triggerOnProtocol)

// functions

function triggerOnProtocol() {
  var streamFilename = mp.get_property_native('stream-open-filename')
  if (typeof streamFilename !== 'string') {
    return
  }

  var decodedFilename = decodeURI(streamFilename)

  var cleanFilename = decodedFilename.match(/mpv:\/\/(.+)/)
  if (!cleanFilename) {
    return
  }

  var loadFilename = cleanFilename[1]
  if (loadFilename[loadFilename.length - 1] === '/') {
    loadFilename = loadFilename.slice(0, -1)
  }

  mp.commandv('loadfile', loadFilename)
}
