'use client';

import { SessionProvider } from 'next-auth/react';
import { Session } from 'next-auth';
import { ReactNode, createContext, useContext, useState, useEffect, useCallback } from 'react';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  setCurrentWorkspace: (workspace: Workspace) => void;
  isLoading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  currentWorkspace: null,
  workspaces: [],
  setCurrentWorkspace: () => {},
  isLoading: true,
});

export function useWorkspace() {
  return useContext(WorkspaceContext);
}

function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const createDefaultWorkspace = useCallback(async (): Promise<Workspace | null> => {
    try {
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Workspace' }),
      });
      if (response.ok) {
        const data = await response.json();
        return data.workspace;
      }
    } catch (error) {
      console.error('Failed to create default workspace:', error);
    }
    return null;
  }, []);

  const fetchWorkspaces = useCallback(async () => {
    try {
      const response = await fetch('/api/workspaces');
      if (response.ok) {
        const data = await response.json();
        let workspaceList = data.workspaces || [];

        // ワークスペースがない場合は自動作成
        if (workspaceList.length === 0) {
          const newWorkspace = await createDefaultWorkspace();
          if (newWorkspace) {
            workspaceList = [newWorkspace];
          }
        }

        setWorkspaces(workspaceList);

        const savedWorkspaceId = typeof window !== 'undefined'
          ? localStorage.getItem('currentWorkspaceId')
          : null;
        const savedWorkspace = workspaceList.find((w: Workspace) => w.id === savedWorkspaceId);

        if (savedWorkspace) {
          setCurrentWorkspaceState(savedWorkspace);
        } else if (workspaceList.length > 0) {
          setCurrentWorkspaceState(workspaceList[0]);
          if (typeof window !== 'undefined') {
            localStorage.setItem('currentWorkspaceId', workspaceList[0].id);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    } finally {
      setIsLoading(false);
    }
  }, [createDefaultWorkspace]);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const setCurrentWorkspace = useCallback((workspace: Workspace) => {
    setCurrentWorkspaceState(workspace);
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentWorkspaceId', workspace.id);
    }
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        currentWorkspace,
        workspaces,
        setCurrentWorkspace,
        isLoading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

interface DashboardProvidersProps {
  children: ReactNode;
  session: Session | null;
}

export function DashboardProviders({ children, session }: DashboardProvidersProps) {
  return (
    <SessionProvider session={session}>
      <WorkspaceProvider>
        {children}
      </WorkspaceProvider>
    </SessionProvider>
  );
}
