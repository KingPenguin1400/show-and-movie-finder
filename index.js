if("serviceWorker" in navigator){
  navigator.serviceWorker.register("https://kingpenguin1400.github.io/movie-and-show-finder/sw.js").then(registration => {
    console.log("SW Registered!");
    console.log(registration);
  }).catch(error =>{
    console.log("SW Registration Failed!");
    console.log(error);
  }
}
