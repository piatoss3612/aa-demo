//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Airdrop} from "../src/ERC20Airdrop.sol";

contract ERC20AirdropScript is Script {
    ERC20Airdrop public airdrop;

    function run() public {
        vm.broadcast();
        airdrop = new ERC20Airdrop();

        console.log("Airdrop token deployed at address: ", address(airdrop));
    }
}
