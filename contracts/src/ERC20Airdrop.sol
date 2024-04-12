//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Airdrop is ERC20 {
    error AirdropAlreadyRecieved();

    uint256 public constant AIRDROP_AMOUNT = 100 * 10 ** 18;

    event Airdrop(address indexed to, uint256 amount);

    mapping(address => bool) public airdropRecieved;

    constructor() ERC20("Airdrop Token", "ADT") {}

    function airdrop() public {
        address sender = _msgSender();

        if (airdropRecieved[sender]) {
            revert AirdropAlreadyRecieved();
        }

        airdropRecieved[sender] = true;
        _mint(sender, AIRDROP_AMOUNT);

        emit Airdrop(sender, AIRDROP_AMOUNT);
    }
}
