const catchRevert = require("./helpers/exceptionHelpers.js");
const test_params = require("./0_test_data.js");

const ArtGallery = artifacts.require("ArtGallery");

contract("Test GetCurrentOwner", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount = accounts[1];
    const customerAccount_2 = accounts[2];
    
    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Art work get current owner', async()=>{
        var artwork_data = await test_params.test_data();
        var showBusinessList = await test_params.showBusinessList();
        
        
        for(var x=0; x<artwork_data.length; x++){
            await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })            
        }
        
                
        //test send void artwork code
        var result = await catchRevert.isEmptyCode(artGallery.getCurrentOwner("", { from: deployAccount, value: 0 }));        
        assert(result, "The void code has not been detected");

        //test artwork exixts
        var result = await catchRevert.artworkExist(artGallery.getCurrentOwner("code-not-valid", { from: deployAccount, value: 0 }));        
        assert(result, "The not valid code has been detected");
        
        
        //simulate a customer buy
        var result = await artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount, value: artwork_data[0].price });    

        /* Check the current owner */
        var mov = await artGallery.getLastBusiness(artwork_data[0].code, { from: customerAccount, value: 0 });
        if(mov.owner == customerAccount){
            console.log("Test passed: current-owner")
        }        
        assert(mov.owner == customerAccount, "The artwork is not for the right owner");



        
    })
    
   
})
