//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Airdrop is ERC20 {
    error AirdropLimitExceeded();

    uint256 public constant AIRDROP_AMOUNT = 100 * 10 ** 18;
    uint256 public constant AIRDROP_LIMIT_COUNT = 20;

    event Airdrop(address indexed to, uint256 amount);

    mapping(address => uint256) public airdropReceivedCount;

    constructor() ERC20("Airdrop Token", "ADT") {}

    function airdrop() public {
        address sender = _msgSender();

        if (airdropReceivedCount[sender] >= AIRDROP_LIMIT_COUNT) {
            revert AirdropLimitExceeded();
        }

        airdropReceivedCount[sender] += 1;
        _mint(sender, AIRDROP_AMOUNT);

        emit Airdrop(sender, AIRDROP_AMOUNT);
    }
}
