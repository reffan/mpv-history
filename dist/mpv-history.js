var scriptsFolder = '~~home/scripts/' + 'mpv-history/';
var config = JSON.parse(mp.utils.read_file(scriptsFolder + 'config.json'));
require(scriptsFolder + 'libs/store');
require(scriptsFolder + 'libs/menu');
