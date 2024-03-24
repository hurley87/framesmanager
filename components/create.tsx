'use client';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useState } from 'react';
import useWalletClient from '@/hooks/useWalletClient';
import Frames from '@/hooks/abis/Frames.json';
import ERC20 from '@/hooks/abis/ERC20.json';
import { chain } from '@/constants/chain';
import { createPublicClient, formatEther, http, parseEther } from 'viem';
import { useRouter } from 'next/navigation';

function CreateFrame() {
  const { user } = usePrivy();
  const [creatingHand, setCreatingHand] = useState(false);
  const framesContract = process.env
    .NEXT_PUBLIC_FRAMES_CONTRACT as `0x${string}`;
  const { wallets } = useWallets();
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const address = user?.wallet?.address as `0x${string}`;
  const wallet = wallets.filter((wallet) => wallet?.address === address)[0];
  const walletClient = useWalletClient({ chain, wallet });
  const [text, setText] = useState('');
  const [erc20Address, setErc20Address] = useState('');
  const [totalSupply, setTotalSupply] = useState(0);
  const [rewardAmount, setRewardAmount] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [getApproval, setGetApproval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const router = useRouter();

  publicClient.watchContractEvent({
    address: framesContract,
    abi: Frames.abi,
    eventName: 'FrameCreated',
    onLogs: (logs: any) => {
      const { frameId } = logs[0].args;
      console.log('Frame created', frameId);
      router.push(`/frame/${frameId}`);
    },
  });

  const handleCreateFrame = async () => {
    if (!walletClient) {
      alert('No wallet connected');
      return;
    }

    const client = await walletClient;
    const account = wallet?.address as `0x${string}`;

    console.log('account', account);

    setCreatingHand(true);

    try {
      const { request } = await publicClient.simulateContract({
        address: framesContract,
        abi: Frames.abi,
        functionName: 'createFrame',
        args: [
          text,
          parseEther(totalSupply.toString()),
          parseEther(rewardAmount.toString()),
          erc20Address,
        ],
        account,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });
    } catch (e) {
      console.error(e);
      setCreatingHand(false);
      return;
    }
  };

  const approveTokenAllowance = async () => {
    setIsApproving(true);
    const client = await walletClient;
    const abi = ERC20.abi;
    const address = erc20Address as `0x${string}`;
    const account = wallet?.address as `0x${string}`;

    try {
      const { request } = await publicClient.simulateContract({
        address,
        abi,
        functionName: 'approve',
        args: [framesContract, parseEther(totalSupply.toString())],
        account,
      });

      const hash = (await client?.writeContract(
        request as any
      )) as `0x${string}`;

      await publicClient.waitForTransactionReceipt({
        hash,
      });

      console.log('hash', hash);

      setGetApproval(false);
      setIsApproving(false);
    } catch (e) {
      console.log(e);
      setIsApproving(false);
    }
  };

  const checkApproval = async () => {
    if (!walletClient) {
      alert('No wallet connected');
      return;
    }
    const account = wallet?.address as `0x${string}`;
    const address = erc20Address as `0x${string}`;

    console.log('account', account);

    if (rewardAmount === 0) {
      alert('Reward amount cannot be zero');
      return;
    }

    if (totalSupply === 0) {
      alert('Total supply cannot be zero');
      return;
    }

    if (rewardAmount > totalSupply) {
      alert('Reward amount cannot be more than total supply');
      return;
    }

    console.log('Checking approval', account, address, framesContract);

    try {
      const tokenBalance = (await publicClient.readContract({
        address,
        abi: ERC20.abi,
        functionName: 'balanceOf',
        args: [account],
      })) as bigint;

      console.log('tokenBalance', tokenBalance);

      console.log('Total supply', totalSupply);
      console.log('token balance', tokenBalance);

      if (Number(formatEther(tokenBalance)) < totalSupply) {
        alert('Not enough tokens to create frame');
        return;
      }

      //   TODO: check to see if they have enough balance to create the frame
      const tokenAllowance = (await publicClient.readContract({
        address,
        abi: ERC20.abi,
        functionName: 'allowance',
        args: [account, framesContract],
      })) as bigint;

      console.log('tokenAllowance', tokenAllowance);
      console.log('totalSupply', totalSupply);
      console.log('token allow formatted', Number(formatEther(tokenAllowance)));

      if (Number(formatEther(tokenAllowance)) < totalSupply) {
        setGetApproval(true);
        alert('Not enough token allowance');
        return;
      }

      console.log('tokenAllowance', tokenAllowance);
    } catch (e) {
      console.error(e);
      alert('Not a valid ERC20 token');
    }

    try {
      //   TODO: check to see if they have enough balance to create the frame
      //   console.log('Allowance', allowance);
      //   setIsApproved(allowance > 0);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <h1>Create frame</h1>

      {!isApproved && (
        <div>
          <div>
            <p>ERC 20 Token</p>
            <input
              value={erc20Address}
              onChange={(e) => setErc20Address(e.target.value)}
              placeholder="ERC20 Address"
            />
          </div>
          <div>
            <p>Total Supply</p>
            <input
              type="number"
              value={totalSupply}
              onChange={(e) => setTotalSupply(Number(e.target.value))}
            />
          </div>

          <div>
            <p>Reward amunt</p>
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(Number(e.target.value))}
              placeholder="Reward Amount"
            />
          </div>

          {getApproval ? (
            <button disabled={isApproving} onClick={approveTokenAllowance}>
              Get Approval
            </button>
          ) : (
            <button disabled={isApproved} onClick={checkApproval}>
              Check isApproved
            </button>
          )}
        </div>
      )}

      {!isApproved && !getApproval && (
        <div>
          <p>Text</p>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text"
          />
          <button disabled={creatingHand} onClick={handleCreateFrame}>
            {creatingHand ? 'Creating...' : 'Create Frame'}
          </button>
        </div>
      )}

      {isApproved && (
        <div>
          <p>Text</p>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Text"
          />
          <button disabled={creatingHand} onClick={handleCreateFrame}>
            {creatingHand ? 'Creating...' : 'Create Frame'}
          </button>
        </div>
      )}
    </div>
  );
}

export default CreateFrame;
