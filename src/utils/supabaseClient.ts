/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Supabase Client & Adapter Engine for ÍrisClin
 * Ensures zero interference with "Manutenção Di Casa" tables using prefix mapping.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Prefix table mapping to prevent database collision with other systems in the same Supabase project
const TABLE_PREFIX_MAP: Record<string, string> = {
  'perfis': 'iris_perfis',
  'consultas_chamados': 'iris_consultas_chamados',
  'mensagens_chat': 'iris_mensagens_chat',
  'transacoes_caixa': 'iris_transacoes_caixa',
  'patient_documents': 'iris_patient_documents',
  'patient_ocr': 'iris_patient_ocr',
  'patient_update_history': 'iris_patient_update_history',
  'patient_ai_summary': 'iris_patient_ai_summary'
};

// Local Cache Fallback class mimicking essential Supabase queries
class SupabaseLocalFallback {
  private getTableData(table: string): any[] {
    try {
      const saved = localStorage.getItem(`supabase_fallback_${table}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  }

  private saveTableData(table: string, data: any[]) {
    try {
      localStorage.setItem(`supabase_fallback_${table}`, JSON.stringify(data));
    } catch (e) {}
  }

  public from(table: string) {
    const tableData = this.getTableData(table);

    return {
      select: (columns: string = '*') => {
        return {
          eq: (field: string, value: any) => {
            const filtered = tableData.filter(item => item[field] === value);
            return Promise.resolve({ data: filtered, error: null });
          },
          order: (field: string, { ascending = true } = {}) => {
            const sorted = [...tableData].sort((a, b) => {
              if (a[field] < b[field]) return ascending ? -1 : 1;
              if (a[field] > b[field]) return ascending ? 1 : -1;
              return 0;
            });
            return Promise.resolve({ data: sorted, error: null });
          },
          then: (resolve: any) => {
            resolve({ data: tableData, error: null });
          }
        };
      },
      insert: (rows: any | any[]) => {
        const rowsArray = Array.isArray(rows) ? rows : [rows];
        const newRows = rowsArray.map(r => ({
          id: r.id || `local_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          created_at: new Date().toISOString(),
          ...r
        }));
        const updated = [...newRows, ...tableData];
        this.saveTableData(table, updated);
        return Promise.resolve({ data: newRows, error: null });
      },
      update: (values: any) => {
        return {
          eq: (field: string, value: any) => {
            const updated = tableData.map(item => {
              if (item[field] === value) {
                return { ...item, ...values, updated_at: new Date().toISOString() };
              }
              return item;
            });
            this.saveTableData(table, updated);
            const affected = updated.filter(item => item[field] === value);
            return Promise.resolve({ data: affected, error: null });
          }
        };
      },
      delete: () => {
        return {
          eq: (field: string, value: any) => {
            const filtered = tableData.filter(item => item[field] !== value);
            this.saveTableData(table, filtered);
            return Promise.resolve({ data: { message: 'Deleted' }, error: null });
          }
        };
      }
    };
  }
}

// Supabase client wrapper to map query calls transparently to prefixed tables in production database
class SupabaseWrapper {
  private client: any;

  constructor(client: any) {
    this.client = client;
  }

  public from(table: string) {
    // Map table name to prefixed version to prevent collision in cloud DB
    const mappedTable = TABLE_PREFIX_MAP[table] || table;
    return this.client.from(mappedTable);
  }

  public get auth() {
    return this.client.auth;
  }

  public get storage() {
    return this.client.storage;
  }
}

// Export active Supabase instance, or resilient fallback for local/preview modes
const rawClient = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;
export const supabase = rawClient ? (new SupabaseWrapper(rawClient) as any) : (new SupabaseLocalFallback() as any);

export default supabase;
