const ArtGallery = artifacts.require("ArtGallery");

contract('Test Deploy', (accounts) => {
    const deployAccount = accounts[0];

    let artGallery = null
    before(async () => {
        artGallery = await ArtGallery.deployed()
    })

    it('Should deploy smart contract properly', async () => {
        assert(artGallery.address != '', "The contract is not deployed")
    })

    it('Should set ownership correctly to deployer account', async () => {
        const owner = await artGallery.owner()
        assert(owner === deployAccount, "The owner is not the right address")
    })
})