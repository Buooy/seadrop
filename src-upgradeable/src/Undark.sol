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
//  ============================================================================

/**
 * @title Undark
 * @author Aaron Lee (0xbuooy.eth)
 * @notice This contract uses ERC721SeaDrop, an ERC721A token contract that is compatible with SeaDrop
 */
contract Undark is ERC721SeaDropUpgradeable {
    mapping(uint256 => uint256) public tokenStakeStatus; // token id => timestamp

    //  ============================================================
    //  Events
    //  ============================================================
    // ERC-5753
    event Lock(address indexed unlocker, uint256 indexed id);
    event Unlock(uint256 indexed id);

    /**
     * @notice Initialize the token contract with its name, symbol,
     *         administrator, and allowed SeaDrop addresses.
     */
    function initialize(
        string memory name,
        string memory symbol,
        address[] memory allowedSeaDrop
    ) external initializer initializerERC721A {
        ERC721SeaDropUpgradeable.__ERC721SeaDrop_init(
            name,
            symbol,
            allowedSeaDrop
        );
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
}
