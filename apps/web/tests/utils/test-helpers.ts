import { Page } from '@playwright/test';

export class TestHelpers {
  constructor(private page: Page) { }

  async mockAuthentication(user: {
    id: string;
    email: string;
    username: string;
    role: 'ADMIN' | 'USER';
  }) {
    await this.page.route('**/auth/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ...user,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        })
      });
    });
  }

  async mockTasks(tasks: any[] = []) {
    await this.page.route('**/tasks**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: tasks,
          total: tasks.length,
          page: 1,
          size: 10,
          totalPages: Math.ceil(tasks.length / 10)
        })
      });
    });
  }

  async mockNotifications(notifications: any[] = []) {
    await this.page.route('**/notifications**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: notifications,
          total: notifications.length,
          page: 1,
          size: 10,
          totalPages: Math.ceil(notifications.length / 10)
        })
      });
    });
  }

  async mockDashboardData(data: any = {}) {
    await this.page.route('**/auth/overview', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          totalUsers: 10,
          totalTasks: 25,
          completedTasks: 15,
          pendingTasks: 10,
          systemStatus: 'healthy',
          recentActivity: [],
          ...data
        })
      });
    });
  }

  async mockUserStats(users: any[] = []) {
    await this.page.route('**/auth/users/stats', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(users)
      });
    });
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async login(email: string, password: string = 'Password123') {
    await this.page.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
  }

  async logout() {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('text=Logout');
  }

  async createTask(task: {
    title: string;
    description: string;
    priority: string;
    dueDate: string;
  }) {
    await this.page.click('button:has-text("Create Task")');
    await this.page.fill('input[placeholder*="title" i]', task.title);
    await this.page.fill('textarea[placeholder*="description" i]', task.description);
    await this.page.selectOption('select[name="priority"]', task.priority);
    await this.page.fill('input[type="date"]', task.dueDate);
    await this.page.click('button[type="submit"]');
  }

  async searchTasks(query: string) {
    await this.page.fill('input[placeholder*="search" i]', query);
  }

  async filterTasksByStatus(status: string) {
    await this.page.selectOption('select[name="status"]', status);
  }

  async filterTasksByPriority(priority: string) {
    await this.page.selectOption('select[name="priority"]', priority);
  }
}
