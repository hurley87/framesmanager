'use client';

import { chain } from '@/constants/chain';
import { createPublicClient, formatEther, http, parseEther } from 'viem';
import Frames from '@/hooks/abis/Frames.json';
import { useEffect, useState } from 'react';

export default function Frame({ params }: { params: { uid: string } }) {
  const frameId = params.uid;
  const publicClient = createPublicClient({
    chain,
    transport: http(),
  });
  const [frame, setFrame] = useState<any>();

  useEffect(() => {
    const getFrame = async () => {
      const framesContract = process.env
        .NEXT_PUBLIC_FRAMES_CONTRACT as `0x${string}`;
      const result = await publicClient.readContract({
        address: framesContract,
        abi: Frames.abi,
        functionName: 'getFrame',
        args: [frameId.toString()],
      });
      console.log('frame', result);
    };
    getFrame();
  }, [frameId]);

  return <div>frame {frameId}</div>;
}
