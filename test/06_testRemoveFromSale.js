const catchRevert = require("./helpers/exceptionHelpers.js");
const test_data = require("./0_test_data.js").test_data;

const ArtGallery = artifacts.require("ArtGallery");

contract("Test RemoveFromSaleArtwork", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount = accounts[1];
    const customerAccount_2 = accounts[2];

    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Art work remove from sale', async()=>{
        var artwork_data = await test_data();
        
        
        for(var x=0; x<artwork_data.length; x++){
            await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })            
        }
        
          
        //test send void artwork code
        var result = await catchRevert.isEmptyCode(artGallery.removeFromSale("", { from: deployAccount, value: 0 }));        
        assert(result, "The void code has not been detected");
      
        //test artwork exixts
        var result = await catchRevert.artworkExist(artGallery.removeFromSale("code-not-valid", { from: deployAccount, value: 0 }));        
        assert(result, "The not valid code has been detected");
                
        //simulate a customer buy
        var result = await artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount, value: artwork_data[0].price });    

        var price = "600000000000000000";
        await artGallery.putForSale(artwork_data[0].code, price, { from: customerAccount, value: 0 })
        
        var lista_before = await artGallery.getMovementList(artwork_data[0].code, { from: deployAccount, value: 0 });        
        console.log(lista_before);

        var result = await catchRevert.currentOwner(artGallery.removeFromSale(artwork_data[0].code, { from: customerAccount_2, value: 0 }));        
        assert(result, "The current owner has not been detected");


        await artGallery.removeFromSale(artwork_data[0].code, { from: customerAccount, value: 0 })
        
        console.log("====================");

        var lista_after = await artGallery.getMovementList(artwork_data[0].code, { from: deployAccount, value: 0 });        
        console.log(lista_after);

        var mov_after = await artGallery.getLastOperation(artwork_data[0].code, { from: customerAccount, value: 0 });
        if(mov_after.to == customerAccount){
            console.log("Test passed: remove-from-sale-owner")
        }                  
        if(mov_after.operation == 2){
            console.log("Test passed: remove-from-sale-operation")
        }           
        assert(mov_after.to == customerAccount, "The artwork is not on the right account");
        

        //Movement list
        /*
        for(var x=0; x<artwork_data.length; x++){
            var lista = await artGallery.getMovementList(artwork_data[x].code, { from: deployAccount, value: 0 });
            console.log(artwork_data[x].code);
            console.log(lista);
            console.log("---------");
        }
        */

        //contract balance
        /*
        var result = await artGallery.getBalance({ from: deployAccount, value: 0 });                                          
        console.log("Current contract balance: " + parseFloat(result[3]));
        console.log("Total sold: " + parseFloat(result[0]));
        console.log("Total direct sold: " + parseFloat(result[1]));
        console.log("Total Fee: " + parseFloat(result[2]));
        console.log("---------");
        */
    })
    
   
})
