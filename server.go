package main

import (
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"os"
)

const (
	staticURL          string = "/"
	statisRoot         string = ""
	staticCacheControl string = "no-cache"
)

func staticHandler(w http.ResponseWriter, req *http.Request) {
	staticFile := req.URL.Path[len(staticURL):]
	if len(staticFile) == 0 {
		t, _ := template.ParseFiles("index.html")
		t.Execute(w, nil)
		return
	}

	f, err := http.Dir(statisRoot).Open(staticFile)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	defer f.Close()
	content := io.ReadSeeker(f)
	info, _ := os.Stat(fmt.Sprintf("%s%s", statisRoot, staticFile))
	w.Header().Add("Cache-Control", staticCacheControl)
	http.ServeContent(w, req, staticFile, info.ModTime(), content)
	return
}

func main() {
	http.HandleFunc("/", staticHandler)

	err := http.ListenAndServe(":8086", nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
