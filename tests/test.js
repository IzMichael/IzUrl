import { expect, test } from '@playwright/test';

test('Root URL redirects to izmichael.com', async ({ page }) => {
    await page.goto('/');
    expect(await page.textContent('h1')).toContain('Hey! I\'m IzMichael!');
    page.close();
});

test('/me redirects to izmichael.com', async ({ page }) => {
    await page.goto('/me');
    expect(await page.textContent('h1')).toContain('Hey! I\'m IzMichael!');
    page.close();
});

test('/app shows a login page', async ({ page }) => {
    await page.goto('/me');
    expect(await page.textContent('button')).toContain('Log In');
    page.close();
});
