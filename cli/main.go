package main

import (
	"gopkg.in/alecthomas/kingpin.v2"
	"grapevine/cli/bluetooth"
	"os"
)

var (
	app = kingpin.New("grapevine", "Grapevine command-line tool.")

	bluetoothCmd = app.Command("bluetooth", "Perform a bluetooth action.")

	scanCmd = bluetoothCmd.Command("scan", "Scan for Grapevine devices.")
	scanAll = scanCmd.Flag("all", "Detect all devices").Short('a').Default("false").Bool()

	connectCmd = bluetoothCmd.Command("connect", "Connect to a Grapevine device.")
	device     = connectCmd.Arg("device", "Device address you wish to connect to.").Required().String()
)

func main() {
	switch kingpin.MustParse(app.Parse(os.Args[1:])) {
	case scanCmd.FullCommand():
		bluetooth.Scan(*scanAll)
	case connectCmd.FullCommand():
		bluetooth.Connect(*device)
	}
}
