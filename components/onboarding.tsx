'use client';
import { usePrivy, useExperimentalFarcasterSigner } from '@privy-io/react-auth';
import CreateFrame from './create';

function Onboarding() {
  const { user, ready, login } = usePrivy();
  const { requestFarcasterSigner } = useExperimentalFarcasterSigner();

  const farcasterAccount = user?.linkedAccounts.find(
    (account) => account.type === 'farcaster'
  );

  const hasFarcasterSigner = user?.linkedAccounts?.find(
    (account) => account.type === 'farcaster' && account.signerPublicKey
  );

  if (!ready) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <button onClick={login}>Connect Farcaster Account</button>;
  }

  if (farcasterAccount && !hasFarcasterSigner) {
    return (
      <div>
        <button onClick={requestFarcasterSigner}>
          Authorize my Farcaster signer
        </button>
      </div>
    );
  }

  return <CreateFrame />;
}

export default Onboarding;
