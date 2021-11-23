package util

func Must(action string, err error) {
	if err != nil {
		panic("failed to " + action + ": " + err.Error())
	}
}
