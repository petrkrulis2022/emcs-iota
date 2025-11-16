import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';

interface VerificationData {
  arc: string;
  consignor: string;
  consignee: string;
  goodsType: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  transactionId: string;
  createdAt: string;
  status: string;
}

interface VerificationResult {
  success: boolean;
  transactionDigest?: string;
  error?: string;
  blockchainData?: any;
  databaseData?: VerificationData;
  matches?: {
    arc: boolean;
    consignor: boolean;
    consignee: boolean;
    goodsType: boolean;
    quantity: boolean;
  };
}

export const useOfficerVerification = () => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const verifyConsignment = async (arc: string): Promise<VerificationResult> => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      if (!currentAccount) {
        throw new Error('No wallet connected - officer must connect wallet');
      }

      // Step 1: Prepare verification data from backend
      const prepareResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/consignments/${arc}/verify-prepare`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ officerAddress: currentAccount.address }),
        }
      );

      if (!prepareResponse.ok) {
        const error = await prepareResponse.json();
        throw new Error(error.error || 'Failed to prepare verification');
      }

      const { data: verificationData } = await prepareResponse.json();

      // Step 2: Create verification transaction
      // This transaction records the verification action on-chain
      const tx = new Transaction();
      
      // Add verification metadata as a transaction input
      // In production, this would call a smart contract verification function
      tx.setSender(currentAccount.address);
      
      // For now, we'll use a simple transfer to demonstrate the transaction
      // In production, replace with actual smart contract call:
      // tx.moveCall({
      //   target: `${PACKAGE_ID}::consignment_enhanced::verify_consignment`,
      //   arguments: [tx.pure.string(arc), tx.pure.address(currentAccount.address)],
      // });

      console.log('📝 Executing verification transaction for ARC:', arc);
      console.log('👮 Officer address:', currentAccount.address);

      // Step 3: Sign and execute the verification transaction
      const result = await signAndExecuteTransaction({
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log('✅ Verification transaction executed:', result.digest);

      // Step 4: Fetch blockchain data and compare with database
      const verifyResponse = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/consignments/${arc}/verify`
      );

      if (!verifyResponse.ok) {
        throw new Error('Failed to fetch blockchain verification data');
      }

      const verifyData = await verifyResponse.json();
      console.log('📊 Verification data received:', verifyData);

      // Extract data from API response (could be wrapped in .data or direct)
      const actualData = verifyData.data || verifyData;

      // Step 5: Build verification result
      const verificationResult: VerificationResult = {
        success: true,
        transactionDigest: result.digest,
        blockchainData: actualData.blockchain_data,
        databaseData: verificationData,
        matches: actualData.verification_details ? {
          arc: actualData.verification_details.arc_match,
          consignor: actualData.verification_details.consignor_match,
          consignee: actualData.verification_details.consignee_match,
          goodsType: actualData.verification_details.goods_type_match,
          quantity: actualData.verification_details.quantity_match,
        } : undefined,
      };

      console.log('✅ Verification result built:', verificationResult);

      setVerificationResult(verificationResult);
      setIsVerifying(false);
      return verificationResult;

    } catch (error: any) {
      console.error('❌ Verification failed:', error);
      const errorResult: VerificationResult = {
        success: false,
        error: error.message || 'Verification failed',
      };
      setVerificationResult(errorResult);
      setIsVerifying(false);
      return errorResult;
    }
  };

  return {
    verifyConsignment,
    isVerifying,
    verificationResult,
    isOfficerConnected: !!currentAccount,
    officerAddress: currentAccount?.address,
  };
};
