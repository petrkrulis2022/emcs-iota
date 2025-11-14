import crypto from 'crypto';
import { iotaService } from './iotaService.js';
import { AppError } from '../middleware/errorHandler.js';

export interface NotarizationResult {
  documentHash: string;
  transactionId: string;
  timestamp: string;
}

export class NotarizationService {
  /**
   * Notarize a document by hashing it and anchoring the hash to IOTA blockchain
   */
  async notarizeDocument(document: any): Promise<NotarizationResult> {
    try {
      console.log('📄 Starting document notarization...');

      // Step 1: Serialize document to JSON
      const documentJson = this.serializeDocument(document);
      console.log('✅ Document serialized');

      // Step 2: Compute SHA256 hash
      const documentHash = this.computeSHA256(documentJson);
      console.log(`✅ Document hash computed: ${documentHash}`);

      // Step 3: Anchor hash to IOTA blockchain
      const transactionId = await this.anchorToBlockchain(documentHash);
      console.log(`✅ Hash anchored to blockchain: ${transactionId}`);

      const result: NotarizationResult = {
        documentHash,
        transactionId,
        timestamp: new Date().toISOString(),
      };

      console.log('✅ Document notarization complete');
      return result;
    } catch (error) {
      console.error('❌ Document notarization failed:', error);
      throw new AppError(
        `Failed to notarize document: ${(error as Error).message}`,
        500
      );
    }
  }

  /**
   * Serialize document object to canonical JSON string
   */
  private serializeDocument(document: any): string {
    try {
      // Sort keys for consistent hashing
      const sortedDocument = this.sortObjectKeys(document);
      return JSON.stringify(sortedDocument);
    } catch (error) {
      throw new Error(`Failed to serialize document: ${(error as Error).message}`);
    }
  }

  /**
   * Recursively sort object keys for consistent serialization
   */
  private sortObjectKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: any = {};
    Object.keys(obj)
      .sort()
      .forEach(key => {
        sorted[key] = this.sortObjectKeys(obj[key]);
      });

    return sorted;
  }

  /**
   * Compute SHA256 hash of a string
   */
  private computeSHA256(data: string): string {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return '0x' + hash.digest('hex');
  }

  /**
   * Anchor document hash to IOTA blockchain
   */
  private async anchorToBlockchain(documentHash: string): Promise<string> {
    try {
      // Create a transaction that stores the hash in metadata
      const transactionId = await iotaService.executeTransaction(
        (tx: any) => {
          // TODO: Implement actual Move call to store hash
          // tx.moveCall({
          //   target: `${contractAddress}::notarization::anchor_hash`,
          //   arguments: [tx.pure(documentHash)],
          // });
        },
        '' // Signer address (will be provided by wallet)
      );

      return transactionId;
    } catch (error) {
      console.error('Failed to anchor hash to blockchain:', error);
      throw new Error('IOTA node unavailable or transaction failed');
    }
  }

  /**
   * Verify a document against its stored hash
   */
  async verifyDocument(document: any, expectedHash: string): Promise<boolean> {
    try {
      const documentJson = this.serializeDocument(document);
      const actualHash = this.computeSHA256(documentJson);
      
      const isValid = actualHash === expectedHash;
      
      if (isValid) {
        console.log('✅ Document verification successful');
      } else {
        console.log('❌ Document verification failed - hash mismatch');
      }
      
      return isValid;
    } catch (error) {
      console.error('❌ Document verification error:', error);
      return false;
    }
  }

  /**
   * Create e-AD document object for notarization
   */
  createEADDocument(consignment: {
    arc: string;
    consignor: string;
    consignee: string;
    goodsType: string;
    quantity: number;
    unit: string;
    origin: string;
    destination: string;
  }): any {
    return {
      documentType: 'e-AD',
      version: '1.0',
      arc: consignment.arc,
      consignor: consignment.consignor,
      consignee: consignment.consignee,
      goods: {
        type: consignment.goodsType,
        quantity: consignment.quantity,
        unit: consignment.unit,
      },
      movement: {
        origin: consignment.origin,
        destination: consignment.destination,
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get hash from transaction ID (for verification)
   */
  async getHashFromTransaction(transactionId: string): Promise<string | null> {
    try {
      // TODO: Implement fetching hash from transaction metadata
      // const tx = await iotaService.getTransaction(transactionId);
      // return tx.metadata.documentHash;
      
      return null;
    } catch (error) {
      console.error('Failed to get hash from transaction:', error);
      return null;
    }
  }
}

// Export singleton instance
export const notarizationService = new NotarizationService();
