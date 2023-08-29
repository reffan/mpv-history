"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
mp.register_event('file-loaded', updateStoreHistory);
function updateStoreHistory() {
    try {
        var history_1 = updateJSON();
        mp.utils.write_file("file://".concat(scriptsFolder).concat(config.file.history), JSON.stringify(history_1, null, 2));
        mp.utils.write_file("file://".concat(scriptsFolder).concat(config.file.error), '');
    }
    catch (error) {
        mp.utils.write_file("file://".concat(scriptsFolder).concat(config.file.error), JSON.stringify(error, null, 2));
    }
}
function updateJSON() {
    var newHistoryJSON = {
        movies: [],
        series: [],
    };
    try {
        var prevHistory = mp.utils.read_file(scriptsFolder + config.file.history);
        var prevHistoryJSON = JSON.parse(prevHistory);
        newHistoryJSON = prevHistoryJSON;
    }
    catch (error) {
        mp.utils.write_file('file://' + scriptsFolder + config.file.error, JSON.stringify(error, null, 2));
    }
    if (!newHistoryJSON.movies) {
        newHistoryJSON.movies = [];
    }
    if (!newHistoryJSON.series) {
        newHistoryJSON.series = [];
    }
    var mappedEntry = mapEntry();
    if (mappedEntry.isMovie) {
        newHistoryJSON.movies.push(mappedEntry.entry);
    }
    if (mappedEntry.isSeries) {
        newHistoryJSON.series.push(mappedEntry.entry);
    }
    return newHistoryJSON;
}
function mapEntry() {
    var filePath = mp.get_property('path');
    var isMovie = filePath.indexOf(config.store.moviesPath) != -1;
    var isSeries = filePath.indexOf(config.store.seriesPath) != -1;
    if (isMovie) {
        return mapMovieEntry();
    }
    if (isSeries) {
        return mapSeriesEntry();
    }
}
function mapMovieEntry() {
    var name = mp.get_property('filename/no-ext');
    var entry = {
        file: {
            path: mp.get_property('path'),
            name: mp.get_property('filename/no-ext'),
            extension: mp.get_property('file-format'),
        },
        data: {
            name: name,
        },
        timestamp: Date.now(),
    };
    return {
        entry: entry,
        isMovie: true,
        isSeries: false,
    };
}
function mapSeriesEntry() {
    var filePath = mp.get_property('path');
    var splitFilePath = filePath
        .replace(config.store.seriesPath, '')
        .split(config.store.pathSplitChar);
    var splitFileName = mp.get_property('filename').split(' - ');
    var season = +splitFilePath[1].replace('Season ', '');
    var episode = +splitFileName[0][4] * 10 + +splitFileName[0][5];
    var name = mp.get_property('filename/no-ext');
    var entry = {
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
    };
    return {
        entry: entry,
        isMovie: false,
        isSeries: true,
    };
}
