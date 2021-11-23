package bluetooth

import (
	"grapevine/cli/util"
	"tinygo.org/x/bluetooth"
)

var adapter = bluetooth.DefaultAdapter

func Scan(scanAll bool) {
	initCentral()
	println("scanning...")
	err := adapter.Scan(func(adapter *bluetooth.Adapter, device bluetooth.ScanResult) {
		if scanAll || device.HasServiceUUID(getUUID(GrapevineServiceUuid)) {
			println("found device:", device.Address.String(), device.RSSI, device.LocalName())
		}
	})
	util.Must("start scan", err)
}

func Connect(targetDevice string) {
	initCentral()
	grapevineServiceUUID := getUUID(GrapevineServiceUuid)
	ch := make(chan bluetooth.ScanResult, 1)
	err := adapter.Scan(func(adapter *bluetooth.Adapter, result bluetooth.ScanResult) {
		if result.Address.String() == targetDevice {
			if !result.HasServiceUUID(grapevineServiceUUID) {
				panic("grapevine service not found")
			}
			adapter.StopScan()
			ch <- result
		}
	})
	util.Must("start scan", err)
	var device *bluetooth.Device
	select {
	case result := <-ch:
		device, err = adapter.Connect(result.Address, bluetooth.ConnectionParams{})
		util.Must("connect to device", err)
		println("connected to ", result.Address.String())
	}

	services, err := device.DiscoverServices([]bluetooth.UUID{grapevineServiceUUID})
	util.Must("discover services", err)
	if len(services) != 1 {
		panic("could not discover grapevine service")
	}
	characteristics, err := services[0].DiscoverCharacteristics([]bluetooth.UUID{getUUID(MessageCharacteristicUuid)})
	util.Must("discover characteristics", err)
	if len(characteristics) != 1 {
		panic("could not discover message characteristic")
	}
	var data []byte
	n, err := characteristics[0].Read(data)
	util.Must("read characteristic", err)
	println(n, string(data))
}

func initCentral() {
	util.Must("enable BLE stack", adapter.Enable())
}

func getUUID(uuidString string) bluetooth.UUID {
	uuid, err := bluetooth.ParseUUID(uuidString)
	util.Must("parse service uuid", err)
	return uuid
}
