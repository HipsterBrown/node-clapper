const MulticastEmitter = require('./multicast-events');

const sub = new MulticastEmitter();

console.log('Listening for claps');

sub.on('clap', data => {
  console.log('A clap happened!', data);
});

sub.on('error', console.error);
