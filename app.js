if (process.env.NODE_ENV != "production") {
    require("dotenv").config();
}



const express= require ("express");
const app= express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync =require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const flash = require("connect-flash")
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const {isLoggedIn, isOwner, validatelisting} = require("./middlewares.js")
const userRouter =require("./routes/user.js");
const {validateReview} = require("./middlewares.js")
const {listingSchema , reviewSchema} = require("./schema.js")

const listingController = require("./controllers/listing.js")
const multer = require("multer");
const {storage}  = require("./CloudConflict.js");
const { wrap } = require("module");
const upload = multer ({ storage});


const dbUrl = process.env.ATLASDB_URL;


main()
.then (()=>{
    console.log("connected to DB");
})

.catch((err)=>{
    console.log(err);
});


async function main() {
    await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname , "/public")));

const store = MongoStore.create({
    mongoUrl:dbUrl , 
    crypto : {
        secret : process.env.SECRET , 
    },
    touchAfter : 24 * 3600 , 
});

store.on("error" , (err)=> {
    console.log("ERROR in MONGO SESSION STORE" , err);
});

const sessionOptions = {
    store , 
    secret : process.env.SECRET , 
    resave : false ,
    saveUninitialized : true,
    httpOnly : true,
}



app.use(session(sessionOptions));
app.use (flash());

app.use (passport.initialize());
app.use (passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use ((req, res, next )=> {
    res.locals.success = req.flash ("success");
    res.locals.currUser = req.user;
    next();
});

app.use ("/" , userRouter);






//Index route

app.get("/listings" , async (req,res )=> {
    const allListings=  await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}
);



app.post("/listings", 
    isLoggedIn,
    upload.single("listing[image]"),
    validatelisting,
    wrapAsync(async (req, res , next)=>{
  
        let url =  req.file.path;
        let filename =req.file.filename;


         const newListing =  new Listing( req.body.listing);
         newListing.owner = req.user._id;
         newListing.image = {url , filename};
         await newListing.save();
         req.flash("success", "New listing created!")
         res.redirect("/listings");
     }),


)
  
  
  //New route
  app.get("/listings/new",isLoggedIn, (req, res)=>{
      res.render("listings/new.ejs");
  });
  
  
  //Show route 
  app.get("/listings/:id" , wrapAsync(async(req, res)=> {
      let {id} = req.params;
     const listing = await Listing.findById(id).populate("reviews").populate("owner");
     if(!listing) {
        req.flash("error", "listing you requested for does not exist!");
        res.redirect("/listings");
     }
     console.log(listing);
    res.render(path.join(__dirname, 'views/listings/show.ejs'), { listing });
  
  }))


  //Create route

    app.post('/listings', isLoggedIn, validatelisting, wrapAsync (async (req, res , next)=>{

        let url =  req.file.path;
        let filename =req.file.filename;
      console.log(url , "..", filename);

    

 
     const newListing =  new Listing( req.body.listing);
 
     newListing.owner = req.user._id;
     await newListing.save();
     req.flash("success", "New listing created!")
     res.redirect("/listings");
 })
 );
 
 //Edit route
 
 app.get("/listings/:id/edit" ,isLoggedIn, isOwner, wrapAsync(async (req, res)=> {
     let {id} = req.params;
     const listing = await Listing.findById(id);
     console.log(listing);
     res.render("listings/edit.ejs" , { listing });
 }));
 
 //Update route
 app.put("/listings/:id",
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),

    wrapAsync(async (req, res)=> {

     let {id} = req.params;
     let listing = await  Listing.findByIdAndUpdate(id, {...req.body.listing});
    if (typeof req.file !== "undefined") {
        let url =  req.file.path;
        let filename =req.file.filename;
        listing.image = {url , filename};
        await listing.save();
    }


     req.flash ("success", "Listing updated");
    res.redirect(`/listings/${id}`);
 }))
 
 //Delete route
 app.delete("/listings/:id",isLoggedIn ,isOwner,  wrapAsync( async (req ,res)=> {
     let {id } = req.params ; 
     let deleteListing = await Listing.findByIdAndDelete(id);
     console.log(deleteListing);
     req.flash ("success", "Listing Deleted");
     res.redirect("/listings");
 }))
 
//Reviews 
//Post route

app.post ("/listings/:id/reviews" , async(req, res )=>{
 let listing=await Listing.findById(req.params.id);
 let newReview = new Review (req.body.review);

listing.reviews.push(newReview);

await newReview.save();
await listing.save ();

res.redirect(`/listings/${listing._id}`);

});

//Delete review Route 

app.delete(
    "/listings/:id/reviews/:reviewId",
    wrapAsync(async (req , res) => {
        let { id , reviewId } = req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);

        res.redirect(`/listings/${id}`);
    })
)






app.all("*" , ( req, res, next)=> {
 next(new ExpressError(404, "Page Not Found!"));
});

app.use ((err, req, res , next)=> {
   let { statusCode=500 , message } = err;
   res.status(statusCode).send(message);
  // res.status(statusCode).send(message);
})

app.listen (8080, ()=>{
    console.log("server is listening to port 8080");

});
