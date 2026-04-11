import { getDb } from '../client';

export interface Grammar {
  id: string;
  title: string;
  description: string;
  example: string;
  explanation: string;
}

export const grammarRepo = {
  async getAll(): Promise<Grammar[]> {
    const db = await getDb();
    return await db.getAllAsync<Grammar>('SELECT * FROM grammar');
  },

  async getById(id: string): Promise<Grammar | null> {
    const db = await getDb();
    return await db.getFirstAsync<Grammar>('SELECT * FROM grammar WHERE id = ?', [id]);
  }
};
