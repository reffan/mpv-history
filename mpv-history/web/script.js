// init

console.info('MPV History')

const moviesElement = document.getElementById('movies-list')
const seriesElement = document.getElementById('series-list')
const filterElement = document.getElementById('filtered')

let config = null

init()

async function init() {
  if (config === null) {
    config = await getConfig()
    setInterval(init, 1000 * config.web.refreshInSeconds)
  }

  moviesElement.innerHTML = ''
  seriesElement.innerHTML = ''

  const history = await getHistory()
  const mappedHistory = mapHistory(history)
  renderHistory(mappedHistory)
}


// functions

function mapHistory(history) {
  const slicedMoviesHistory = history.movies.reverse().slice(0, config.web.maxEntries)
  const slicedSeriesHistory = history.series.reverse().slice(0, config.web.maxEntries)

  const moviesOutput = mapMoviesHistory(slicedMoviesHistory)
  const seriesOutput = mapSeriesHistory(slicedSeriesHistory)

  return {
    movies: moviesOutput,
    series: seriesOutput
  }
}

function mapMoviesHistory(history) {
  const output = []
  const allMovies = []

  history.forEach(function(entry) {
    if (filterElement.checked) {
      if (!allMovies.includes(entry.file.name)) {
        allMovies.push(entry.file.name)
        output.push(entry)
      }
    } else {
      output.push(entry)
    }
  })

  return output
}

function mapSeriesHistory(history) {
  const output = []

  // get unique series
  const allSeries = new Set()
  history.forEach(function(entry) {
    allSeries.add(entry.data.series)
  })

  // populate with episode entries
  allSeries.forEach(function(series) {
    const entries = history.filter(function(entry) {
      return entry.data.series === series
    })

    const sortedEntries = entries.sort(function(a, b) {
      const aTime = new Date(a.date_time)
      const bTime = new Date(b.date_time)
      // console.log(aTime, bTime, bTime - aTime)

      return bTime - aTime
    })

    const filteredPrefixes = []
    const filteredEntries = []

    sortedEntries.forEach(function(entry) {
      if (!filteredPrefixes.includes(entry.data.prefix)) {
        filteredPrefixes.push(entry.data.prefix)
        filteredEntries.push(entry)
      }
    })

    output.push({
      name: series,
      entries: filterElement.checked ? filteredEntries : sortedEntries
    })
  })

  // sort series by latest episode watched overall
  const sortedOutput = output.sort(function(a, b) {
    const aTime = new Date(a.entries[0].date_time)
    const bTime = new Date(b.entries[0].date_time)
    // console.log(aTime, bTime, bTime - aTime)

    return bTime - aTime
  })

  // return output
  return sortedOutput
}

function renderHistory(mappedHistory) {
  const listNode = document.createElement('ul')
  
  mappedHistory.movies.forEach(function(movie, index) {
    const entryNode = document.createElement('li')
    entryNode.innerHTML = '<a href="mpv://' + movie.file.full + '">' + movie.data.name + '</a><br /><span>' + formatDate(movie.date_time) + '</span>'

    listNode.appendChild(entryNode)
  })

  moviesElement.appendChild(listNode)

  mappedHistory.series.forEach(function(series, index) {
    const detailsNode = document.createElement('details')
    if (index < config.web.numExpandedSeries) { detailsNode.open = true }
    const summaryNode = document.createElement('summary')

    const titleNode = document.createElement('h3')
    titleNode.textContent = series.name
    const breakNode = document.createElement('br')
    
    summaryNode.appendChild(titleNode)
    summaryNode.appendChild(breakNode)
    detailsNode.appendChild(summaryNode)
    
    var highestPrefix = '???'
    var highestPath = ''
    var highestEpisode = 0
    
    const listNode = document.createElement('ul')
    
    series.entries.forEach(function(entry) {
      var currentEpisode = entry.data.season * 100 + entry.data.episode

      if (currentEpisode > highestEpisode) {
        highestEpisode = currentEpisode
        highestPrefix = entry.data.prefix
        highestPath = entry.file.full
      }

      const entryNode = document.createElement('li')
      entryNode.innerHTML = '<a href="mpv://' + entry.file.full + '">' + entry.data.name + '</a><br /><span>' + formatDate(entry.date_time) + '</span>'
      
      listNode.appendChild(entryNode)
    })
    
    const spanNode = document.createElement('span')
    spanNode.innerHTML = 'Latest: <a href="mpv://' + highestPath + '">' + highestPrefix + '</a>'
    summaryNode.appendChild(spanNode)

    detailsNode.appendChild(listNode)
    seriesElement.appendChild(detailsNode)
  })
}


// utilities

async function getConfig() {
  const configResponse = await fetch('../config.json')
  const configObject = await configResponse.json()

  return configObject
}

async function getHistory() {
  const historyResponse = await fetch('../' + config.file.history)
  const historyObject = await historyResponse.json()

  return historyObject
}

function formatDate(dateTime) {
  const options = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }

  const formatter = new Intl.DateTimeFormat('en-GB', options)
  return formatter.format(new Date(dateTime))
}