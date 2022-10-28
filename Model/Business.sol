// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Enum.sol";

/*
*   Defines the list of purchase or sale transactions
*   The smart Contract create a new Business element every time 
*   the owner changes the state of the artwork and evry time it is sold
*/
struct Business {
    /*
    *   The current Owner of the Artwork (to remove in future)
    */
    address from;

    /*
    *   The new Owner of the Artwork
    */
    address to;

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