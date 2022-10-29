const test_params = require("./0_test_data.js");
const catchRevert = require("./helpers/exceptionHelpers.js");
const ethers = require("ethers");

const ArtGallery = artifacts.require("ArtGallery");

contract("Test Buy Artwork", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount = accounts[1];
    const customerAccount_2 = accounts[2];

    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Art work buy', async()=>{
        var artwork_data = await test_params.test_data();
        var showBusinessList = await test_params.showBusinessList();
        
        for(var x=0; x<artwork_data.length; x++){
            await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })            
        }
        
        //test send void artwork code
        var result = await catchRevert.isEmptyCode(artGallery.buyArtwork("", { from: deployAccount, value: 0 }));        
        assert(result, "The void code has not been detected");
      
        //test artwork exixts
        var result = await catchRevert.artworkExist(artGallery.buyArtwork("code-not-valid", { from: deployAccount, value: 0 }));        
        assert(result, "The not valid code has been detected");
        
        //test not current owner
        var result = await catchRevert.notCurrentOwner(artGallery.buyArtwork(artwork_data[0].code, { from: deployAccount, value: artwork_data[0].price }));        
        assert(result, "The not current owner has not been detected");
        
        //test price
        var result = await catchRevert.validPrice(artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount, value: 1000 }));        
        assert(result, "The valid price has not been detected");

        //Buy one Artwork - need to verify if the owner can remote it after sale        
        await artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount, value: artwork_data[0].price })
        
        //test artwork is for sale
        var result = await catchRevert.forSale(artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount_2, value: artwork_data[0].price }));        
        assert(result, "The for sale has not been detected");
        

        //put for sale
        var price = "600000000000000000";                     
        var result = await artGallery.putForSale(artwork_data[0].code,  price, { from: customerAccount, value: 0 });        
        

        //try remove from old customer
        var result = await catchRevert.currentOwner(artGallery.removeFromSale(artwork_data[0].code, { from: deployAccount, value: 0 }));        
        assert(result, "The current owner has not been detected");
        

        //try buy from customer
        var result = await catchRevert.notCurrentOwner(artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount, value: artwork_data[0].price }));
        assert(result, "The not current owner has not been detected");


        //try buy from contract owner
        var result = await artGallery.buyArtwork(artwork_data[0].code, { from: deployAccount, value: price });
        


        if(showBusinessList){
            for(var x=0; x<artwork_data.length; x++){
                var lista = await artGallery.getBusinessList(artwork_data[x].code, { from: deployAccount, value: 0 });
                console.log(artwork_data[x].code);
                console.log(lista);
                console.log("---------");
            }
        }

        
        //test contract balance
        var result = await artGallery.getBalance({ from: deployAccount, value: 0 });                         
        console.log("Current contract balance: " + ethers.utils.formatEther(result[3].toString()));
        console.log("Total sold: " + ethers.utils.formatEther(result[0].toString()));
        console.log("Total direct sold: " + ethers.utils.formatEther(result[1].toString()));
        console.log("Total Fee: " + ethers.utils.formatEther(result[2].toString()));
        console.log("---------");

    })
    
   
})



