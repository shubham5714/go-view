package cn.com.v2.controller;

import cn.com.v2.common.base.BaseController;
import cn.com.v2.common.domain.AjaxResult;
import cn.com.v2.model.Account;
import cn.com.v2.model.Workspace;
import cn.com.v2.model.WorkspaceMembership;
import cn.com.v2.model.SysUser;
import cn.com.v2.service.IAccountService;
import cn.com.v2.service.ISubscriptionService;
import cn.com.v2.service.IWorkspaceMembershipService;
import cn.com.v2.service.IWorkspaceService;
import cn.com.v2.service.ISysUserService;
import cn.com.v2.util.SaTokenUtil;
import cn.hutool.core.date.DateUtil;
import cn.hutool.crypto.SecureUtil;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/goview/account")
public class WorkspaceController extends BaseController {

    @Autowired
    private IAccountService accountService;

    @Autowired
    private IWorkspaceService workspaceService;

    @Autowired
    private IWorkspaceMembershipService workspaceMembershipService;

    @Autowired
    private ISubscriptionService subscriptionService;

    @Autowired
    private ISysUserService sysUserService;

    @ApiOperation(value = "获取当前用户的工作空间列表", notes = "获取当前用户的工作空间列表")
    @GetMapping("/workspaces")
    @ResponseBody
    public AjaxResult listWorkspaces() {
        String userId = SaTokenUtil.getUserId();
        List<WorkspaceMembership> memberships = workspaceMembershipService.lambdaQuery()
                .eq(WorkspaceMembership::getUserId, userId)
                .list();
        List<Workspace> workspaces = new ArrayList<Workspace>();
        for (WorkspaceMembership membership : memberships) {
            Workspace ws = workspaceService.getById(membership.getWorkspaceId());
            if (ws != null) {
                workspaces.add(ws);
            }
        }
        return successData(200, workspaces);
    }

    @ApiOperation(value = "创建工作空间", notes = "创建工作空间")
    @PostMapping("/workspaces")
    @ResponseBody
    public AjaxResult createWorkspace(@RequestBody Workspace workspace) {
        String userId = SaTokenUtil.getUserId();
        Account account = accountService.getOrCreateAccountForUser(userId);
        subscriptionService.assertCanCreateWorkspace(account.getId());

        workspace.setAccountId(account.getId());
        workspace.setStatus("ACTIVE");
        workspace.setCreatedTime(DateUtil.formatLocalDateTime(LocalDateTime.now()));
        workspaceService.save(workspace);

        WorkspaceMembership membership = new WorkspaceMembership();
        membership.setWorkspaceId(workspace.getId());
        membership.setUserId(userId);
        membership.setRole("OWNER");
        membership.setCreatedTime(DateUtil.formatLocalDateTime(LocalDateTime.now()));
        workspaceMembershipService.save(membership);

        return successData(200, workspace);
    }

    @ApiOperation(value = "添加工作空间成员", notes = "添加工作空间成员")
    @PostMapping("/workspaces/{workspaceId}/members")
    @ResponseBody
    public AjaxResult addMember(@PathVariable("workspaceId") String workspaceId, @RequestBody WorkspaceMembership body) {
        String currentUserId = SaTokenUtil.getUserId();
        workspaceMembershipService.assertRoleAtLeast(workspaceId, currentUserId, "ADMIN");

        subscriptionService.assertCanAddMember(workspaceId);

        WorkspaceMembership membership = new WorkspaceMembership();
        membership.setWorkspaceId(workspaceId);
        membership.setUserId(body.getUserId());
        membership.setRole(body.getRole() != null ? body.getRole() : "EDITOR");
        membership.setCreatedTime(DateUtil.formatLocalDateTime(LocalDateTime.now()));
        workspaceMembershipService.save(membership);

        return success();
    }

    @ApiOperation(value = "Create user and add to workspace", notes = "Create a new user and add to workspace")
    @PostMapping("/workspaces/{workspaceId}/create-user")
    @ResponseBody
    public AjaxResult createUserAndAddMember(@PathVariable("workspaceId") String workspaceId, @RequestBody SysUser body) {
        String currentUserId = SaTokenUtil.getUserId();
        workspaceMembershipService.assertRoleAtLeast(workspaceId, currentUserId, "ADMIN");

        subscriptionService.assertCanAddMember(workspaceId);

        if (body.getUsername() == null || body.getUsername().trim().isEmpty()) {
            return error(400, "Username is required");
        }
        if (body.getPassword() == null || body.getPassword().trim().isEmpty()) {
            return error(400, "Password is required");
        }

        // Check if user already exists
        SysUser existing = sysUserService.lambdaQuery()
                .eq(SysUser::getUsername, body.getUsername().trim())
                .last("LIMIT 1")
                .one();

        SysUser userToUse;
        if (existing != null) {
            userToUse = existing;
        } else {
            SysUser newUser = new SysUser();
            newUser.setUsername(body.getUsername().trim());
            newUser.setPassword(SecureUtil.md5(body.getPassword().trim()));
            newUser.setNickname(body.getNickname());
            newUser.setDepId(0);
            sysUserService.save(newUser);
            userToUse = newUser;
        }

        // Add membership (idempotent-ish: only create if not already a member)
        WorkspaceMembership existingMembership = workspaceMembershipService.lambdaQuery()
                .eq(WorkspaceMembership::getWorkspaceId, workspaceId)
                .eq(WorkspaceMembership::getUserId, userToUse.getId())
                .last("LIMIT 1")
                .one();
        if (existingMembership == null) {
            WorkspaceMembership membership = new WorkspaceMembership();
            membership.setWorkspaceId(workspaceId);
            membership.setUserId(userToUse.getId());
            membership.setRole("EDITOR");
            membership.setCreatedTime(DateUtil.formatLocalDateTime(LocalDateTime.now()));
            workspaceMembershipService.save(membership);
        }

        return successData(200, userToUse);
    }
}

