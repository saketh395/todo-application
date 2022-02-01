//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://saketh-todo:todo123@cluster0.xmohi.mongodb.net/todolistDB",{useNewUrlParser:true});

const itemschema = new mongoose.Schema({
  name:String
});

const Item = mongoose.model("item",itemschema);

const listschema = new mongoose.Schema({
  name:String,
  items:[itemschema]
});

const List = mongoose.model("list",listschema);

const add = new Item({
  name:"press + to add item"
});

const remove = new Item({
  name:"click checkbox[] to remove item"
});

const defaultitems = [add,remove]

app.get("/", function(req, res) {
 Item.find({},function(err,items){
   if(err)
   console.log(err);
   else
   {
     if(items.length === 0)
     {
        Item.insertMany(defaultitems,function(err){
          if(err)
          console.log(err);
          else
          console.log("inserted default values successfully");
        });
        res.render("list", {listTitle: "today", newListItems: items});
     }
     else
      res.render("list", {listTitle: "today", newListItems: items});
   }
 });
});

app.get("/:customlistname",function(req,res){
      const customlistname = _.capitalize(req.params.customlistname);

      List.findOne({name:customlistname},function(err,results){
            if(err)
            console.log(err);
            else
            {
               if(!results)
               {
                      const list = new List({
                        name:customlistname,
                        items:defaultitems
                        });
                        list.save();
                        res.redirect("/"+customlistname);
               }
               else
               res.render("list", {listTitle: results.name, newListItems: results.items});
            }
      });

    
});

app.post("/delete",function(req,res){
  const itemid = req.body.itemname
  const listname = req.body.listname;
  if(listname === "today")
  {
    Item.deleteOne({_id:itemid},function(err)
  {
    if(err)
    console.log(err);
    else
    res.redirect("/");
  })
  }
  else
  {
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:itemid}}},function(err)
    {
      if(err)
      console.log(err);
      else
      res.redirect("/"+listname);
    })
  }

  
})

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname = req.body.list;

  const item = new Item({
    name:itemname
  });

  if(listname === "today")
  {
    item.save();
  res.redirect("/");
  }
  else
  {
     List.findOne({name:listname},function(err,results){
        results.items.push(item);
        results.save();
        res.redirect("/"+listname);
     })
  }
  
       
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
