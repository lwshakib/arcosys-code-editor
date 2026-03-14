import { Embeddings } from '@langchain/core/embeddings';
import * as env from '@/lib/env';
import { BGE_M3_EMBEDDING_BATCH_SIZE } from '@/lib/constants';

/**
 * Custom wrapper for Cloudflare Workers AI BGE-M3 Embeddings.
 * BGE-M3 is a Multi-Functionality, Multi-Linguality, and Multi-Granularity model.
 * It produces embeddings with 1024 dimensions.
 */
class CloudflareBgeM3Embeddings extends Embeddings {
  apiKey: string;
  workerUrl: string;

  /**
   * @param fields - Optional API key and worker URL overrides.
   */
  constructor(fields?: { apiKey?: string; workerUrl?: string }) {
    super({});
    this.apiKey = fields?.apiKey || env.CLOUDFLARE_API_KEY || '';
    this.workerUrl = fields?.workerUrl || env.BGE_M3_WORKER_URL || '';

    if (!this.apiKey) {
      throw new Error('CLOUDFLARE_API_KEY is not set');
    }
    if (!this.workerUrl) {
      throw new Error('BGE_M3_WORKER_URL is not set');
    }
  }

  /**
   * Generates embeddings for an array of document strings.
   * Automatically batches requests to comply with worker limits.
   *
   * @param documents - Array of text strings to embed.
   * @returns A promise resolving to an array of coordinate arrays (embeddings).
   */
  async embedDocuments(documents: string[]): Promise<number[][]> {
    const batchSize = BGE_M3_EMBEDDING_BATCH_SIZE;
    const results: number[][] = [];

    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchResult = await this._embedBatch(batch);
      results.push(...batchResult);
    }

    return results;
  }

  /**
   * Internal helper to send a single batch of documents to the Cloudflare worker.
   */
  private async _embedBatch(documents: string[]): Promise<number[][]> {
    try {
      const response = await fetch(this.workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text: documents,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare Worker Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      // The worker returns { data: number[][], shape: [n, 1024], ... }
      if (!result.data || !Array.isArray(result.data)) {
        throw new Error('Invalid response format from embedding worker');
      }

      return result.data;
    } catch (error) {
      console.error('Error in _embedBatch:', error);
      throw error;
    }
  }

  /**
   * Generates an embedding for a single search query or document.
   */
  async embedQuery(document: string): Promise<number[]> {
    try {
      const response = await fetch(this.workerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          text: [document],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Cloudflare Worker Error (${response.status}): ${errorText}`);
      }

      const result = await response.json();

      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        throw new Error('Invalid response format from embedding worker');
      }

      return result.data[0];
    } catch (error) {
      console.error('Error in embedQuery:', error);
      throw error;
    }
  }
}

/**
 * Factory function to get an embeddings client.
 * BGE-M3 default dimensionality is 1024.
 */
export const getEmbeddings = (taskType?: any, dimensionality?: number) =>
  new CloudflareBgeM3Embeddings();

/**
 * Simple helper to generate embedding for a single string.
 */
export const generateEmbeddings = async (text: string, taskType?: any) => {
  const embeddings = getEmbeddings();
  return await embeddings.embedQuery(text);
};

/**
 * Simple helper to generate embeddings for a list of strings in batch.
 */
export const generateBatchEmbeddings = async (texts: string[], taskType?: any) => {
  const embeddings = getEmbeddings();
  return await embeddings.embedDocuments(texts);
};
