const catchRevert = require("./helpers/exceptionHelpers.js");
const test_data = require("./0_test_data.js").test_data;

const ArtGallery = artifacts.require("ArtGallery");

contract("Test Withdraw", (accounts) => {
    const deployAccount = accounts[0];
    const customerAccount = accounts[1];
    const customerAccount_2 = accounts[2];

    let artGallery = null
    before(async()=>{
        artGallery = await ArtGallery.deployed()
    })

    
    it('Art work Withdraw', async()=>{
        var artwork_data = await test_data();
        const customerAccount = accounts[1];
        const customerAccount_2 = accounts[2];
        const customerAccount_3 = accounts[3];
        const customerAccount_4 = accounts[4];
    
        
        for(var x=0; x<artwork_data.length; x++){
            await artGallery.addArtwork(artwork_data[x].code, artwork_data[x].price, artwork_data[x].fee, { from: deployAccount, value: 0 })            
        }
        
        var amount = "400000000000000000";
        var esito = await catchRevert.balanceZero(artGallery.withdraw(customerAccount_4, amount, { from: deployAccount, value: 0 }));  
        assert(esito, "Balance zero not detected"); 

        //simulate a customer buy
        var result = await artGallery.buyArtwork(artwork_data[0].code, { from: customerAccount, value: artwork_data[0].price });    

        //simulate a customer buy
        var result = await artGallery.buyArtwork(artwork_data[1].code, { from: customerAccount_2, value: artwork_data[1].price });    
        
        var result = await artGallery.withdraw(customerAccount_3, amount, { from: deployAccount, value: 0 });  
        if(result){
            console.log("Test withdraw passed");
        }

        amount = "300000000000000000";
        var result = await artGallery.withdraw(customerAccount_4, amount, { from: deployAccount, value: 0 });  
        if(result){
            console.log("Test withdraw passed");
        }
        

        amount = "800000000000000000";
        var result = await catchRevert.amountExceedBalance(artGallery.withdraw(customerAccount_4, amount, { from: deployAccount, value: 0 }));  
        assert(result, "Amount exceed balance zero not detected"); 



        //contract balance
        var result = await artGallery.getBalance({ from: deployAccount, value: 0 });                     
        console.log("Current contract balance: " + parseFloat(result[3]));
        console.log("Total sold: " + parseFloat(result[0]));
        console.log("Total direct sold: " + parseFloat(result[1]));
        console.log("Total Fee: " + parseFloat(result[2]));
        console.log("---------");

    })
    
   
})
