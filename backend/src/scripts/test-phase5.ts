import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  try {
    console.log('--- TESTING PHASE 5 ---');

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
    const asset1 = assets.data[0];
    const asset2 = assets.data[1];

    // ==========================================
    // MAINTENANCE WORKFLOW
    // ==========================================
    console.log('\n--- Maintenance Workflow ---');
    console.log('Employee raising maintenance request for', asset1.assetTag);
    const maintenanceRes = await axios.post(
      `${BASE_URL}/maintenance`,
      { assetId: asset1.id, issueDescription: 'Screen is cracked', priority: 'High' },
      { headers: { Authorization: `Bearer ${bobToken}` } }
    );
    const maintenanceId = maintenanceRes.data.id;
    console.log('Maintenance raised. Status:', maintenanceRes.data.status);

    console.log('Admin approving maintenance...');
    const approveRes = await axios.put(
      `${BASE_URL}/maintenance/${maintenanceId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('Maintenance Status:', approveRes.data.status);

    // Verify Asset status is In Maintenance
    const updatedAsset = await axios.get(`${BASE_URL}/assets/${asset1.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Asset status after approval:', updatedAsset.data.status);
    if (updatedAsset.data.status !== 'In Maintenance') {
      throw new Error('Asset status did not change to In Maintenance');
    }

    // ==========================================
    // AUDIT WORKFLOW
    // ==========================================
    console.log('\n--- Audit Workflow ---');
    console.log('Admin starting an audit cycle...');
    const auditRes = await axios.post(
      `${BASE_URL}/audits`,
      { name: 'End of Year Audit', startDate: new Date().toISOString(), endDate: new Date().toISOString() },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const auditId = auditRes.data.id;
    console.log('Audit started. ID:', auditId);

    console.log('Simulating scan upload (Scanning ONLY one asset, leaving the other one Missing)...');
    const scanRes = await axios.post(
      `${BASE_URL}/audits/${auditId}/scan`,
      { assetTags: [asset1.assetTag] }, // Scanning only asset1, so asset2 should be missing
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log(scanRes.data.message, `Processed: ${scanRes.data.itemsProcessed}`);

    console.log('Closing audit...');
    await axios.put(
      `${BASE_URL}/audits/${auditId}/close`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );

    // Verify Audit Items
    const allAudits = await axios.get(`${BASE_URL}/audits`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const latestAudit = allAudits.data.find((a: any) => a.id === auditId);
    
    const verifiedItem = latestAudit.auditItems.find((i: any) => i.assetId === asset1.id);
    const missingItem = latestAudit.auditItems.find((i: any) => i.assetId === asset2.id);

    if (verifiedItem.result === 'Verified' && missingItem.result === 'Missing') {
      console.log('SUCCESS: System correctly marked the scanned item as Verified and the unscanned item as Missing.');
    } else {
      throw new Error('Audit verification logic failed.');
    }

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
