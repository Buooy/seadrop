import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'
import { expect } from 'chai'
import { baseContract } from './__fixtures__'

describe('Token (General)', function () {
  it('deploys', async () => {
    const { nft } = await loadFixture(baseContract)
    expect(nft.address).to.not.be.null
  })
})
