package cn.com.v2.service;

import cn.com.v2.model.Subscription;
import com.baomidou.mybatisplus.extension.service.IService;

public interface ISubscriptionService extends IService<Subscription> {

    Subscription getActiveSubscription(String accountId);

    void assertCanCreateWorkspace(String accountId);

    void assertCanAddMember(String workspaceId);

    void assertCanCreateProject(String workspaceId);
}

