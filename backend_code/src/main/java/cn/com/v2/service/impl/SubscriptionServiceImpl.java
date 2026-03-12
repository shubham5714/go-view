package cn.com.v2.service.impl;

import cn.com.v2.mapper.GoviewProjectMapper;
import cn.com.v2.mapper.PlanMapper;
import cn.com.v2.mapper.SubscriptionMapper;
import cn.com.v2.mapper.WorkspaceMapper;
import cn.com.v2.mapper.WorkspaceMembershipMapper;
import cn.com.v2.model.GoviewProject;
import cn.com.v2.model.Plan;
import cn.com.v2.model.Subscription;
import cn.com.v2.model.Workspace;
import cn.com.v2.model.WorkspaceMembership;
import cn.com.v2.service.ISubscriptionService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SubscriptionServiceImpl extends ServiceImpl<SubscriptionMapper, Subscription> implements ISubscriptionService {

    @Autowired
    private PlanMapper planMapper;

    @Autowired
    private WorkspaceMapper workspaceMapper;

    @Autowired
    private WorkspaceMembershipMapper workspaceMembershipMapper;

    @Autowired
    private GoviewProjectMapper goviewProjectMapper;

    @Override
    public Subscription getActiveSubscription(String accountId) {
        LambdaQueryWrapper<Subscription> wrapper = new LambdaQueryWrapper<Subscription>()
                .eq(Subscription::getAccountId, accountId)
                .eq(Subscription::getStatus, "ACTIVE")
                .last("LIMIT 1");
        return getOne(wrapper);
    }

    @Override
    public void assertCanCreateWorkspace(String accountId) {
        Subscription subscription = getActiveSubscription(accountId);
        if (subscription == null) {
            return;
        }
        Plan plan = planMapper.selectById(subscription.getPlanId());
        if (plan == null || plan.getMaxWorkspaces() == null) {
            return;
        }
        Integer count = workspaceMapper.selectCount(
                new LambdaQueryWrapper<Workspace>().eq(Workspace::getAccountId, accountId)
        );
        if (count != null && count >= plan.getMaxWorkspaces()) {
            throw new RuntimeException("工作空间数量已达到当前套餐上限");
        }
    }

    @Override
    public void assertCanAddMember(String workspaceId) {
        Workspace workspace = workspaceMapper.selectById(workspaceId);
        if (workspace == null) {
            throw new RuntimeException("工作空间不存在");
        }
        Subscription subscription = getActiveSubscription(workspace.getAccountId());
        if (subscription == null) {
            return;
        }
        Plan plan = planMapper.selectById(subscription.getPlanId());
        if (plan == null || plan.getMaxUsersPerWorkspace() == null) {
            return;
        }
        Integer count = workspaceMembershipMapper.selectCount(
                new LambdaQueryWrapper<WorkspaceMembership>().eq(WorkspaceMembership::getWorkspaceId, workspaceId)
        );
        if (count != null && count >= plan.getMaxUsersPerWorkspace()) {
            throw new RuntimeException("成员数量已达到当前套餐上限");
        }
    }

    @Override
    public void assertCanCreateProject(String workspaceId) {
        Workspace workspace = workspaceMapper.selectById(workspaceId);
        if (workspace == null) {
            throw new RuntimeException("工作空间不存在");
        }
        Subscription subscription = getActiveSubscription(workspace.getAccountId());
        if (subscription == null) {
            return;
        }
        Plan plan = planMapper.selectById(subscription.getPlanId());
        if (plan == null || plan.getMaxProjectsPerWorkspace() == null) {
            return;
        }
        Integer count = goviewProjectMapper.selectCount(
                new LambdaQueryWrapper<GoviewProject>().eq(GoviewProject::getWorkspaceId, workspaceId)
        );
        if (count != null && count >= plan.getMaxProjectsPerWorkspace()) {
            throw new RuntimeException("项目数量已达到当前套餐上限");
        }
    }

    @Override
    public boolean isWorkspaceLocked(String workspaceId) {
        Workspace workspace = workspaceMapper.selectById(workspaceId);
        if (workspace == null) {
            return false;
        }
        Subscription subscription = getActiveSubscription(workspace.getAccountId());
        if (subscription == null) {
            // No subscription -> no enforced limits / no locking
            return false;
        }
        Plan plan = planMapper.selectById(subscription.getPlanId());
        if (plan == null || plan.getMaxWorkspaces() == null) {
            return false;
        }
        Integer max = plan.getMaxWorkspaces();
        if (max == null || max <= 0) {
            return false;
        }
        // Order all workspaces for this account by creation time (oldest first)
        java.util.List<Workspace> all = workspaceMapper.selectList(
                new LambdaQueryWrapper<Workspace>()
                        .eq(Workspace::getAccountId, workspace.getAccountId())
                        .orderByAsc(Workspace::getCreatedTime)
        );
        for (int i = 0; i < all.size(); i++) {
            Workspace w = all.get(i);
            if (w.getId().equals(workspaceId)) {
                // Oldest "max" workspaces are unlocked, newer ones are locked
                return i >= max;
            }
        }
        return false;
    }

    @Override
    public boolean isProjectLocked(String projectId) {
        GoviewProject project = goviewProjectMapper.selectById(projectId);
        if (project == null) {
            return false;
        }
        Workspace workspace = workspaceMapper.selectById(project.getWorkspaceId());
        if (workspace == null) {
            return false;
        }
        Subscription subscription = getActiveSubscription(workspace.getAccountId());
        if (subscription == null) {
            return false;
        }
        Plan plan = planMapper.selectById(subscription.getPlanId());
        if (plan == null || plan.getMaxProjectsPerWorkspace() == null) {
            return false;
        }
        Integer max = plan.getMaxProjectsPerWorkspace();
        if (max == null || max <= 0) {
            return false;
        }
        // Order all projects in this workspace by creation time (oldest first)
        java.util.List<GoviewProject> all = goviewProjectMapper.selectList(
                new LambdaQueryWrapper<GoviewProject>()
                        .eq(GoviewProject::getWorkspaceId, project.getWorkspaceId())
                        .orderByAsc(GoviewProject::getCreateTime)
        );
        for (int i = 0; i < all.size(); i++) {
            GoviewProject p = all.get(i);
            if (p.getId().equals(projectId)) {
                // Oldest "max" projects stay unlocked; newer ones are locked
                return i >= max;
            }
        }
        return false;
    }
}

