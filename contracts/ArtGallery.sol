// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Address.sol";




/*
************************
ArtGallery SmartContract
************************
- We simulate an art gallery that sells its works of art
- Customers can put the purchased works of art on sale and in case of sale the art gallery retains the fees
*/
contract ArtGallery is Ownable{    
              
    enum en_Operation{
        Enter,
        ForSale, 
        Purchase
    }

    /*
    *   
    */
    struct Artwork {        
        /*
        *   The fees that the contract retains for each sale
        */
        uint percFee;

        /*
        *   Need to understand if an Artwork exixts in the Mapping
        */
        bool exists;      
    }

    /*
    *   Defines the list of purchase or sale transactions
    *   The smart Contract create a new Business element every time 
    *   the owner changes the state of the artwork and evry time it is sold
    */
    struct Business {
        
        /*
        *   The new Owner of the Artwork
        */
        address owner;

        /*
        *   The price of the operation
        */
        uint price;

        /*
        *   The operation type
        *   Created every time the Owner change the Art work status 
        *   and/or price and every time an Artwork is sold
        *   Define the current status of the Artwork, Purchased or ForSale
        */
        en_Operation operation;
    }



    /* Contract Data */ 
    mapping(string => Artwork) artworks;
    mapping(string => Business[]) business;
    uint totalSold;
    uint totalDirectSold;
    uint totalFeeSold;

    

    /* Contract Events */
    event AddArtworkEvent(string code, uint price);
    event RemoveArtworkEvent(string code);
    event PutArtworkForSaleEvent(string code, uint price);
    event RemoveArtworkForSaleEvent(string code);
    event BuyEvent(string code, uint price, address from);
    event SendPaymentEvent(string code, uint price, address to);
    event ChangeArtworkPriceEvent(string code, uint price);

    
    /*
    *    The Contract owner insert the Artwork
    *
    *    Requirements:
    * 
    *    - `_code`      : the unique code of the Artwork
    *    - `_price`     : the price of the Artwork
    *    - `_percFee`   : the fee applied when a client resells the Artwork
    * 
    *   Emits a {AddArtworkEvent} event.
    */
    function addArtwork(string memory _code, uint _price, uint _percFee) 
                        public 
                        onlyOwner
                        stringNotVoid(_code)
                        artworkNotExists(_code) 
                        valueNotZero(_price, "The price is required") {
                
        Artwork memory product;
        product.percFee = _percFee;        
        product.exists = true;
        
        Business memory newBusiness;                    
        newBusiness.owner = msg.sender;
        newBusiness.price = _price;
        newBusiness.operation = en_Operation.Enter;

        artworks[_code] = product;        
        business[_code].push(newBusiness);
        
        emit AddArtworkEvent(_code, _price);
    }

    /*
    *    The Contract owner remove the Artworks, only if the Contract owner is the artwork owner
    *
    *   Requirements:
    * 
    *   - `_code`   : the unique code of the Artwork  
    * 
    *   Emits a {RemoveArtworkEvent} event.              
    */
    function removeArtwork(string memory _code) 
                            public 
                            onlyOwner 
                            stringNotVoid(_code)
                            artworkExists(_code) 
                            senderIsArtworkOwner(_code )                             
                            returns(bool){

        delete artworks[_code];                
        delete business[_code];  

        emit RemoveArtworkEvent(_code);
        
        return artworks[_code].exists && business[_code].length > 0;
    }

    /*
    *   Buy a product, the product must be for sale
    *
    *   Requirements:
    * 
    *   - `_code` : the product code you want buy
    * 
    *   Emits a {SendPaymentEvent} event - Only when ArtWork Owner is a Customer
    *   Emits a {BuyEvent} event.   
    */
    function buyArtwork(string memory _code) 
                    public 
                    payable 
                    stringNotVoid(_code) 
                    artworkExists(_code)
                    senderIsNotArtworkOwner(_code)
                    artworkIsForSale(_code)
                    returns(bool){

        //The amouint to send to the current Artwork Owner 
        //in case is not the constract Owner
        uint amountToPay;

        Business memory lastBusiness = getLastBusiness(_code);
                
        /* Check the send amount is equals to the Artwork price */
        require(lastBusiness.price == msg.value, "#valid-price# - The price is not valid");

        //I am doing a resale for which i have to send
        //payment to the owner minus the fees
        if(lastBusiness.owner != owner()){
            Artwork memory product = artworks[_code];
            if(product.percFee > 0){
                amountToPay = msg.value - (msg.value / 100 * product.percFee);
                Address.sendValue(payable(lastBusiness.owner), amountToPay);            
            }
        }

        /* Create a new Purchase operation - Change the Artwork Owner */
        Business memory newbusiness;        
        newbusiness.owner = msg.sender;
        newbusiness.price = msg.value;
        newbusiness.operation = en_Operation.Purchase;
        business[_code].push(newbusiness);

        emit BuyEvent(_code, msg.value, msg.sender);

        if(lastBusiness.owner != owner()){
            emit SendPaymentEvent(_code, amountToPay, lastBusiness.owner);
        }
        
        unchecked {
            totalSold += msg.value;
            if(lastBusiness.owner != owner()){
                totalFeeSold += (msg.value - amountToPay);            
            }else{
                totalDirectSold += msg.value;
            }
        }

        return true;
    }

    /*
    *   The buyer can put the product for sale
    *
    *   Requirements:
    * 
    *   - `_code` : the product code, the sender must be the current owner
    *   - `_price`:    the sale price
    * 
    *   Emits a {PutArtworkForSaleEvent} event.  
    */
    function putForSale(string memory _code, uint _price) 
                        public 
                        stringNotVoid(_code)
                        artworkExists(_code)
                        valueNotZero(_price, "The price is required")
                        senderIsArtworkOwner(_code)
                        artworkIsNotForSale(_code) 
                        returns(bool){
        
        Business memory newBusiness;        
        newBusiness.owner = msg.sender;
        newBusiness.price = _price;
        newBusiness.operation = en_Operation.ForSale;
        business[_code].push(newBusiness);

        emit PutArtworkForSaleEvent(_code, _price);

        return true;
    }

    /*
    *   The buyer can remove the artwork for sale
    *
    *   Requirements:
    * 
    *   - `_code` : the artwork code, the sender must be the current owner        
    * 
    *   Emits a {RemoveArtworkForSaleEvent} event.  
    */
    function removeFromSale(string memory _code) 
                            public 
                            stringNotVoid(_code)
                            artworkExists(_code) 
                            senderIsArtworkOwner(_code)
                            artworkIsForSale(_code)
                            returns(bool){
                       
        Business memory lastBusiness = getLastBusiness(_code);
        require(lastBusiness.owner != owner(), "#cannot-remove# - The contract owner cannot remove artwork from sale, remove the Artwork instead");

        /* Remove the last element in the business array */
        business[_code].pop();

        emit RemoveArtworkForSaleEvent(_code);

        return true;
    }

    /*
    *   The buyer can change the price
    *
    *   Requirements:
    * 
    *   - `_code` : the artwork code
    *   - `_price` : the new price
    * 
    *   Emits a {ChangeArtworkPriceEvent} event. 
    */
    function changeSalePrice(string memory _code, uint _price) 
                                public 
                                stringNotVoid(_code)
                                valueNotZero(_price, "The price cannot be zero")
                                artworkExists(_code) 
                                senderIsArtworkOwner(_code)
                                artworkIsForSale(_code)
                                returns(bool){

        uint last_index = business[_code].length -1 ;                
        /* Change the price in the business array */
        business[_code][last_index].price = _price;

        emit ChangeArtworkPriceEvent(_code, _price);

        return true;
    }

    /*
    *   The current Owner of the Artwork by code
    *
    *   Requirements
    *   - `_code` : the Artwork code    
    *   
    */
    function getCurrentOwner(string memory _code) 
                                public  
                                view            
                                stringNotVoid(_code)                    
                                artworkExists(_code) 
                                returns(address){

        return getLastBusiness(_code).owner;
    }

    /*
    *   Return the operation for the Artwork
    *
    *   Requirements
    * 
    *   - `_code` : the Artwork code
    */
    function getBusinessList(string memory _code) 
                            public 
                            view 
                            onlyOwner
                            stringNotVoid(_code)
                            artworkExists(_code) 
                            returns(Business[] memory){
        Business[] memory businessList = new Business[](business[_code].length);
        
        for(uint x=0; x<business[_code].length; x++){            
            businessList[x] = business[_code][x];            
        }
        return businessList;                
    }

    /* 
    *   Return the current contract balance 
    *
    *    Returns:
    *    1) Total amount of sold Artwork
    *    2) Total amount of direct sold Artwork
    *    3) Total amount of fee
    *    4) Current contract balance
    */
    function getBalance() 
                public 
                view
                onlyOwner 
                returns(uint, uint, uint, uint){

        return (totalSold, totalDirectSold, totalFeeSold, address(this).balance);
    }
    
    /*
    function getAddress() public view returns(address){
        return address(this);
    }
    */

    /* 
    *   Owner can withdraw Contract balance
    *
    *   Requirements:
    *     
    *   - `_amount` : amount to withdraw
    */
    function withdraw(uint _amount) 
                        public 
                        payable 
                        onlyOwner 
                        valueNotZero(_amount, "The amount of the withdraw is required") {        
                
        uint balance = address(this).balance;
        require(balance > 0, "#balance-zero# The balance is zero");
        require(_amount <= balance, "#amount-exceed-balance# - The amount cannot exceed the balance");
        
        Address.sendValue(payable(owner()), _amount);        
    }

    /********************
        Private functions
    *********************/
    /*
    *   Return the last operation on the specified Artwork
    *
    *   Requirements:
    * 
    *   - `_code` :    the code of the artwork
    * 
    */
    function getLastBusiness(string memory _code) 
                                public 
                                view                                                                
                                returns(Business memory){
        uint lastIndex = business[_code].length - 1;
        return business[_code][lastIndex];
    }

    function enumOperationToString(en_Operation operation) private pure returns(string memory){                
        if(operation == en_Operation.ForSale) return "ForSale";
        if(operation == en_Operation.Enter) return "Enter";
        if(operation == en_Operation.Purchase) return "Purchase";
        return "";
    }




    /**********************
        Functions modifiers 
    ***********************/ 
    modifier artworkNotExists(string memory _code) {                
        require(artworks[_code].exists == false, string.concat("#artwork-not-exist# - The Artwork ", _code, " exists"));
        _;
    }

    modifier artworkExists(string memory _code) {                
        require(artworks[_code].exists, string.concat("#artwork-exist# - The Artwork ", _code, " does not exists"));
        _;
    }

    modifier senderIsArtworkOwner(string memory _code) {                
        Business memory lastBusiness = getLastBusiness(_code);        
        require(lastBusiness.owner == msg.sender, string.concat("#current-owner# - You are not the current artwork ", _code, " owner"));
        _;
    }

    modifier senderIsNotArtworkOwner(string memory _code) {                
        Business memory lastBusiness = getLastBusiness(_code);   
        require(lastBusiness.owner != msg.sender, string.concat("#not-current-owner# - You are the current artwork ", _code, " owner"));
        _;
    }

    modifier artworkIsForSale(string memory _code) {                
        Business memory lastBusiness = getLastBusiness(_code);        
        require(lastBusiness.operation == en_Operation.Enter || 
                lastBusiness.operation == en_Operation.ForSale, 
                string.concat("#for-sale# - The artwork ", _code, " is not for sale"));
        _;
    }

    modifier artworkIsNotForSale(string memory _code) {                
        Business memory lastBusiness = getLastBusiness(_code);        
        require(lastBusiness.operation == en_Operation.Purchase, string.concat("#not-for-sale# - The artwork ", _code, " is for sale"));
        _;
    }

    modifier stringNotVoid(string memory _code) {
        require(bytes(_code).length != 0, "#code-empty# - The code is required");
        _;
    }

    modifier valueNotZero(uint _value, string memory _message) {        
        require(_value > 0, string.concat("#value-zero# - ", _message));
        _;
    }




}