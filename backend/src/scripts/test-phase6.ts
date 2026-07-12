import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  try {
    console.log('--- TESTING PHASE 6 (Dashboard & Notifications) ---');

    // 1. Login as Admin
    console.log('Logging in as Admin (john@test.com)...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@test.com',
      password: 'password123'
    });
    const adminToken = adminLogin.data.token;

    // Login as Bob (Employee)
    console.log('Logging in as Employee (bob@test.com)...');
    const bobLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bob@test.com',
      password: 'password123'
    });
    const bobToken = bobLogin.data.token;

    // Get assets
    const assets = await axios.get(`${BASE_URL}/assets`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const nonBookableAsset = assets.data.find((a: any) => !a.isBookable);
    
    // We already have some allocations/maintenance/bookings from previous tests, let's just trigger one more to ensure notifications generate.
    // However, if it's already allocated to Bob, let's return it and reallocate.
    console.log('Returning asset to test allocation notification...');
    const allocations = await axios.get(`${BASE_URL}/allocations`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const activeAlloc = allocations.data.find((a: any) => a.assetId === nonBookableAsset.id && a.status === 'Active');
    
    if (activeAlloc) {
      await axios.post(
        `${BASE_URL}/allocations/${activeAlloc.id}/return`,
        {},
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
    }

    console.log('Allocating asset to Bob to trigger notification...');
    await axios.post(
      `${BASE_URL}/allocations`,
      { assetId: nonBookableAsset.id, employeeId: bobLogin.data.user.id },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    // ==========================================
    // DASHBOARD WORKFLOW
    // ==========================================
    console.log('\n--- Dashboard Workflow ---');
    const dashboardRes = await axios.get(`${BASE_URL}/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Dashboard KPIs:', dashboardRes.data);
    
    if (typeof dashboardRes.data.assetsAvailable !== 'number') {
      throw new Error('Dashboard API missing expected KPIs');
    }

    // ==========================================
    // NOTIFICATIONS WORKFLOW
    // ==========================================
    console.log('\n--- Notifications Workflow ---');
    console.log('Fetching notifications for Bob...');
    const notifRes = await axios.get(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${bobToken}` }
    });
    
    console.log(`Bob has ${notifRes.data.length} notifications.`);
    const unread = notifRes.data.find((n: any) => !n.isRead && n.type === 'Asset Assigned');
    
    if (!unread) {
      throw new Error('Expected an unread "Asset Assigned" notification for Bob!');
    }

    console.log('Marking notification as read...');
    await axios.put(`${BASE_URL}/notifications/${unread.id}/read`, {}, {
      headers: { Authorization: `Bearer ${bobToken}` }
    });
    console.log('SUCCESS: Notification marked as read.');

    // ==========================================
    // ACTIVITY LOG WORKFLOW
    // ==========================================
    console.log('\n--- Activity Log Workflow ---');
    console.log('Fetching activity logs (Admin only)...');
    const logsRes = await axios.get(`${BASE_URL}/notifications/logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log(`Found ${logsRes.data.length} activity logs.`);
    const recentLog = logsRes.data.find((l: any) => l.action === 'asset.allocated');
    if (!recentLog) {
      throw new Error('Expected an "asset.allocated" activity log!');
    }
    console.log('SUCCESS: Activity logs are tracking successfully.');

    console.log('\n--- ALL TESTS PASSED ---');
  } catch (error: any) {
    console.error('Test script failed:');
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message || error);
    }
  }
}

runTests();
