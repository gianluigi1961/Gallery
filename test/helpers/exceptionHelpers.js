const PREFIX = "Returned error: VM Exception while processing transaction: ";

async function tryCatch(promise, message) {
    try {        
        await promise;        
    }
    catch (error) {
        if(error.message.indexOf(message) != -1){
            console.log("Test passed: " + message)
            return true;
        }else{
            console.log(error.message)
        }
    }
    console.log("Test fail: " + message)    
    return false;
};

module.exports = {
    onlyOwner              : async function(promise) {return await tryCatch(promise, "caller is not the owner" );},
    isEmptyCode            : async function(promise) {return await tryCatch(promise, "#code-empty#" );},
    artworkExist           : async function(promise) {return await tryCatch(promise, "#artwork-exist#" );},
    artworkNotExist        : async function(promise) {return await tryCatch(promise, "#artwork-not-exist#" );},
    
    notCurrentOwner        : async function(promise) {return await tryCatch(promise, "#not-current-owner#" );},
    currentOwner           : async function(promise) {return await tryCatch(promise, "#current-owner#" );},
    notForSale             : async function(promise) {return await tryCatch(promise, "#not-for-sale#" );},
    forSale                : async function(promise) {return await tryCatch(promise, "#for-sale#" );},
    valueZero              : async function(promise) {return await tryCatch(promise, "#value-zero#" );},
    ownerCannotRemove      : async function(promise) {return await tryCatch(promise, "#cannot-remove#" );},
    validPrice             : async function(promise) {return await tryCatch(promise, "#valid-price#" );},

    amountExceedBalance             : async function(promise) {return await tryCatch(promise, "#amount-exceed-balance#" );},
    balanceZero             : async function(promise) {return await tryCatch(promise, "#balance-zero#" );},

    

/*
    catchRevert            : async function(promise) {await tryCatch(promise, "revert"             );},
    catchOutOfGas          : async function(promise) {await tryCatch(promise, "out of gas"         );},
    catchInvalidJump       : async function(promise) {await tryCatch(promise, "invalid JUMP"       );},
    catchInvalidOpcode     : async function(promise) {await tryCatch(promise, "invalid opcode"     );},
    catchStackOverflow     : async function(promise) {await tryCatch(promise, "stack overflow"     );},
    catchStackUnderflow    : async function(promise) {await tryCatch(promise, "stack underflow"    );},
    catchStaticStateChange : async function(promise) {await tryCatch(promise, "static state change");},
    */
};