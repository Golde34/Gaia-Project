package base_repo

import (
	"fmt"
	"reflect"
)

func StructToColumnsAndValues(entity interface{}) ([]string, []interface{}) {
	v := reflect.ValueOf(entity)
	if v.Kind() == reflect.Ptr {
		v = v.Elem()
	}
	t := v.Type()

	var columns []string
	var values []interface{}
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		column := field.Tag.Get("db")
		if column == "" {
			column = field.Name 
		}
		columns = append(columns, column)
		values = append(values, v.Field(i).Interface())
	}
	return columns, values
}

func ConvertStruct(src interface{}, dst interface{}) {
	srcVal := reflect.ValueOf(src)
	if srcVal.Kind() == reflect.Ptr {
		srcVal = srcVal.Elem()
	}
	dstVal := reflect.ValueOf(dst)
	if dstVal.Kind() == reflect.Ptr {
		dstVal = dstVal.Elem()
	}

	srcType := srcVal.Type()
	for i := 0; i < srcVal.NumField(); i++ {
		srcField := srcType.Field(i)
		dstField := dstVal.FieldByName(srcField.Name)
		if dstField.IsValid() && dstField.CanSet() && srcField.Type.AssignableTo(dstField.Type()) {
			dstField.Set(srcVal.Field(i))
		}
	}
}

func ToStringUUID(value interface{}) string {
	switch v := value.(type) {
	case string:
		return v
	case []byte:
		if len(v) == 16 {
			return fmt.Sprintf("%x-%x-%x-%x-%x", v[0:4], v[4:6], v[6:8], v[8:10], v[10:])
		}
		return string(v)
	default:
		return fmt.Sprintf("%v", v)
	}
}