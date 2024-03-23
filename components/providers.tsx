'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { chain } from '@/constants/chain';

function Providers({ children }: { children: React.ReactNode }) {
  const defaultChain = chain;
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID as string;

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: 'light',
          accentColor: '#676FFF',
        },
        defaultChain,
        loginMethods: ['farcaster'],
        // Create embedded wallets for users who don't have a wallet
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}

export default Providers;
