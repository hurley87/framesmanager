//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract Frames is Ownable {

    struct Frame {
        uint256 frameId;
        string text;
        address erc20Address;
        uint256 totalSupply;
        uint256 rewardAmount;
        uint timestamp;
        address creator;
    }

    struct Reward {
        uint256 rewardId;
        uint256 frameId;
        address receiver;
        uint256 amount;
        uint timestamp;
    }

    Frame[] public frames;
    Reward[] public rewards;
    mapping(uint256 => uint[]) public frameRewards;

    event FrameCreated(uint256 frameId, string text, uint256 totalSupply, uint256 rewardAmount, uint timestamp, address creator);
    event RewardClaimed(uint256 rewardId, uint256 frameId, address receiver, uint256 amount, uint timestamp);

    constructor(address ownerAddress) Ownable(ownerAddress) {}

    function createFrame(string memory text, uint256 totalSupply, uint256 rewardAmount, address erc20Address) public {
        Frame memory frame = Frame(frames.length, text, erc20Address, totalSupply, rewardAmount, block.timestamp, msg.sender);
        frames.push(frame);

        IERC20 erc20 = IERC20(erc20Address);
        require(erc20.allowance(msg.sender, address(this)) >= totalSupply, "Not enough allowance");
        erc20.transferFrom(msg.sender, address(this), totalSupply);

        emit FrameCreated(frame.frameId, frame.text, frame.totalSupply, frame.rewardAmount, frame.timestamp, frame.creator);
    }

    function getFrame(uint256 frameId) public view returns (Frame memory) {
        return frames[frameId];
    }

    function getFrameRewardIds(uint256 frameId) public view returns (uint[] memory) {
        return frameRewards[frameId];
    }

    function getReward(uint256 rewardId) public view returns (Reward memory) {
        return rewards[rewardId];
    }

    function getFrameRewardCount(uint256 frameId) public view returns (uint) {
        return frameRewards[frameId].length;
    }

    function getFrameCount() public view returns (uint) {
        return frames.length;
    }

    function getRewardCount() public view returns (uint) {
        return rewards.length;
    }

    function claimReward(uint256 frameId) public {
        Frame memory frame = frames[frameId];
        require(frame.totalSupply > 0, "Frame does not exist");
        require(frame.totalSupply > frame.rewardAmount, "All rewards claimed");

        Reward memory reward = Reward(rewards.length, frameId, msg.sender, frame.rewardAmount, block.timestamp);
        rewards.push(reward);
        frameRewards[frameId].push(reward.rewardId);

        IERC20 erc20 = IERC20(frame.erc20Address);
        erc20.transfer(msg.sender, frame.rewardAmount);

        frames[frameId].totalSupply -= frame.rewardAmount;

        emit RewardClaimed(reward.rewardId, reward.frameId, reward.receiver, reward.amount, reward.timestamp);
    }

}
