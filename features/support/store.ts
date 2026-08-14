import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { commonServer } from '@/features/support/server';
import type { Bootstrap } from '@/lib/common-server';

// 부팅 조회는 앱 실행당 1회. 실패해도 앱을 막지 않는다 — 게이트는 성공 응답에만 적용 (ARCHITECTURE §5.2)
interface BootState {
  boot: Bootstrap | null;
  fetched: boolean;
  fetchOnce: () => void;
}

export const useBootStore = create<BootState>()((set, get) => ({
  boot: null,
  fetched: false,
  fetchOnce: () => {
    if (get().fetched) return;
    set({ fetched: true });
    void commonServer.fetchBootstrap().then((r) => {
      if (r.ok) set({ boot: r.data });
    });
  },
}));

// 공지 읽음은 앱 로컬 — 서버에 읽음 테이블을 두지 않는다 (common 규약)
interface NoticeReadState {
  readIds: string[];
  markRead: (ids: string[]) => void;
}

export const useNoticeReadStore = create<NoticeReadState>()(
  persist(
    (set) => ({
      readIds: [],
      markRead: (ids) =>
        set((s) => ({ readIds: Array.from(new Set([...s.readIds, ...ids])).slice(-200) })),
    }),
    { name: 'linkmemo-notice-read', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export function useUnreadNoticeCount(): number {
  const boot = useBootStore((s) => s.boot);
  const readIds = useNoticeReadStore((s) => s.readIds);
  if (!boot) return 0;
  return boot.announcements.filter((a) => !readIds.includes(a.id)).length;
}
