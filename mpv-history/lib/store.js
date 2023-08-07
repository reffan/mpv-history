// config

var scriptsFolder = '~~home/scripts/' + 'mpv-history/'
var configFile = mp.utils.read_file(scriptsFolder + 'config.json')
var config = JSON.parse(configFile)


// init

mp.register_event('file-loaded', updateHistory)


// functions

function updateHistory() {
  try {
    var history = updateJSON()
    // MARK: minified
    // mp.utils.write_file('file://' + scriptsFolder + config.file.history, JSON.stringify(history))
    // MARK: pretty print
    mp.utils.write_file('file://' + scriptsFolder + config.file.history, JSON.stringify(history, null, 2))
    mp.utils.write_file('file://' + scriptsFolder + config.file.error, '')
  } catch (error) {
    mp.utils.write_file('file://' + scriptsFolder + config.file.error, JSON.stringify(error, null, 2))
  }
}

function updateJSON() {
  var newHistoryJSON = {}

  try {
    var prevHistory = mp.utils.read_file(scriptsFolder + config.file.history)
    var prevHistoryJSON = JSON.parse(prevHistory)
    newHistoryJSON = prevHistoryJSON
  } catch (error) {
    mp.utils.write_file('file://' + scriptsFolder + config.file.error, JSON.stringify(error, null, 2))
  }
  
  var mappedEntry = mapEntry()

  if (!newHistoryJSON.movies) {
    newHistoryJSON.movies = []
  }

  if (!newHistoryJSON.series) {
    newHistoryJSON.series = []
  }

  if (mappedEntry.isMovie) {
    newHistoryJSON.movies.push(mappedEntry.entry)
  }

  if (mappedEntry.isSeries) {
    newHistoryJSON.series.push(mappedEntry.entry)
  }

  return newHistoryJSON
}

function mapEntry() {
  var filePath = mp.get_property('path')

  // TODO: check for multiple paths
  var isMovie = filePath.indexOf(config.store.moviesPath) != -1
  var isSeries = filePath.indexOf(config.store.seriesPath) != -1

  if (isMovie) {
    return mapMovieEntry()
  }

  if (isSeries) {
    return mapSeriesEntry()
  }
}

function mapMovieEntry() {
  // TODO: strip quality
  var name = mp.get_property('filename/no-ext')

  return  { 
    entry: {
      file: {
        path: mp.get_property('path'),
        name: mp.get_property('filename/no-ext'),
        extension: mp.get_property('file-format')
      },
      data: {
        name: name
      },
      date_time: new Date()
    },
    isMovie: true,
    isSeries: false
  }
}

function mapSeriesEntry() {
  var filePath = mp.get_property('path')

  // TODO: make this configurable
  // MARK: 
  // 0 = series
  // 1 = season
  // 2 = file
  // TODO: check for multiple paths
  var splitFilePath = filePath.replace(config.store.seriesPath, '').split(config.store.pathSplitChar)
  var splitFileName = mp.get_property('filename').split(' - ')
  
  var season = +splitFilePath[1].replace('Season ', '')
  var episode = +splitFileName[0][4] * 10 + +splitFileName[0][5]
  // TODO: strip prefix & quality
  var name = mp.get_property('filename/no-ext')

  return  { 
    entry: {
      file: {
        path: mp.get_property('path'),
        name: mp.get_property('filename/no-ext'),
        extension: mp.get_property('file-format')
      },
      data: {
        prefix: splitFileName[0],
        series: splitFilePath[0],
        season: season,
        episode: episode,
        name: name
      },
      date_time: new Date()
    },
    isMovie: false,
    isSeries: true
  }
}