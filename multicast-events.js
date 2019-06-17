const dgram = require('dgram');
const EventEmitter = require('events');
const exec = require('child_process').execSync;
const os = require('os');

try {
  exec('route add -net 224.0.0.0/4 dev wlan0');
} catch (error) {
  console.error(error);
}

const PORT = 33333;
const MULTICAST_ADDRESS = '239.10.10.100';

class MulticastEmitter extends EventEmitter {
  constructor({port = PORT, address = MULTICAST_ADDRESS} = {}) {
    super();

    this.port = port;
    this.address = address;
    this.device = os.hostname();
    this.pub = dgram.createSocket('udp4');

    this.pub.bind(port, () => {
      this.pub.setBroadcast(true);
      this.pub.setMulticastTTL(128);

      try {
        this.pub.addMembership(MULTICAST_ADDRESS);
      } catch (error) {
        super.emit('error', error);
      }
    });

    this.pub.on('message', (message, remote) => {
      console.log(`Message from: ${remote.address}:${remote.port}`);
      try {
        const data = JSON.parse(message);
        if (data.device !== this.device) {
          super.emit(data.event, data);
        }
      } catch (error) {
        super.emit('error', error);
      }
    });
  }

  emit(eventName, data = {}) {
    const payload = JSON.stringify(
      Object.assign({}, data, {
        device: this.device,
        event: eventName,
      }),
    );

    this.pub.send(
      Buffer.from(payload),
      0,
      payload.length,
      this.port,
      this.address,
    );
  }
}

module.exports = MulticastEmitter;
