import { http } from '@/api/http'
import { httpErrorHandle } from '@/utils'
import { RequestHttpEnum } from '@/enums/httpEnum'

// Get current user's workspaces
export const fetchWorkspacesApi = async () => {
  try {
    // axios baseURL is '/api/goview', so this becomes '/api/goview/account/workspaces'
    const res = await http(RequestHttpEnum.GET)('/account/workspaces')
    return res
  } catch {
    httpErrorHandle()
  }
}

// Create workspace
export const createWorkspaceApi = async (data: { name: string }) => {
  try {
    const res = await http(RequestHttpEnum.POST)('/account/workspaces', data)
    return res
  } catch {
    httpErrorHandle()
  }
}

// Create user and add to workspace
export const createWorkspaceUserApi = async (workspaceId: string, data: { username: string; nickname?: string }) => {
  try {
    const res = await http(RequestHttpEnum.POST)(`/account/workspaces/${workspaceId}/create-user`, data)
    return res
  } catch {
    httpErrorHandle()
  }
}

// Get members of a workspace
export const fetchWorkspaceMembersApi = async (workspaceId: string) => {
  try {
    const res = await http(RequestHttpEnum.GET)(`/account/workspaces/${workspaceId}/members`)
    return res
  } catch {
    httpErrorHandle()
  }
}

