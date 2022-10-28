# Art Gallery smart contract


> We simulate an art gallery that sells its works of art<br>
> Customers can put the purchased works of art on sale and in case of sale the art gallery retains the fees<br>



## Struct<br>

>Artwork<br>
>Business<br>



## Storage data
`mapping(string => Artwork)`<br>
The mapping Artwork is the list of ArtWorks, the mapping key is the ArtWork code<br>
`mapping(string => Business[])`<br>
The mapping Business[] is a list for every artwork with the operations performed on the artwork, <br>
the last element of the array contains the current Owner address and <br>
the current status, if for sale or purchased <br>




## Events

<b>`AddArtworkEvent`</b>(string code, uint price); => Triggered when a new Art Work is added to the smart contract<br>
<b>`RemoveArtworkEvent`</b>(string code); => Triggered when Owner remove Art Work<br>
<b>`PutArtworkForSaleEvent`</b>(string code, uint price); => Triggered when Owner (Customer) put the Art Work for sale<br>
<b>`RemoveArtworkForSaleEvent`</b>(string code); => Triggered when Owner (Customer) remove the Art Work from sale<br>
<b>`BuyEvent`</b>(string code, uint price, address from); => Triggered when Art Work is sold<br>
<b>`SendPaymentEvent`</b>(string code, uint price, address to); => Triggered when Smart Contract send amount to the Art Work Owner (Customer)<br>
<b>`ChangeArtworkPriceEvent`</b>(string code, uint price); => Triggered when Owner change Art Work price<br>



## Public functions<br>

<b>`addArtwork`</b>(string calldata _code, uint _price, uint _percFee, uint256 id) <br>
The Contract owner insert the Artworks<br>
@ _code:    the unique code of the Artwork<br>
@ _price:   the price of the Artwork<br>
@ _percFee: the fee applied when a client resells the Artwork<br>


<br>

<b>`removeArtwork`</b>(string calldata _code) <br>
The Contract owner remove the Artworks, only if the Contract owner is the artwork owner<br>
@ _code:    the unique code of the Artwork<br>

<br>

<b>`buyArtwork`</b>(string memory _code) <br>
Buy a product, the product must be for sale<br>
If the Owner is a Customer the Smart Contract send the amount to the Owner and withholds the fees<br> 
@ _code: the product code you want buy

<br>

<b>`putForSale`</b>(string memory _code, uint _price) <br>
The ArtWork Customer can put the product for sale<br>
@ _code: the product code, the sender must be the current owner<br>
@ _price:    the sale price<br>


<br>

<b>`removeFromSale`</b>(string memory _code) <br>
The ArtWork Customer can remove the artwork for sale<br>
@ _code: the artwork code, the sender must be the current owner<br>

<br>


<b>`changeSalePrice`</b>(string memory _code, uint _price) <br>
The ArtWork Customer can change the price<br>
@ _code: the artwork code, the sender must be the current owner<br>
@ _price: the new price

<br>

<b>`getCurrentOwner`</b>(string memory _code) <br>
The current Owner of the Artwork by code<br>
@ _code: the Artwork code<br>


<br>

<b>`getMovementList`</b>(string memory _code) <br>
Return the list of movements for the Artwork<br>
@ _code: the Artwork code<br>

<br>



<b>`getBalance`</b>
Return the current contract balance <br>
returns:<br>
1) Total amount of sold Artwork<br>
2) Total amount of direct sold Artwork<br>
3) Total amount of fee<br>
4) Current contract balance<br>

<br>

<b>`withdraw`</b>(address payable _to, uint _amount) <br>
Owner can withdraw balance<br>
@ _to: address to send the money to<br>
@ _amount: amount to withdraw<br>


<br>

## Modifiers<br>

<b>`artworkNotExists`</b>(string memory _code)<br>

<b>`artworkExists`</b>(string memory _code)<br>

<b>`senderIsArtworkOwner`</b>(string memory _code)<br>

<b>`senderIsNotArtworkOwner`</b>(string memory _code)<br>

<b>`artworkIsForSale`</b>(string memory _code) <br>

<b>`artworkIsNotForSale`</b>(string memory _code)<br>

<b>`stringNotVoid`</b>(string memory _code)<br>

<b>`valueNotZero`</b>(uint _value, string memory _message)<br>
