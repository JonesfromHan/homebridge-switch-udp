"use strict";

var Service, Characteristic;

module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory(
        "homebridge-switch-udp",
        "UdpSwitch",
        UdpSwitch
    );
};

function UdpSwitch(log, config) {
    this.log = log;
    this.name = config.name;
    this.port = config.port;
    this.onStatus = false;

    this._service = new Service.Switch(this.name);
    this._service
        .getCharacteristic(Characteristic.On)
        .on("set", this._setOn.bind(this));

    const dgram = require("dgram");
    const server = dgram.createSocket("udp4");

    server.on("error", (err) => {
        console.log(`UdpSwitch error:\n${err.stack}`);
        server.close();
    });

    server.on("message", (msg, rinfo) => {
        console.log(`server got: ${msg} from ${rinfo.address}:${rinfo.port}`);
        this.onStatus = !this.onStatus;
        this._service.setCharacteristic(Characteristic.On, this.onStatus);
    });

    server.on("listening", () => {
        const address = server.address();
        console.log(`server listening ${address.address}:${address.port}`);
    });

    server.bind(this.port);
}

HttpSwitch.prototype.getServices = function () {
    return [this._service];
};

HttpSwitch.prototype._setOn = function (on, callback) {
    this.log("Setting switch to " + on);

    callback();
};
