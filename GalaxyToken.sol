// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*
    GalaxyToken (GLX)
    ------------------
    Theme: Space Exploration Rewards Token

    - ERC-20 token used to reward "explorers" for completing missions.
    - The contract owner represents the Mission Control.
    - Mission Control can reward explorers with GLX using rewardExplorer().
    - Any holder can transfer GLX or burn some of their tokens as "spent fuel".
*/

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract GalaxyToken is ERC20, Ownable {
    // Initial total supply = 1,000,000 GLX
    uint256 private constant INITIAL_SUPPLY = 1_000_000 * 10 ** 18;

    constructor() ERC20("GalaxyToken", "GLX") Ownable(msg.sender) {
        // Mint full supply to the contract deployer (Mission Control)
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    /**
     * @dev Reward an explorer with new GLX tokens.
     * Only the owner (Mission Control) can call this.
     * @param explorer Address of the explorer receiving tokens
     * @param amount Amount of GLX to mint (in whole tokens)
     */
    function rewardExplorer(address explorer, uint256 amount) external onlyOwner {
        require(explorer != address(0), "Invalid explorer address");
        // amount is in whole tokens, multiply by 10^18 to get smallest unit
        uint256 scaledAmount = amount * 10 ** 18;
        _mint(explorer, scaledAmount);
    }

    /**
     * @dev Burn tokens from the caller's balance ("spend fuel").
     * @param amount Amount of GLX to burn (in whole tokens)
     */
    function burn(uint256 amount) external {
        uint256 scaledAmount = amount * 10 ** 18;
        _burn(msg.sender, scaledAmount);
    }

    /**
     * @dev Helper function to get holder balance in whole GLX tokens.
     * Frontend can also use balanceOf() and format with decimals.
     */
    function balanceInWholeTokens(address account) external view returns (uint256) {
        return balanceOf(account) / (10 ** 18);
    }
}
