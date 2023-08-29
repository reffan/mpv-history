"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var state = {
    isMenuActive: false,
    menuTimeout: null,
    history: [],
    selectedIndex: 0,
};
var originalFontSize = mp.get_property_number('osd-font-size');
mp.add_key_binding(config.menu.toggleKey, 'mpv-history-menu', toggleMenu);
mp.observe_property('osd-dimensions', 'native', function () {
    if (state.isMenuActive) {
        updateMenu();
    }
});
function updateMenu() {
    if (state.isMenuActive) {
        updateMenuHistory();
        var menuText_1 = 'Recents: ' + '\n\n';
        state.history.forEach(function (entry, index) {
            var cursor = '';
            if (state.selectedIndex === index) {
                cursor = '> ';
            }
            menuText_1 = menuText_1 + cursor + entry.file.name + '\n';
        });
        mp.commandv('show-text', menuText_1, "".concat(1000 * config.menu.timeoutInSeconds));
        clearTimeout(state.menuTimeout);
        state.menuTimeout = setTimeout(function () {
            hideMenu();
            state.isMenuActive = false;
        }, 1000 * config.menu.timeoutInSeconds);
    }
}
function toggleMenu() {
    state.isMenuActive = !state.isMenuActive;
    if (state.isMenuActive) {
        showMenu();
    }
    else {
        hideMenu();
    }
}
function showMenu() {
    mp.set_property_number('osd-font-size', config.menu.fontSize);
    updateMenu();
    mp.add_forced_key_binding('UP', 'recents_osd_menu.up', navigateMenuUp);
    mp.add_forced_key_binding('DOWN', 'recents_osd_menu.down', navigateMenuDown);
    mp.add_forced_key_binding('ENTER', 'recents_osd_menu.select', selectMenuEntry);
}
function hideMenu() {
    mp.set_property_number('osd-font-size', originalFontSize);
    mp.commandv('show-text', '', '0');
    mp.remove_key_binding('recents_osd_menu.up');
    mp.remove_key_binding('recents_osd_menu.down');
    mp.remove_key_binding('recents_osd_menu.select');
}
function navigateMenuUp() {
    state.selectedIndex = clamp(0, config.menu.maxEntries - 1, state.selectedIndex - 1);
    updateMenu();
}
function navigateMenuDown() {
    state.selectedIndex = clamp(0, config.menu.maxEntries - 1, state.selectedIndex + 1);
    updateMenu();
}
function selectMenuEntry() {
    if (state.isMenuActive) {
        var selectedEntry = state.history[state.selectedIndex];
        if (selectedEntry) {
            hideMenu();
            state.selectedIndex = 0;
            mp.commandv('loadfile', selectedEntry.file.path);
        }
    }
}
function updateMenuHistory() {
    var smashedArray = [];
    try {
        var fullHistoryJSON = mp.utils.read_file(scriptsFolder + config.file.history);
        var fullHistoryArray = JSON.parse(fullHistoryJSON);
        smashedArray = fullHistoryArray.movies
            .concat(fullHistoryArray.series)
            .reverse();
        smashedArray = smashedArray.sort(function (a, b) {
            return b.timestamp - a.timestamp;
        });
    }
    catch (error) {
        mp.utils.write_file('file://' + scriptsFolder + config.file.error, JSON.stringify(error, null, 2));
    }
    state.history = smashedArray.slice(0, config.menu.maxEntries);
}
function clamp(min, max, value) {
    return Math.min(max, Math.max(min, value));
}
