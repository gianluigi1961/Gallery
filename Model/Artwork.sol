// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Business.sol";

/*
*   
*/
struct Artwork {        
    /*
    *   The fees that the contract retains for each sale
    */
    uint percFee;

    /*
    *   Need to understand if an Artwork exixts
    */
    bool exists;      
}