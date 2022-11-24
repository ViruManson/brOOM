let Objects = []
map = [1,1,1,1,1,1,1,1,1,1,
       1,0,1,0,0,0,0,0,0,1,
       1,0,1,0,0,0,0,0,0,1,
       1,0,1,0,1,1,1,0,0,1,
       1,0,1,0,0,0,0,0,0,1,
       1,0,0,0,0,0,0,0,0,1,
       1,0,0,0,0,0,0,0,0,1,
       1,0,0,1,1,1,0,0,0,1,
       1,0,0,0,0,0,0,0,0,1,
       1,1,1,1,1,1,1,1,1,1,]

for (let n = 0; n < 60; n++) {
    Objects.push(document.createElement("div"))
    document.getElementById("container").appendChild(Objects[n])

    Objects[n].classList.add("idfk")
}