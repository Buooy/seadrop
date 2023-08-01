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
 * @title Undark
 * @author Aaron Lee (0xbuooy.eth)
 * @notice This contract uses ERC721SeaDrop, an ERC721A token contract that is compatible with SeaDrop
 */
contract Undark is ERC721SeaDropUpgradeable {
    address financeWallet;
    uint256 maxMintQuantity = 10;
    bool directMintEnabled = false;
    mapping(uint256 => uint256) public tokenStakeStatus; // token id => timestamp

    //  ============================================================
    //  Modifiers
    //  ============================================================
    modifier isNotStaked(uint256 _tokenId) {
        require(tokenStakeStatus[_tokenId] == 0, "Token is Staked");
        _;
    }

    modifier isDirectMintEnabled() {
        require(directMintEnabled, "Direct Mint is Disabled");
        _;
    }

    //  ============================================================
    //  Events
    //  ============================================================
    /// @notice Emit opensea compatible notification of token staking
    /// @dev ERC-5753
    event Lock(address indexed unlocker, uint256 indexed id);
    event Unlock(uint256 indexed id);

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
        _updateFinanceWallet(financeWalletAddress);
    }

    //  ============================================================
    //  Staking / Vesting
    //  ============================================================
    /// @param _tokenIds array of token ids to stake
    /// @param _stakedAt array of uint of the stakedAt time
    function updateStaking(
        uint256[] calldata _tokenIds,
        uint256[] calldata _stakedAt
    ) external onlyOwner {
        for (uint256 i; i < _tokenIds.length; i++) {
            if (_stakedAt[i] > 0) {
                tokenStakeStatus[_tokenIds[i]] = _stakedAt[i];
            } else if (tokenStakeStatus[_tokenIds[i]] > 0) {
                delete tokenStakeStatus[_tokenIds[i]];
            }
        }
    }

    /// @dev stake a token
    /// @param _tokenIds array of token ids to stake
    function stake(uint256[] calldata _tokenIds) external {
        for (uint256 i; i < _tokenIds.length; ) {
            require(ownerOf(_tokenIds[i]) == msg.sender, "Not Token Owner");

            // Prevents the token staking if it is already staked
            require(tokenStakeStatus[_tokenIds[i]] == 0, "Already Staked");

            tokenStakeStatus[_tokenIds[i]] = block.timestamp;
            emit Lock(msg.sender, _tokenIds[i]);

            unchecked {
                i++;
            }
        }
    }

    /// @dev get all token staked statuses
    function getAllStaked()
        external
        view
        returns (uint256[] memory _stakedStatus)
    {
        uint256[] memory stakedStatuses = new uint256[](totalSupply() + 1);
        for (uint256 i; i <= totalSupply(); ) {
            stakedStatuses[i] = tokenStakeStatus[i];

            unchecked {
                i++;
            }
        }
        return stakedStatuses;
    }

    /// @dev get total stake count
    function getTotalStaked() external view onlyOwner returns (uint256 _total) {
        uint256 total;
        for (uint256 i; i < totalSupply(); ) {
            if (tokenStakeStatus[i] > 0) {
                total++;
            }
            unchecked {
                i++;
            }
        }
        return total;
    }

    /// @dev get all token staked statuses
    /// @param _tokens array of tokens to check
    function getUsersStaked(
        uint256[] calldata _tokens
    ) external view returns (uint256[] memory _stakedStatus) {
        uint256[] memory stakedStatuses = new uint256[](_tokens.length);
        for (uint256 i; i < _tokens.length; ) {
            address tokenOwner = ownerOf(_tokens[i]);
            require(
                tokenOwner == msg.sender || owner() == msg.sender,
                "Not Token Owner"
            );
            stakedStatuses[i] = tokenStakeStatus[_tokens[i]];

            unchecked {
                i++;
            }
        }
        return stakedStatuses;
    }

    /// @dev unstake a token
    /// @param _tokenIds array of token ids to unstake
    function unstake(uint256[] calldata _tokenIds) external payable {
        for (uint256 i; i < _tokenIds.length; ) {
            require(ownerOf(_tokenIds[i]) == msg.sender, "Not Token Owner");

            // Prevents the token staking if it is already staked
            require(tokenStakeStatus[_tokenIds[i]] > 0, "Not Staked");

            delete tokenStakeStatus[_tokenIds[i]];

            emit Unlock(_tokenIds[i]);

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
    function toggleDirectMint(bool _enabled) external onlyOwner {
        _toggleDirectMint(_enabled);
    }

    /// @dev internal function to toggle direct mint
    /// @param _enabled bool to enable or disable direct mint
    function _toggleDirectMint(bool _enabled) internal {
        directMintEnabled = _enabled;
    }

    /// @dev update max mint quantity
    /// @param newMaxMintQuantity new max mint quantity
    function updateMaxMintQuantity(
        uint256 newMaxMintQuantity
    ) external onlyOwner {
        _updateMaxMintQuantity(newMaxMintQuantity);
    }

    /// @dev internal function to update max mint quantity
    /// @param newMaxMintQuantity new max mint quantity
    function _updateMaxMintQuantity(uint256 newMaxMintQuantity) internal {
        maxMintQuantity = newMaxMintQuantity;
    }

    /// @dev mint multiple tokens
    /// @param quantity quantity of token to mint
    /// @param delegateAddress address to mint to
    function mint(
        uint256 quantity,
        address delegateAddress
    ) external payable isDirectMintEnabled {
        _mint(delegateAddress, quantity);
        require(_totalMinted() <= totalSupply(), "Exceed Total Supply");
    }

    // ============================================================
    // Finance Management
    // ============================================================
    function updateFinanceWallet(address walletAddress) external onlyOwner {
        _updateFinanceWallet(walletAddress);
    }

    function _updateFinanceWallet(address walletAddress) internal {
        financeWallet = walletAddress;
    }

    function withdraw() external onlyOwner {
        (bool os, ) = payable(financeWallet).call{
            value: address(this).balance
        }("");
        require(os, "Withdraw not successful");
    }

    // ============================================================
    // Transfer Functionality
    // ============================================================
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyAllowedOperator(from) isNotStaked(tokenId) {
        super.safeTransferFrom(from, to, tokenId);
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override onlyAllowedOperator(from) isNotStaked(tokenId) {
        super.safeTransferFrom(from, to, tokenId, data);
    }

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override onlyAllowedOperator(from) isNotStaked(tokenId) {
        super.transferFrom(from, to, tokenId);
    }
}
