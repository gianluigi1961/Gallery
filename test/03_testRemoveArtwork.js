const test_params = require("./0_test_data.js");
const catchRevert = require("./helpers/exceptionHelpers.js");

const ArtGallery = artifacts.require("ArtGallery");

contract("Test Remove Artwork", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount = accounts[1];

    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Art work remove', async()=>{
        var artwork_data = await test_params.test_data();
        var showBusinessList = await test_params.showBusinessList();
        
        for(var x=0; x<artwork_data.length; x++){
            await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })            
        }

        //test onlyOwner
        var result = await catchRevert.onlyOwner(artGallery.removeArtwork(artwork_data[0].code, { from: customerAccount, value: 0 }));        
        assert(result, "OnlyOwner not detected");

        //test send void artwork code
        var result = await catchRevert.isEmptyCode(artGallery.removeArtwork("", { from: deployAccount, value: 0 }));        
        assert(result, "The void code has not been detected");
      
        //test artwork exixts
        var result = await catchRevert.artworkExist(artGallery.removeArtwork("code-not-valid", { from: deployAccount, value: 0 }));        
        assert(result, "The not valid code has not been detected");
        
        //Check remove element not sale
        var esito = await artGallery.removeArtwork(artwork_data[0].code, { from: deployAccount, value: 0 })
        if(esito) {
            console.log("Test remove Artwork passed")
            artwork_data.splice(0, 1);
        }
        assert(esito, "The artwork has not beed removed");               
                 

        //Buy one Artwork - need to verify if the owner can remote it after sale        
        //await artGallery.buy(artwork_data[1].code, { from: customerAccount, value: artwork_data[0].price })
        
        //try remove a sold artwork        
        //var esito = await catchRevert.notCurrentOwner(artGallery.removeArtwork(artwork_data[1].code, { from: deployAccount, value: 0 }))
        //assert(esito == false, "The sold artwork has beed removed");       
        
        if(showBusinessList){
            for(var x=0; x<artwork_data.length; x++){
                var lista = await artGallery.getBusinessList(artwork_data[x].code, { from: deployAccount, value: 0 });
                console.log(artwork_data[x].code);
                console.log(lista);
                console.log("---------");
            }
        }

    })
    
   
})



