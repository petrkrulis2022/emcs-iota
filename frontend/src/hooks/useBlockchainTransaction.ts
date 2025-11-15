import { useSignAndExecuteTransaction, useIotaClient } from '@iota/dapp-kit';
import { Transaction } from '@iota/iota-sdk/transactions';

export interface ConsignmentData {
  arc: string;
  consignee: string;
  goodsType: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  beerName?: string;
  alcoholPercentage?: number;
}

export function useBlockchainTransaction() {
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  const client = useIotaClient();

  const createConsignment = async (data: ConsignmentData): Promise<{
    digest: string;
    consignmentId: string;
  }> => {
    // Get contract addresses from environment
    const packageId = import.meta.env.VITE_CONTRACT_PACKAGE_ID || 
      '0x942fd017cb9ac11bb9d4efa537cae3cd47b7fcf2254a3f135455310fc52f4de6';

    // Create transaction
    const tx = new Transaction();

    // Call create_consignment function on the blockchain
    tx.moveCall({
      target: `${packageId}::consignment_enhanced::create_consignment`,
      arguments: [
        tx.pure.string(data.arc),
        tx.pure.address(data.consignee),
        tx.pure.string(data.goodsType),
        tx.pure.u64(data.quantity),
        tx.pure.string(data.unit),
        tx.pure.string(data.origin),
        tx.pure.string(data.destination),
        tx.pure.string(
          JSON.stringify({
            beerName: data.beerName || '',
            alcoholPercentage: data.alcoholPercentage || 0,
          })
        ),
        tx.object('0x6'), // Clock object
      ],
    });

    // Sign and execute transaction with user's wallet
    // This will trigger the wallet popup for approval
    const result = await signAndExecuteTransaction({
      transaction: tx,
    });

    // Get transaction details to extract created objects
    const txDetails = await client.waitForTransaction({
      digest: result.digest,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    // Extract consignment object ID from created objects
    const createdObject = txDetails.objectChanges?.find(
      (change: any) => change.type === 'created'
    );
    
    const consignmentId = (createdObject as any)?.objectId || '';

    return {
      digest: result.digest,
      consignmentId,
    };
  };

  return {
    createConsignment,
  };
}
