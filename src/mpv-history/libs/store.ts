import {
  MovieHistoryJSON,
  SeriesHistoryJSON,
  HistoryJSON,
} from '../shared/types'

// init

mp.register_event('file-loaded', updateStoreHistory)

// functions

function updateStoreHistory() {
  try {
    const history = updateJSON()
    // MARK: minified
    // mp.utils.write_file('file://' + scriptsFolder + config.file.history, JSON.stringify(history))
    // MARK: pretty print
    mp.utils.write_file(
      `file://${scriptsFolder}${config.file.history}`,
      JSON.stringify(history, null, 2),
    )
    mp.utils.write_file(`file://${scriptsFolder}${config.file.error}`, '')
  } catch (error) {
    mp.utils.write_file(
      `file://${scriptsFolder}${config.file.error}`,
      JSON.stringify(error, null, 2),
    )
  }
}

function updateJSON() {
  let newHistoryJSON: HistoryJSON = {
    movies: [],
    series: [],
  }

  try {
    const prevHistory = mp.utils.read_file(scriptsFolder + config.file.history)
    const prevHistoryJSON: HistoryJSON = JSON.parse(prevHistory)
    newHistoryJSON = prevHistoryJSON
  } catch (error) {
    mp.utils.write_file(
      'file://' + scriptsFolder + config.file.error,
      JSON.stringify(error, null, 2),
    )
  }

  if (!newHistoryJSON.movies) {
    newHistoryJSON.movies = []
  }

  if (!newHistoryJSON.series) {
    newHistoryJSON.series = []
  }

  const mappedEntry = mapEntry()

  if (mappedEntry.isMovie) {
    newHistoryJSON.movies.push(mappedEntry.entry as MovieHistoryJSON)
  }

  if (mappedEntry.isSeries) {
    newHistoryJSON.series.push(mappedEntry.entry as SeriesHistoryJSON)
  }

  return newHistoryJSON
}

function mapEntry() {
  const filePath = mp.get_property('path')

  // TODO: check for multiple paths
  const isMovie = filePath.indexOf(config.store.moviesPath) != -1
  const isSeries = filePath.indexOf(config.store.seriesPath) != -1

  if (isMovie) {
    return mapMovieEntry()
  }

  if (isSeries) {
    return mapSeriesEntry()
  }
}

function mapMovieEntry() {
  // TODO: strip quality
  const name = mp.get_property('filename/no-ext')

  const entry: MovieHistoryJSON = {
    file: {
      path: mp.get_property('path'),
      name: mp.get_property('filename/no-ext'),
      extension: mp.get_property('file-format'),
    },
    data: {
      name: name,
    },
    timestamp: Date.now(),
  }

  return {
    entry: entry,
    isMovie: true,
    isSeries: false,
  }
}

function mapSeriesEntry() {
  const filePath = mp.get_property('path')

  // TODO: make this configurable
  // MARK:
  // 0 = series
  // 1 = season
  // 2 = file
  // TODO: check for multiple paths
  const splitFilePath = filePath
    .replace(config.store.seriesPath, '')
    .split(config.store.pathSplitChar)
  const splitFileName = mp.get_property('filename').split(' - ')

  const season = +splitFilePath[1].replace('Season ', '')
  const episode = +splitFileName[0][4] * 10 + +splitFileName[0][5]
  // TODO: strip prefix & quality
  const name = mp.get_property('filename/no-ext')

  const entry: SeriesHistoryJSON = {
    file: {
      path: mp.get_property('path'),
      name: mp.get_property('filename/no-ext'),
      extension: mp.get_property('file-format'),
    },
    data: {
      prefix: splitFileName[0],
      series: splitFilePath[0],
      season: season,
      episode: episode,
      name: name,
    },
    timestamp: Date.now(),
  }

  return {
    entry: entry,
    isMovie: false,
    isSeries: true,
  }
}
