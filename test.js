import Places from "./maps/Places.js";

const p = new Places();
p.search("Avenue").then(data => {
    console.log(data);
}).catch(err => console.log(err));