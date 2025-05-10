package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	base_dtos "notify_agent/core/domain/dtos/base"
	"notify_agent/core/domain/enums"
	"time"
)

func BaseAPIV2(url string, method string, input interface{}, output interface{}, headers map[string]string) (interface{}, error) {
	bodyResult, err := BaseAPI(url, method, input, headers)
	if err != nil {
		return nil, err
	}

	dataBytes, err := ConvertResponseToMap(bodyResult)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(dataBytes, &output)
	if err != nil {
		return nil, err
	}

	return output, nil
}

func BaseAPI(url string, method string, input interface{}, headers map[string]string) (interface{}, error) {
	if input == nil {
		return baseAPINoInput(url, method, headers, enums.OnlyData)
	}
	return baseAPIWithInput(url, method, input, headers, enums.OnlyData)
}

func baseAPINoInput(url string, method string, headers map[string]string, bodyType string) (interface{}, error) {
	req, err := http.NewRequest(method, url, nil)
	buildHeader(req, headers)	
	if err != nil {
		return errorReturnBlock("send request ", err)
	}
	log.Println("Request: ", req)

	return returnResponse(req, bodyType)
}

func baseAPIWithInput(url string, method string, input interface{}, headers map[string]string, bodyType string) (interface{}, error) {
	jsonData, err := json.Marshal(input)
	if err != nil {
		return errorReturnBlock("marshal input", err)
	}
	
	req, err := http.NewRequest(method, url, bytes.NewBuffer(jsonData))
	buildHeader(req, headers)
	if err != nil {
		return errorReturnBlock("send request ", err)
	}
	log.Println("Request: ", req)

	return returnResponse(req, bodyType)
}

func buildHeader(req *http.Request, headers map[string]string) {
	for key, value := range headers {
		req.Header.Set(key, value)
	}
}

func errorReturnBlock(statusMessage string, err error) (interface{}, error) {
	if err != nil {
		return base_dtos.ErrorResponse{
			Status:        "Error",
			StatusMessage: "Internal Server Error",
			ErrorCode:     500,
			ErrorMessage:  statusMessage,
		}, err
	}
	return base_dtos.ErrorResponse{
		Status:        "Success",
		StatusMessage: "Success",
		ErrorCode:     200,
		ErrorMessage:  statusMessage,
	}, nil
}

func returnResponse(req *http.Request, bodyType string) (interface{}, error) {
	client := &http.Client{
		Timeout: 5 * time.Second,
	}
	resp, err := client.Do(req)
	if err != nil {
		return errorReturnBlock("send request ", err)
	}
	defer resp.Body.Close()

	if (resp.StatusCode != 200) && (resp.StatusCode != 201) {
		return errorReturnBlock("response status code", fmt.Errorf("response status code: %d", resp.StatusCode))
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read response body: %v", err)
	}

	// map body to Error Response
	var response base_dtos.ErrorResponse

	err = json.Unmarshal(body, &response)
	if err != nil {
		return nil, fmt.Errorf("unmarshal response: %v", err)
	}

	return returnResponseType(response, bodyType)
}

func returnResponseType(response base_dtos.ErrorResponse, bodyMessageType string) (interface{}, error) {
	switch bodyMessageType {
	case enums.OnlyData:
		return response.Data, nil
	case enums.FullBody:
		return response, nil
	default:
		return response.Data, nil
	}
}

func FullResponseBaseAPI(url string, method string, input interface{}, headers map[string]string) (interface{}, error) {
	if input == nil {
		return baseAPINoInput(url, method, headers, enums.FullBody)
	}
	return baseAPIWithInput(url, method, input, headers, enums.FullBody)
}

func ConvertResponseToMap(bodyResult interface{}) ([]byte, error) {
	bodyMap, ok := bodyResult.(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("convert response to map: %v", ok)
	}

	dataBytes, err := json.Marshal(bodyMap)
	if err != nil {
		return nil, fmt.Errorf("marshal response body: %v", err)
	}

	return dataBytes, nil
}
