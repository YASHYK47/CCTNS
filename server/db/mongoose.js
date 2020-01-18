const mongoose =require('mongoose');

mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost/SIH2020').then(() => {
console.log("Connected to Database");
}).catch((err) => {
    console.log("Not Connected to Database ERROR! ", err);
});

module.exports={
  mongoose
};
