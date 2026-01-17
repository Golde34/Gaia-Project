package resource

import _ "embed"

//go:embed check_and_decrease_quota.lua
var RateLimitScript string
