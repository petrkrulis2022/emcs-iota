import { IotaClient } from '@iota/iota-sdk/client';
import { Ed25519Keypair } from '@iota/iota-sdk/keypairs/ed25519';
import { Transaction } from '@iota/iota-sdk/transactions';
import crypto from 'crypto';
import { bech32 } from 'bech32';

// Environment variables
const IOTA_RPC_URL = process.env.IOTA_RPC_URL || 'https://api.testnet.iota.cafe:443';
const CONTRACT_PACKAGE_ID = process.env.CONTRACT_PACKAGE_ID || '';
const OPERATOR_REGISTRY_ID = process.env.OPERATOR_REGISTRY_ID || '';

// IOTA client instance
const client = new IotaClient({ url: IOTA_RPC_URL });

export interface ConsignmentData {
  arc: string;
  consignor: string;
  consignee: string;
  goods_type: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  metadata?: Record<string, any>;
}

export interface BlockchainConsignment {
  id: string;
  arc: string;
  consignor: string;
  consignee: string;
  goods_type: string;
  quantity: number;
  unit: string;
  origin: string;
  destination: string;
  status: number;
  document_hash?: string;
  created_at: number;
  dispatched_at?: number;
  received_at?: number;
  metadata?: string;
}

export interface VerificationResult {
  verified: boolean;
  blockchain_data: BlockchainConsignment;
  database_data: any;
  verification_details: {
    arc_match: boolean;
    consignor_match: boolean;
    consignee_match: boolean;
    goods_type_match: boolean;
    quantity_match: boolean;
    document_hash_match: boolean;
  };
}

/**
 * BlockchainService - Handles all interactions with IOTA blockchain smart contracts
 */
export class BlockchainService {
  private client: IotaClient;
  private packageId: string;
  private registryId: string;

  constructor() {
    this.client = client;
    this.packageId = CONTRACT_PACKAGE_ID;
    this.registryId = OPERATOR_REGISTRY_ID;

    if (!this.packageId) {
      console.warn('⚠️  CONTRACT_PACKAGE_ID not set - blockchain operations will fail');
    }
  }

  /**
   * Generate SHA256 hash of document data
   */
  private generateDocumentHash(data: any): Buffer {
    const documentString = JSON.stringify(data);
    return crypto.createHash('sha256').update(documentString).digest();
  }

  /**
   * Convert bech32 private key to Ed25519 keypair
   */
  private decodePrivateKey(bech32Key: string): Ed25519Keypair {
    const { words } = bech32.decode(bech32Key);
    const privateKeyBytes = Buffer.from(bech32.fromWords(words));
    
    // The first byte is the key scheme flag (0 for Ed25519)
    const secretKey = privateKeyBytes.slice(1);
    
    // Create Ed25519Keypair from secret key
    return Ed25519Keypair.fromSecretKey(secretKey);
  }

  /**
   * Create a new consignment NFT on the blockchain
   * 
   * @param data - Consignment data
   * @param signerPrivateKey - Consignor's private key (bech32 format)
   * @returns Transaction digest and consignment object ID
   */
  async createConsignment(
    data: ConsignmentData,
    signerPrivateKey: string
  ): Promise<{ digest: string; consignmentId: string }> {
    try {
      // Decode private key
      const privateKeyBytes = this.decodePrivateKey(signerPrivateKey);
      
      // Create transaction
      const tx = new Transaction();
      
      // Call create_consignment function
      tx.moveCall({
        target: `${this.packageId}::consignment_enhanced::create_consignment`,
        arguments: [
          tx.pure.string(data.arc),
          tx.pure.address(data.consignee),
          tx.pure.string(data.goods_type),
          tx.pure.u64(data.quantity),
          tx.pure.string(data.unit),
          tx.pure.string(data.origin),
          tx.pure.string(data.destination),
          tx.pure.string(data.metadata ? JSON.stringify(data.metadata) : ''),
          tx.object('0x6'), // Clock object
        ],
      });

      // Sign and execute
      const result = await this.client.signAndExecuteTransaction({
        signer: privateKeyBytes,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // Extract consignment object ID from created objects
      const consignmentId = result.objectChanges?.find(
        (change: any) => change.type === 'created' && change.objectType && change.objectType.includes('Consignment')
      )?.objectId || '';

      return {
        digest: result.digest,
        consignmentId,
      };
    } catch (error) {
      console.error('❌ Error creating consignment on blockchain:', error);
      throw new Error(`Blockchain creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Dispatch consignment (Draft → In Transit) with document notarization
   * 
   * @param consignmentId - On-chain consignment object ID
   * @param documentData - Data to hash and notarize
   * @param signerPrivateKey - Consignor's private key
   * @returns Transaction digest and notarization record ID
   */
  async dispatchConsignment(
    consignmentId: string,
    documentData: any,
    signerPrivateKey: string
  ): Promise<{ digest: string; notarizationId: string }> {
    try {
      // Generate document hash
      const documentHash = this.generateDocumentHash(documentData);
      
      // Decode private key
      const privateKeyBytes = this.decodePrivateKey(signerPrivateKey);
      
      // Create transaction
      const tx = new Transaction();
      
      // Call dispatch_consignment function
      tx.moveCall({
        target: `${this.packageId}::consignment_enhanced::dispatch_consignment`,
        arguments: [
          tx.object(consignmentId),
          tx.pure(new Uint8Array(documentHash)), // 32-byte Uint8Array
          tx.pure.string('e-AD'),
          tx.object('0x6'), // Clock object
        ],
      });

      // Sign and execute
      const result = await this.client.signAndExecuteTransaction({
        signer: privateKeyBytes,
        transaction: tx,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      // Extract notarization record ID
      const notarizationId = result.objectChanges?.find(
        (change: any) => change.type === 'created' && change.objectType && change.objectType.includes('NotarizationRecord')
      )?.objectId || '';

      return {
        digest: result.digest,
        notarizationId,
      };
    } catch (error) {
      console.error('❌ Error dispatching consignment on blockchain:', error);
      throw new Error(`Blockchain dispatch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Receive consignment (In Transit → Received)
   * 
   * @param consignmentId - On-chain consignment object ID
   * @param signerPrivateKey - Consignee's private key
   * @returns Transaction digest
   */
  async receiveConsignment(
    consignmentId: string,
    signerPrivateKey: string
  ): Promise<{ digest: string }> {
    try {
      // Decode private key
      const privateKeyBytes = this.decodePrivateKey(signerPrivateKey);
      
      // Create transaction
      const tx = new Transaction();
      
      // Call receive_consignment function
      tx.moveCall({
        target: `${this.packageId}::consignment_enhanced::receive_consignment`,
        arguments: [
          tx.object(consignmentId),
          tx.object('0x6'), // Clock object
        ],
      });

      // Sign and execute
      const result = await this.client.signAndExecuteTransaction({
        signer: privateKeyBytes,
        transaction: tx,
        options: {
          showEffects: true,
        },
      });

      return {
        digest: result.digest,
      };
    } catch (error) {
      console.error('❌ Error receiving consignment on blockchain:', error);
      throw new Error(`Blockchain receive failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cancel consignment (Draft → Cancelled)
   * 
   * @param consignmentId - On-chain consignment object ID
   * @param reason - Cancellation reason
   * @param signerPrivateKey - Consignor's private key
   * @returns Transaction digest
   */
  async cancelConsignment(
    consignmentId: string,
    reason: string,
    signerPrivateKey: string
  ): Promise<{ digest: string }> {
    try {
      // Decode private key
      const privateKeyBytes = this.decodePrivateKey(signerPrivateKey);
      
      // Create transaction
      const tx = new Transaction();
      
      // Call cancel_consignment function
      tx.moveCall({
        target: `${this.packageId}::consignment_enhanced::cancel_consignment`,
        arguments: [
          tx.object(consignmentId),
          tx.pure.string(reason),
          tx.object('0x6'), // Clock object
        ],
      });

      // Sign and execute
      const result = await this.client.signAndExecuteTransaction({
        signer: privateKeyBytes,
        transaction: tx,
        options: {
          showEffects: true,
        },
      });

      return {
        digest: result.digest,
      };
    } catch (error) {
      console.error('❌ Error cancelling consignment on blockchain:', error);
      throw new Error(`Blockchain cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get consignment data from blockchain
   * 
   * @param consignmentId - On-chain consignment object ID
   * @returns Consignment data from blockchain
   */
  async getConsignment(consignmentId: string): Promise<BlockchainConsignment> {
    try {
      const object = await this.client.getObject({
        id: consignmentId,
        options: {
          showContent: true,
          showOwner: true,
        },
      });

      if (!object.data || !object.data.content || object.data.content.dataType !== 'moveObject') {
        throw new Error('Invalid object data');
      }

      const fields = object.data.content.fields as any;

      // Parse document hash if present
      let documentHash: string | undefined;
      if (fields.document_hash && Array.isArray(fields.document_hash)) {
        const hashBuffer = Buffer.from(fields.document_hash);
        documentHash = '0x' + hashBuffer.toString('hex');
      }

      return {
        id: consignmentId,
        arc: fields.arc,
        consignor: fields.consignor,
        consignee: fields.consignee,
        goods_type: fields.goods_type,
        quantity: parseInt(fields.quantity),
        unit: fields.unit,
        origin: fields.origin,
        destination: fields.destination,
        status: parseInt(fields.status),
        document_hash: documentHash,
        created_at: parseInt(fields.created_at),
        dispatched_at: fields.dispatched_at ? parseInt(fields.dispatched_at) : undefined,
        received_at: fields.received_at ? parseInt(fields.received_at) : undefined,
        metadata: fields.metadata,
      };
    } catch (error) {
      console.error('❌ Error fetching consignment from blockchain:', error);
      throw new Error(`Blockchain query failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verify consignment data against blockchain
   * Compare database data with on-chain data for customs verification
   * 
   * @param consignmentId - On-chain consignment object ID
   * @param databaseData - Data from EMCS database
   * @returns Verification result with comparison details
   */
  async verifyConsignment(
    consignmentId: string,
    databaseData: any
  ): Promise<VerificationResult> {
    try {
      // Get blockchain data
      const blockchainData = await this.getConsignment(consignmentId);

      // Compare all fields
      const verification = {
        arc_match: blockchainData.arc === databaseData.arc,
        consignor_match: blockchainData.consignor.toLowerCase() === databaseData.consignor?.toLowerCase(),
        consignee_match: blockchainData.consignee.toLowerCase() === databaseData.consignee?.toLowerCase(),
        goods_type_match: blockchainData.goods_type === databaseData.goods_type,
        quantity_match: blockchainData.quantity === databaseData.quantity,
        document_hash_match: !blockchainData.document_hash || blockchainData.document_hash === databaseData.document_hash,
      };

      // All checks must pass
      const verified = Object.values(verification).every(v => v === true);

      return {
        verified,
        blockchain_data: blockchainData,
        database_data: databaseData,
        verification_details: verification,
      };
    } catch (error) {
      console.error('❌ Error verifying consignment:', error);
      throw new Error(`Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if an operator is authorized in the registry
   * 
   * @param operatorAddress - Address to check
   * @returns True if operator is authorized
   */
  async isOperatorAuthorized(operatorAddress: string): Promise<boolean> {
    try {
      // This would use a devInspectTransactionBlock call to is_authorized function
      // For now, return true as a placeholder
      console.log(`Checking authorization for operator: ${operatorAddress}`);
      return true;
    } catch (error) {
      console.error('❌ Error checking operator authorization:', error);
      return false;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
