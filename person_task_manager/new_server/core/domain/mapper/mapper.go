package mapper

import (
	"fmt"
	"reflect"

	"github.com/lib/pq"
)

func MapToStruct(data map[string]interface{}, result interface{}) error {
	v := reflect.ValueOf(result)
	if v.Kind() != reflect.Ptr || v.IsNil() {
		return fmt.Errorf("result must be a non-nil pointer")
	}
	v = v.Elem()
	t := v.Type()

	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		dbTag := field.Tag.Get("db")
		if dbTag == "" {
			dbTag = field.Name
		}

		value, exists := data[dbTag]
		if !exists || value == nil {
			continue
		}

		fieldValue := v.Field(i)
		if !fieldValue.CanSet() {
			continue
		}

		valueReflect := reflect.ValueOf(value)
		valueType := valueReflect.Type()
		fieldType := fieldValue.Type()

		if fieldType.Kind() == reflect.Slice && fieldType.Elem().Kind() == reflect.String {
			var arr pq.StringArray
			if err := arr.Scan(value); err == nil {
				fieldValue.Set(reflect.ValueOf([]string(arr)))
				continue
			}
		}

		if valueType.AssignableTo(fieldType) {
			fieldValue.Set(valueReflect)
		} else if valueType.ConvertibleTo(fieldType) {
			fieldValue.Set(valueReflect.Convert(fieldType))
		} else {
			return fmt.Errorf("cannot assign %s (type %s) to field %s (type %s)", dbTag, valueType, field.Name, fieldType)
		}
	}
	return nil
}
