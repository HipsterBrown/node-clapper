// Import the interface to Tessel hardware
const tessel = require('tessel');
const ambient = require('ambient-attx4');

const MulticastEmitter = require('multicast-eventer');

const debug = require('debug')('t2-clapper');

const sensor = ambient.use(tessel.port['A']);
const TRIGGER_LEVEL = 0.13;
const CLAP_THRESHOLD_MS = 1000;

let clapTimoutID;
let firstClap = false;

const pub = new MulticastEmitter();

sensor.on('ready', () => {
  debug('Setting sound trigger now');

  sensor.setSoundTrigger(TRIGGER_LEVEL);

  sensor.on('sound-trigger', sound => {
    debug('We hit the sound threshold:', sound);
    sensor.clearSoundTrigger(() => sensor.setSoundTrigger(TRIGGER_LEVEL));

    if (firstClap) {
      clearTimeout(clapTimoutID);

      pub.emit('clap');
    } else {
      firstClap = true;
    }

    clapTimoutID = setTimeout(() => {
      debug('Clearing clapper');
      firstClap = false;
    }, CLAP_THRESHOLD_MS);
  });
});

sensor.on('error', debug);
pub.on('error', debug);
