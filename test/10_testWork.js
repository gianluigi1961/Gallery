const catchRevert = require("./helpers/exceptionHelpers.js");
const test_params = require("./0_test_data.js");
const ethers = require("ethers");

const ArtGallery = artifacts.require("ArtGallery");

contract("Test Gallery", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount_1 = accounts[1];
    const customerAccount_2 = accounts[2];
    const customerAccount_3 = accounts[3];

    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Gallery working', async()=>{
        var artwork_data = await test_params.test_data();
        var showBusinessList = await test_params.showBusinessList();        
        
        for(var x=0; x<artwork_data.length; x++){
            await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })            
        }
        
          
        //Buy one Artwork - need to verify if the owner can remote it after sale        
        await artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount_1, value: artwork_data[0].price })
        console.log("Test passed: Buy artwork 1");

        await artGallery.buyArtwork(artwork_data[1].code, { from: customerAccount_2, value: artwork_data[1].price })
        console.log("Test passed: Buy artwork 2");

        //put for sale
        var price_1 = "600000000000000000";                     
        var result = await artGallery.putForSale(artwork_data[0].code,  price_1, { from: customerAccount_1, value: 0 });        
        console.log("Test passed: Put for sale 1");

        var price_2 = "800000000000000000";                     
        var result = await artGallery.putForSale(artwork_data[1].code,  price_2, { from: customerAccount_2, value: 0 });        
        console.log("Test passed: Put for sale 2");

        await artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount_3, value : price_1 })
        console.log("Test passed: Re-Buy artwork 1");

        await artGallery.buyArtwork(artwork_data[1].code, { from: customerAccount_3, value : price_2 })
        console.log("Test passed: Re-Buy artwork 2");

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
        //console.log(result);                                          
        console.log("Current contract balance: " + ethers.utils.formatEther(result[3].toString()));
        console.log("Total sold: " + ethers.utils.formatEther(result[0].toString()));
        console.log("Total direct sold: " + ethers.utils.formatEther(result[1].toString()));
        console.log("Total Fee: " + ethers.utils.formatEther(result[2].toString()));
        console.log("---------");

    })
    
   
})
