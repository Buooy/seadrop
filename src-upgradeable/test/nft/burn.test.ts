import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { mintedContract } from './__fixtures__'

describe('Token (Staking)', function () {
  it('allows multiple tokens to be burnt', async () => {
    const { nft } = await loadFixture(mintedContract)
    const currentSupply = await nft.totalSupply()
    await nft.batchBurn([1, 2, 3, 4, 5])
    expect(await nft.totalSupply()).to.equal(currentSupply - 5)
  })
  it('prevents burning tokens not owned', async () => {
    const { nft } = await loadFixture(mintedContract)
    await expect(nft.batchBurn([1, 6])).to.be.revertedWithCustomError(
      nft,
      'TransferCallerNotOwnerNorApproved',
    )
  })
})
