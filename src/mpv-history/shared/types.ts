export type MovieHistoryJSON = {
  data: {
    name: string
  }
  file: {
    name: string
    extension: string
    path: string
  }
  timestamp: number
}

export type SeriesHistoryJSON = {
  data: {
    episode: number
    name: string
    prefix: string
    season: number
    series: string
  }
  file: {
    name: string
    extension: string
    path: string
  }
  timestamp: number
}

export type HistoryJSON = {
  movies: MovieHistoryJSON[]
  series: SeriesHistoryJSON[]
}
