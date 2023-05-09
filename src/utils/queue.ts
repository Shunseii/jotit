import { type Note } from "@prisma/client";

export interface MutationQueueItem {
  apiCall: () => Promise<unknown>;
  optimisticUpdate: () => void;
  previousState: Note[];
}

export class MutationQueue {
  private queue: MutationQueueItem[] = [];
  private isProcessing = false;
  /**
   * State before the previous action was executed
   */
  private lastState: Note[] = [];

  /**
   * Enqueues a new mutation to the queue
   * @param item The mutation to enqueue
   */
  async enqueue(item: MutationQueueItem) {
    this.queue.push(item);

    this.lastState = item.previousState;

    // Perform the optimistic update
    item.optimisticUpdate();

    if (!this.isProcessing) {
      await this.processQueue();
    }
  }

  /**
   * Processes the queue by dequeueing and executing each item
   */
  async processQueue() {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const item = this.queue.shift() as MutationQueueItem;

      try {
        console.log("calling api");
        // Make the API call
        await item.apiCall();
      } catch (error) {
        console.log("clearing");
        this.clear();
      }
    }

    console.log(this.queue);

    this.isProcessing = false;
  }

  /**
   * Clear all the records in the queue.
   */
  private clear() {
    this.queue = [];
  }

  peek() {
    return this.queue[0];
  }

  get isProcessingRecords() {
    return this.isProcessing;
  }

  get previousState() {
    return this.lastState;
  }
}
