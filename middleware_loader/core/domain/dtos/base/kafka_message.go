package base_dtos

import "encoding/json"

type KafkaMessage struct {
	Cmd          string      `json:"cmd"`
	ErrorCode    string      `json:"errorCode"`
	ErrorMessage string      `json:"errorMessage"`
	DisplayTime  string      `json:"displayTime"`
	Data         interface{} `json:"data"`
}

func (k *KafkaMessage) String() string {
	bytes, err := json.Marshal(k)
	if err != nil {
		return ""
	}
	return string(bytes)
}
