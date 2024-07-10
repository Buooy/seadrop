// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import { ERC721SeaDropUpgradeable } from "./ERC721SeaDropUpgradeable.sol";

//  ============================================================================
//
//  $$\   $$\                   $$$$$$$\                      $$\
//  $$ |  $$ |                  $$  __$$\                     $$ |
//  $$ |  $$ |$$$$$$$\          $$ |  $$ | $$$$$$\   $$$$$$\  $$ |  $$\
//  $$ |  $$ |$$  __$$\ $$$$$$\ $$ |  $$ | \____$$\ $$  __$$\ $$ | $$  |
//  $$ |  $$ |$$ |  $$ |\______|$$ |  $$ | $$$$$$$ |$$ |  \__|$$$$$$  /
//  $$ |  $$ |$$ |  $$ |        $$ |  $$ |$$  __$$ |$$ |      $$  _$$<
//  \$$$$$$  |$$ |  $$ |        $$$$$$$  |\$$$$$$$ |$$ |      $$ | \$$\
//   \______/ \__|  \__|        \_______/  \_______|\__|      \__|  \__|
//
//  ┏┓•             ┓   •      ┓•  ┓    •       ┓ • ┓ ┓           ┓   ┓    ┓
//  ┃┃┓┏┓┏┓┏┓┏┓┏┓┏  ┣┓┏┓┓┏┓┏┓  ┃┓┏┓┣┓╋  ┓┏┓╋┏┓  ┣┓┓┏┫┏┫┏┓┏┓  ┏┓┏┓┏┫  ┏┫┏┓┏┓┃┏
//  ┣┛┗┗┛┛┗┗ ┗ ┛ ┛  ┗┛┛ ┗┛┗┗┫  ┗┗┗┫┛┗┗  ┗┛┗┗┗┛  ┛┗┗┗┻┗┻┗ ┛┗  ┗┻┛┗┗┻  ┗┻┗┻┛ ┛┗
//                          ┛     ┛
//    ┓                           ┓  ┓                      •
//  ┏┓┃┏┓┏┏┓┏  ┏┓┏┳┓┏┓┏┓┓┏┏┏┓┏┓┏┓┏┫  ┣┓┓┏  ┏┓  ┏┏┓┏┳┓┏┳┓┓┏┏┓┓╋┓┏
//  ┣┛┗┗┻┗┗ ┛  ┗ ┛┗┗┣┛┗┛┗┻┛┗ ┛ ┗ ┗┻  ┗┛┗┫  ┗┻  ┗┗┛┛┗┗┛┗┗┗┻┛┗┗┗┗┫
//  ┛               ┛                   ┛                      ┛
//  ============================================================================

/**
 * @title Expedition Rising by Un-Dark
 * @author Aaron Lee (0xbuooy.eth)
 * @notice This contract uses ERC721SeaDrop, an ERC721A token contract that is compatible with SeaDrop
 */
contract Undark is ERC721SeaDropUpgradeable {
    address public financeWallet;
    uint256 public maxMintQuantity;
    uint256 public mintPrice;
    bool public directMintEnabled;

    //  ============================================================
    //  Modifiers
    //  ============================================================
    modifier isDirectMintEnabled() {
        require(directMintEnabled, "Direct Mint is Disabled");
        _;
    }

    /**
     * @notice Initialize the token contract with its name, symbol,
     *         administrator, and allowed SeaDrop addresses.
     */
    function initialize(
        string memory name,
        string memory symbol,
        address financeWalletAddress,
        address[] memory allowedSeaDrop
    ) external initializer initializerERC721A {
        ERC721SeaDropUpgradeable.__ERC721SeaDrop_init(
            name,
            symbol,
            allowedSeaDrop
        );
        _setMintPrice(0.1 ether);
        _setMaxMintQuantity(10);
        _setDirectMint(false);
        _setFinanceWallet(financeWalletAddress);
    }

    //  ============================================================
    //  Burn
    //  ============================================================
    /// @dev burns a set of tokens
    /// @param _tokenIds array of token ids to burn
    function batchBurn(
        uint256[] calldata _tokenIds
    ) external {
        for (uint256 i; i < _tokenIds.length; ) {
            _burn(_tokenIds[i], true);
            unchecked {
                i++;
            }
        }
    }

    //  ============================================================
    //  Mint
    //  ============================================================
    /// @dev toggle direct mint
    /// @param _enabled bool to enable or disable direct mint
    function setDirectMint(bool _enabled) external onlyOwner {
        _setDirectMint(_enabled);
    }

    /// @dev internal function to toggle direct mint
    /// @param _enabled bool to enable or disable direct mint
    function _setDirectMint(bool _enabled) internal {
        directMintEnabled = _enabled;
    }

    /// @dev set mint price
    /// @param _mintPrice new mint price
    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        _setMintPrice(_mintPrice);
    }

    /// @dev internal function to set mint price
    /// @param _mintPrice new mint price
    function _setMintPrice(uint256 _mintPrice) internal {
        mintPrice = _mintPrice;
    }

    /// @dev update max mint quantity
    /// @param newMaxMintQuantity new max mint quantity
    function setMaxMintQuantity(uint256 newMaxMintQuantity) external onlyOwner {
        _setMaxMintQuantity(newMaxMintQuantity);
    }

    /// @dev internal function to update max mint quantity
    /// @param newMaxMintQuantity new max mint quantity
    function _setMaxMintQuantity(uint256 newMaxMintQuantity) internal {
        maxMintQuantity = newMaxMintQuantity;
    }

    /// @dev mint multiple tokens
    /// @param quantity quantity of token to mint
    /// @param delegateAddress address to mint to
    function mint(
        uint256 quantity,
        address delegateAddress
    ) external payable isDirectMintEnabled {
        require(msg.value == quantity * mintPrice, "Invalid ETH Amount");
        require(
            _totalMinted() + quantity <= maxSupply(),
            "Exceed Total Supply"
        );
        _mint(delegateAddress, quantity);
    }

    // ============================================================
    // Finance Management
    // ============================================================
    function setFinanceWallet(address walletAddress) external onlyOwner {
        _setFinanceWallet(walletAddress);
    }

    function _setFinanceWallet(address walletAddress) internal {
        financeWallet = walletAddress;
    }

    function withdraw() external onlyOwner {
        (bool os, ) = payable(financeWallet).call{
            value: address(this).balance
        }("");
        require(os, "Withdraw not successful");
    }
}
