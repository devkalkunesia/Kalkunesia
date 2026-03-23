import { getAuthClient } from './supabase';

export interface HistoryRecord {
  id: string;
  user_id: string;
  tool_id: string;
  tool_name: string;
  label: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  created_at: string;
}

export interface SaveHistoryParams {
  userId: string;
  toolId: string;
  toolName: string;
  label: string;
  inputs: Record<string, unknown>;
  result: Record<string, unknown>;
  token: string;
}

// Simpan history baru
export async function saveHistory(params: SaveHistoryParams): Promise<{ error: string | null }> {
  const client = getAuthClient(params.token);
  const { error } = await client
    .from('calculation_history')
    .insert({
      user_id: params.userId,
      tool_id: params.toolId,
      tool_name: params.toolName,
      label: params.label,
      inputs: params.inputs,
      result: params.result,
    });
  return { error: error?.message ?? null };
}

// Ambil semua history user
export async function getHistory(userId: string, token: string): Promise<{ data: HistoryRecord[]; error: string | null }> {
  const client = getAuthClient(token);
  const { data, error } = await client
    .from('calculation_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100);
  return { data: (data as HistoryRecord[]) ?? [], error: error?.message ?? null };
}

// Ambil history by tool
export async function getHistoryByTool(userId: string, toolId: string, token: string): Promise<{ data: HistoryRecord[]; error: string | null }> {
  const client = getAuthClient(token);
  const { data, error } = await client
    .from('calculation_history')
    .select('*')
    .eq('user_id', userId)
    .eq('tool_id', toolId)
    .order('created_at', { ascending: false })
    .limit(50);
  return { data: (data as HistoryRecord[]) ?? [], error: error?.message ?? null };
}

// Hapus history by id
export async function deleteHistory(id: string, token: string): Promise<{ error: string | null }> {
  const client = getAuthClient(token);
  const { error } = await client
    .from('calculation_history')
    .delete()
    .eq('id', id);
  return { error: error?.message ?? null };
}

// Build URL untuk prefill tool dari history record
export function buildToolUrl(record: HistoryRecord): string {
  const params = new URLSearchParams();
  Object.entries(record.inputs).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.set(key, String(value));
    }
  });
  return `/tools/${record.tool_id}?${params.toString()}`;
}
