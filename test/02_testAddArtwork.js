const catchRevert = require("./helpers/exceptionHelpers.js");
const test_data = require("./0_test_data.js").test_data;

const ArtGallery = artifacts.require("ArtGallery");

contract("Test AddArtwork", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount = accounts[1];

    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Art work added', async()=>{
        var artwork_data = await test_data();
        
        //test onlyOwner
        var result = await catchRevert.onlyOwner(artGallery.addArtwork(artwork_data[0].code, artwork_data[0].price, artwork_data[0].fee, { from: customerAccount, value: 0 }));        
        assert(result, "OnlyOwner not detected");

        //test send void artwork code
        var result = await catchRevert.isEmptyCode(artGallery.addArtwork("", artwork_data[0].price, artwork_data[0].fee, { from: deployAccount, value: 0 }));        
        assert(result, "The void code has not been detected");
                
        //test send void price = 0       
        result = await catchRevert.valueZero(artGallery.addArtwork(artwork_data[0].code, 0, artwork_data[0].fee, { from: deployAccount, value: 0 }))
        assert(result, "The price zero has not been detected");
        
        
        for(var x=0; x<artwork_data.length; x++){
            var tx = await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })
            console.log(tx.logs[0].args.code)
            console.log(parseFloat(tx.logs[0].args.price))
            assert(tx.logs.length === 1, "one event should have been triggered");
            assert(tx.logs[0].args.code === artwork_data[x].code, "the code is not the same");
            assert(parseFloat(tx.logs[0].args.price) === parseFloat(artwork_data[x].price), "the price is not the same");
        }
          

        //test send duplicate artwork code        
        result = await catchRevert.artworkNotExist(artGallery.addArtwork(artwork_data[0].code, artwork_data[0].price, artwork_data[0].fee, { from: deployAccount, value: 0 }))
        assert(result, "The duplicate Artwork has not been detected");
        
        for(var x=0; x<artwork_data.length; x++){
            var lista = await artGallery.getMovementList(artwork_data[x].code, { from: deployAccount, value: 0 });
            console.log(artwork_data[x].code);
            console.log(lista);
            console.log("---------");
        }

    })
    
   
})



