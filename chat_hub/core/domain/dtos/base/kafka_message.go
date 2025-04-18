package base_dtos

type KafkaMessage struct {
	Cmd string `json:"cmd"`
	ErrorCode string `json:"errorCode"`
	ErrorMessage string `json:"errorMessage"`
	DisplayTime string `json:"displayTime"`
	Data interface{} `json:"data"`
}