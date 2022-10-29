

module.exports = {
    showBusinessList : async () =>{
        return false;
    },
    test_data : async (promise) => {
            var data = [
                {code : 'artwork-1', price:'500000000000000000', fee:12 },
                {code : 'artwork-2', price:'600000000000000000', fee:12 },
                {code : 'artwork-3', price:'700000000000000000', fee:15 },
                {code : 'artwork-4', price:'800000000000000000', fee:20 },
            ]

         return data;
        },
    }

 