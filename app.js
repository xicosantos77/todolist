const express = require("express");

const bodyParser = require("body-parser");

const mongoose = require('mongoose');

const date = require(__dirname + "/date.js");

const _ = require("lodash");


const app = express();


app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));


// const items = ["Buy Food", "Cook Food", "Eat Food"];

// const workItems = [];


// mongoose.connect("mongod://localhost:27017/todolistDb",{useNewUrlParser: true});


main().catch(err => console.log(err));


async function main() {
  await mongoose.connect('mongodb+srv://admin-francisco:Test123@cluster0.zwq1g6e.mongodb.net/todoListDB');
};

const itemSchema = {
  name:String,
};

const Item = mongoose.model ("Item", itemSchema)

const item1 = new Item({
  name : "Welcome to your todolist!"
});

const item2  = new Item({
  name : "Hit the + button to add a new item."
});

const item3 = new Item({
  name : "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String, 
  items: [itemSchema] 
};

const List = mongoose.model("List", listSchema); 

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }else{
          console.log("Successfull saved all the items to Db")
        }
      }); 
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
      }
  });

// const day = date.getDate();
});

app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){

        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save(); 
        res.redirect("/"+ customListName);
      } else {
        
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})

      }
    }
  });
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){

      let foundListArray = foundList.items;

      foundListArray.push(item); 
      foundList.save(); 
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox; 
  const listName = req.body.listName; 

  if(listName === "Today"){

    Item.deleteOne({_id : checkedItemId}, function(err) {
      if (!err) {
        console.log ("Successfully deleted checked item.");
        res.redirect("/");
      }
    });

  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });

  }

  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});


app.get("about", function (req, res){
  res.render("/about");
});

let port = process.env.PORT; 
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully!");
});