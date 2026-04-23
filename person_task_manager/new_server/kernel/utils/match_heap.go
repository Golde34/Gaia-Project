package utils

import "unicode/utf8"

type MatchResult struct {
	Name     string
	Distance int
}

type MatchHeap []interface{}

func (h MatchHeap) Len() int {
	return len(h)
}

func (h MatchHeap) Less(i, j int) bool {
	a := h[i].(MatchResult)
	b := h[j].(MatchResult)

	if a.Distance == b.Distance {
		return utf8.RuneCountInString(a.Name) > utf8.RuneCountInString(b.Name)
	}
	return a.Distance < b.Distance
}

func (h MatchHeap) Swap(i, j int) {
	h[i], h[j] = h[j], h[i]
}

func (h *MatchHeap) Push(x interface{}) {
	*h = append(*h, x)
}

func (h *MatchHeap) Pop() interface{} {
	old := *h
	n := len(old)
	x := old[n-1]
	*h = old[0 : n-1]
	return x
}
