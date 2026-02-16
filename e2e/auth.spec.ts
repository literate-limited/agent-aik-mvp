import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('shows login page', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Welcome Back')).toBeVisible()
    await expect(page.getByText('Sign In')).toBeVisible()
  })

  test('shows register page', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Create Account')).toBeVisible()
  })

  test('login form validates required fields', async ({ page }) => {
    await page.goto('/login')
    await page.getByRole('button', { name: 'Sign In' }).click()
    // HTML5 validation should prevent submission
  })

  test('register form validates required fields', async ({ page }) => {
    await page.goto('/register')
    await page.getByRole('button', { name: 'Create Account' }).click()
    // HTML5 validation should prevent submission
  })

  test('landing page has links to auth', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Agent Aik')).toBeVisible()
    await expect(page.getByText('Get Started Free')).toBeVisible()
    await expect(page.getByText('Sign In')).toBeVisible()
  })

  test('redirects unauthenticated users from dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await page.waitForURL('**/login**')
  })
})
