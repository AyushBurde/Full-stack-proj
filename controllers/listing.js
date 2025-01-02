const Listing = require("../models/listing");
const path = require('path');

module.exports.index = async (req,res )=> {
    const allListings=  await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  };

  module.exports.renderNewForm =  (req, res)=>{
    res.render("listings/new.ejs");
}

  module.exports.showListing = async(req, res)=> {
    let {id} = req.params;
   const listing = await Listing.findById(id).populate("reviews").populate("owner");
   if(!listing) {
      req.flash("error", "listing you requested for does not exist!");
      res.redirect("/listings");
   }
   console.log(listing);
  res.render(path.join(__dirname, '../views/listings/show.ejs'), { listing });

};

module.exports.createListing = async (req, res , next)=>{
  let url =  req.file.path;
  let filename =req.file.filename;
console.log(url , "..", filename);

    let result = listingSchema.validate(req.body);
    console.log(result);
    if(result.error) {
     throw new ExpressError(400, result.error);
    }
     const newListing =  new Listing( req.body.listing);
     newListing.owner = req.user._id;
     await newListing.save();
     req.flash("success", "New listing created!")
     res.redirect("/listings");
 }

 module.exports.renderEditform = async (req, res)=> {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs" , { listing });
}

module.exports.updatelisting = async (req, res)=> {
    let {id} = req.params;
    await  Listing.findByIdAndUpdate(id, {...req.body.listing});
   req.flash ("success", "Listing updated");
   res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req ,res)=> {
    let {id } = req.params ; 
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash ("success", "Listing Deleted");
    res.redirect("/listings");
};