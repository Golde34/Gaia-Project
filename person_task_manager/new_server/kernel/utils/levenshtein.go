package utils

import (
	"container/heap"
	"personal_task_manager/core/domain/constants"
	"sort"
	"strings"
	"sync"
	"unicode/utf8"

	"github.com/agnivade/levenshtein"
)

func FindTopMatches(name string, targets []string) []MatchResult {
	numWorkers := constants.LevenshteinConfig.NumberOfWorker

	jobs := make(chan string, 1000)
	resultsChan := make(chan MatchResult, 1000)
	var wg sync.WaitGroup

	inputLower := strings.ToLower(name)
	inputLen := utf8.RuneCountInString(inputLower)
	maxDist := constants.LevenshteinConfig.MaxDistance
	topK := constants.LevenshteinConfig.TopKResult

	for w := 1; w <= numWorkers; w++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			worker(jobs, resultsChan, inputLower, inputLen, maxDist)
		}()
	}

	go func() {
		for _, t := range targets {
			jobs <- t
		}
		close(jobs)
	}()

	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	return sortTopResults(resultsChan, topK)
}

func worker(jobs <-chan string, resultsChan chan<- MatchResult, inputLower string, inputLen int, maxDist int) {
	for t := range jobs {
		tLower := strings.ToLower(t)
		tLen := utf8.RuneCountInString(tLower)

		diff := inputLen - tLen
		if diff < 0 {
			diff = -diff
		}
		if diff > maxDist {
			continue
		}

		dist := levenshtein.ComputeDistance(inputLower, tLower)
		if dist <= maxDist {
			resultsChan <- MatchResult{Name: t, Distance: dist}
		}
	}
}

func sortTopResults(resultsChan <-chan MatchResult, topK int) []MatchResult {
	h := &MatchHeap{}
	heap.Init(h)

	for res := range resultsChan {
		if h.Len() < topK {
			heap.Push(h, res)
		} else if res.Distance < (*h)[0].(MatchResult).Distance {
			heap.Pop(h)
			heap.Push(h, res)
		}
	}

	final := make([]MatchResult, h.Len())
	sort.Slice(final, func(i, j int) bool {
		return final[i].Distance < final[j].Distance
	})

	return final
}
