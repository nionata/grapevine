const serviceUuid = "acce5bbb-e206-4ac8-9f02-fc9a77f4efc4";
const characteristicUuid = "22c180b9-5c6d-4511-8e44-973b4707113a";
const connectOutput = document.querySelector("#grapevine-connect-output");
const scanOutput = document.querySelector("#grapevine-scan-output");

const appendP = (div, p) => {
  const elm = document.createElement("p");
  elm.textContent = p;
  div.append(elm);
};

document
  .querySelector("#grapevine-connect-btn")
  .addEventListener("click", function (event) {
    connectOutput.innerHTML = "";
    navigator.bluetooth.scan;
    navigator.bluetooth
      .requestDevice({
        filters: [
          {
            services: [serviceUuid],
          },
        ],
        optionalServices: [serviceUuid],
      })
      .then((device) => {
        console.log("device", device);
        appendP(connectOutput, `Device ${device.id}`);
        return device.gatt.connect();
      })
      .then((server) => {
        console.log("server", server);
        appendP(connectOutput, `Server ${server.connected}`);
        return server.getPrimaryService(serviceUuid);
      })
      .then((service) => {
        console.log("Getting characteristic for service", service.uuid);
        appendP(
          connectOutput,
          `Getting characteristic for service ${service.uuid}`
        );
        return service.getCharacteristic(characteristicUuid);
      })
      .then((characteristic) => {
        console.log("Reading characteristic", characteristic.uuid);
        appendP(connectOutput, `Reading characteristic ${characteristic.uuid}`);
        return characteristic.readValue();
      })
      .then((val) => {
        const textDecoder = new TextDecoder("utf-8");
        const value = textDecoder.decode(val.buffer);
        console.log(value);
        appendP(connectOutput, `Value ${value}`);
      })
      .catch((error) => {
        console.error("err", error);
      });
  });

document
  .querySelector("#grapevine-scan-btn")
  .addEventListener("click", function (event) {
    scanOutput.innerHTML = "";
    navigator.bluetooth
      .requestLEScan({
        filters: [
          {
            services: [serviceUuid],
          },
        ],
        keepRepeatedDevices: true,
      })
      .then(() => {
        navigator.bluetooth.addEventListener(
          "advertisementreceived",
          (event) => {
            console.log("Advertisement received.");
            console.log("  Device Name: " + event.device.name);
            console.log("  Device ID: " + event.device.id);
            console.log("  RSSI: " + event.rssi);
            console.log("  TX Power: " + event.txPower);
            console.log("  UUIDs: " + event.uuids);
          }
        );
      });
  });
