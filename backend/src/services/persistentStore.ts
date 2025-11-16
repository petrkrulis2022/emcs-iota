import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { Consignment, MovementEvent } from '../types/index.js';

const DATA_DIR = join(process.cwd(), 'data');
const CONSIGNMENTS_FILE = join(DATA_DIR, 'consignments.json');
const EVENTS_FILE = join(DATA_DIR, 'events.json');

/**
 * Persistent storage for consignments and events
 * Data is saved to JSON files and survives server restarts
 */
class PersistentStore {
  private consignments: Map<string, Consignment>;
  private events: Map<string, MovementEvent[]>;

  constructor() {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
      console.log('📁 Created data directory:', DATA_DIR);
    }

    // Load existing data or initialize empty
    this.consignments = this.loadConsignments();
    this.events = this.loadEvents();

    console.log(`✅ Loaded ${this.consignments.size} consignments from persistent storage`);
    console.log(`✅ Loaded ${this.events.size} event records from persistent storage`);
  }

  /**
   * Load consignments from file
   */
  private loadConsignments(): Map<string, Consignment> {
    try {
      if (existsSync(CONSIGNMENTS_FILE)) {
        const data = readFileSync(CONSIGNMENTS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('⚠️  Error loading consignments from file:', error);
    }
    return new Map();
  }

  /**
   * Load events from file
   */
  private loadEvents(): Map<string, MovementEvent[]> {
    try {
      if (existsSync(EVENTS_FILE)) {
        const data = readFileSync(EVENTS_FILE, 'utf-8');
        const parsed = JSON.parse(data);
        return new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('⚠️  Error loading events from file:', error);
    }
    return new Map();
  }

  /**
   * Save consignments to file
   */
  private saveConsignments(): void {
    try {
      const data = Object.fromEntries(this.consignments);
      writeFileSync(CONSIGNMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving consignments to file:', error);
    }
  }

  /**
   * Save events to file
   */
  private saveEvents(): void {
    try {
      const data = Object.fromEntries(this.events);
      writeFileSync(EVENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
      console.error('❌ Error saving events to file:', error);
    }
  }

  // Consignment operations
  getConsignment(arc: string): Consignment | undefined {
    return this.consignments.get(arc);
  }

  getAllConsignments(): Consignment[] {
    return Array.from(this.consignments.values());
  }

  getConsignmentsByOperator(operatorAddress: string): Consignment[] {
    return this.getAllConsignments().filter(
      c => c.consignor.toLowerCase() === operatorAddress.toLowerCase()
    );
  }

  setConsignment(arc: string, consignment: Consignment): void {
    this.consignments.set(arc, consignment);
    this.saveConsignments();
  }

  deleteConsignment(arc: string): boolean {
    const deleted = this.consignments.delete(arc);
    if (deleted) {
      this.saveConsignments();
    }
    return deleted;
  }

  // Event operations
  getEvents(arc: string): MovementEvent[] {
    return this.events.get(arc) || [];
  }

  addEvent(arc: string, event: MovementEvent): void {
    const existingEvents = this.events.get(arc) || [];
    existingEvents.push(event);
    this.events.set(arc, existingEvents);
    this.saveEvents();
  }

  setEvents(arc: string, events: MovementEvent[]): void {
    this.events.set(arc, events);
    this.saveEvents();
  }

  // Utility methods
  hasConsignment(arc: string): boolean {
    return this.consignments.has(arc);
  }

  clear(): void {
    this.consignments.clear();
    this.events.clear();
    this.saveConsignments();
    this.saveEvents();
    console.log('🗑️  Cleared all persistent data');
  }

  getStats(): { consignments: number; events: number } {
    return {
      consignments: this.consignments.size,
      events: this.events.size,
    };
  }
}

// Export singleton instance
export const persistentStore = new PersistentStore();
