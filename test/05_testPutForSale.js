const catchRevert = require("./helpers/exceptionHelpers.js");
const test_params = require("./0_test_data.js");
const ethers = require("ethers");

const ArtGallery = artifacts.require("ArtGallery");

contract("Test PutForSaleArtwork", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount = accounts[1];
    const customerAccount_2 = accounts[2];

    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Art work put for sale', async()=>{
        var artwork_data = await test_params.test_data();
        var showBusinessList = await test_params.showBusinessList();
        
        
        for(var x=0; x<artwork_data.length; x++){
            await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })            
        }
        
        //test send void artwork code
        var result = await catchRevert.isEmptyCode(artGallery.putForSale("", 1000,{ from: deployAccount, value: 0 }));        
        assert(result, "The void code has not been detected");
      
        //test artwork exixts
        var result = await catchRevert.artworkExist(artGallery.putForSale("code-not-valid", 1000,{ from: deployAccount, value: 0 }));        
        assert(result, "The not valid code has been detected");
                
        //simulate a customer buy
        var result = await artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount, value: artwork_data[0].price });    

        //test not current owner
        //await artGallery.putForSale(artwork_data[0].code, artwork_data[0].price, { from: customerAccount_2, value: 0 })

        var result = await catchRevert.currentOwner(artGallery.putForSale(artwork_data[0].code, artwork_data[0].price, { from: customerAccount_2, value: 0 }));        
        assert(result, "The current owner has not been detected");

        var price = "600000000000000000";
        //the current customer put the artwork for sale
        await artGallery.putForSale(artwork_data[0].code, price, { from: customerAccount, value: 0 });  
        
        //test if the put for sale work well
        var lastBusiness = await artGallery.getLastBusiness(artwork_data[0].code, { from: customerAccount, value: 0 });
        if(lastBusiness.owner == customerAccount){
            console.log("Test passed: put-for-sale-owner")
        }                      
        if(parseFloat(lastBusiness.price) == parseFloat(price)){
            console.log("Test passed: put-for-sale-price")
        }
        assert(lastBusiness.owner == customerAccount, "The artwork is not for sale on the right account");
        assert(parseFloat(lastBusiness.price) == parseFloat(price), "The artwork is not for sale on the right price");


        //test not for sale - 
        var result = await catchRevert.notForSale(artGallery.putForSale(artwork_data[0].code, "600000000000000000", { from: customerAccount, value: 0 }));        
        assert(result, "The artwork is not for sale has not been detected");


        //Movement list
        if(showBusinessList){
            for(var x=0; x<artwork_data.length; x++){
                var lista = await artGallery.getBusinessList(artwork_data[x].code, { from: deployAccount, value: 0 });
                console.log(artwork_data[x].code);
                console.log(lista);
                console.log("---------");
            }
        }


        //contract balance
        var result = await artGallery.getBalance({ from: deployAccount, value: 0 });                     
        console.log("Current contract balance: " + ethers.utils.formatEther(result[3].toString()));
        console.log("Total sold: " + ethers.utils.formatEther(result[0].toString()));
        console.log("Total direct sold: " + ethers.utils.formatEther(result[1].toString()));
        console.log("Total Fee: " + ethers.utils.formatEther(result[2].toString()));
        console.log("---------");

    })
    
   
})
