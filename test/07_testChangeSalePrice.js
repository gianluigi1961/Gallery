const catchRevert = require("./helpers/exceptionHelpers.js");
const test_params = require("./0_test_data.js");

const ArtGallery = artifacts.require("ArtGallery");

contract("Test ChangeSalePriceArtwork", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount = accounts[1];
    const customerAccount_2 = accounts[2];

    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Art work change sale price', async()=>{
        var artwork_data = await test_params.test_data();
        var showBusinessList = await test_params.showBusinessList();
        
        
        for(var x=0; x<artwork_data.length; x++){
            await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })            
        }
                 

        //test send void artwork code
        var result = await catchRevert.isEmptyCode(artGallery.changeSalePrice("", 1000, { from: deployAccount, value: 0 }));        
        assert(result, "The void code has not been detected");
      
        //test artwork exixts
        var result = await catchRevert.artworkExist(artGallery.changeSalePrice("code-not-valid", 1000, { from: deployAccount, value: 0 }));        
        assert(result, "The not valid code has been detected");
                
        //simulate a customer buy
        var result = await artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount, value: artwork_data[0].price });    
        
        //change the sale price
        var result = await catchRevert.forSale(artGallery.changeSalePrice(artwork_data[0].code, 1000, { from: customerAccount, value: 0 }));        
        assert(result, "The not for sale has not been detected");

        //test the right owner
        var result = await catchRevert.currentOwner(artGallery.changeSalePrice(artwork_data[0].code, 1000, { from: customerAccount_2, value: 0 }));        
        assert(result, "The current owner has not been detected");

        var price = "650000000000000000";
        //the current customer put the artwork for sale
        await artGallery.putForSale(artwork_data[0].code, price, { from: customerAccount, value: 0 });  

        if(showBusinessList){
            var lista_before = await artGallery.getBusinessList(artwork_data[0].code, { from: deployAccount, value: 0 });        
            console.log(lista_before);
        }

        var new_price = '950000000000000000';
        await artGallery.changeSalePrice(artwork_data[0].code, new_price, { from: customerAccount, value: 0 })

        if(showBusinessList){
            console.log("====================");

            var lista_after = await artGallery.getBusinessList(artwork_data[0].code, { from: deployAccount, value: 0 });        
            console.log(lista_after);
        }

        var mov = await artGallery.getLastBusiness(artwork_data[0].code, { from: customerAccount, value: 0 });
        if(parseFloat(mov.price) == parseFloat(new_price)){
            console.log("Test passed: put-for-sale-price")
        }        
        assert(parseFloat(mov.price) == parseFloat(new_price), "The artwork is not for sale on the right price");
        
                

    })
    
   
})
