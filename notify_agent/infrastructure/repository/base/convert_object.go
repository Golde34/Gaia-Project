package base_repo

import (
	"fmt"
	"reflect"
	"strings"
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

func StructToMap(val reflect.Value, typ reflect.Type) map[string]interface{} {
	result := make(map[string]interface{})	

	for i := 0; i < val.NumField(); i++ {
		field := typ.Field(i)
		if field.PkgPath != "" { // skip unexported fields
			continue
		}
		name := toSnakeCase(field.Name)
		result[name] = val.Field(i).Interface()
	}
	return result
}

// toSnakeCase converts CamelCase to snake_case.
func toSnakeCase(str string) string {
	var sb strings.Builder
	for i, r := range str {
		if i > 0 && r >= 'A' && r <= 'Z' {
			sb.WriteByte('_')
		}
		sb.WriteByte(byte(strings.ToLower(string(r))[0]))
	}
	return sb.String()
}
