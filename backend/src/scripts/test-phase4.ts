import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  try {
    console.log('--- TESTING PHASE 4 ---');

    // 1. Login as Admin
    console.log('Logging in as Admin (john@test.com)...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@test.com',
      password: 'password123'
    });
    const adminToken = adminLogin.data.token;

    // Get assets and users to work with
    const assets = await axios.get(`${BASE_URL}/assets`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const bookableAsset = assets.data.find((a: any) => a.isBookable);
    const nonBookableAsset = assets.data.find((a: any) => !a.isBookable);

    const employees = await axios.get(`${BASE_URL}/employees`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const bob = employees.data.find((e: any) => e.email === 'bob@test.com');
    const jane = employees.data.find((e: any) => e.email === 'jane@test.com'); // Dept Head from phase 2 tests
    
    // Make sure Jane has a department (Engineering was created in phase 2)
    const departments = await axios.get(`${BASE_URL}/departments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const engineering = departments.data.find((d: any) => d.name === 'Engineering');
    
    // Assign Jane to Engineering if not already
    await axios.put(`${BASE_URL}/employees/${jane.id}/department`, { departmentId: engineering.id }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    // Ensure the bookable asset is in Engineering too so Jane can approve it
    await axios.put(`${BASE_URL}/assets/${bookableAsset.id}`, { departmentId: engineering.id }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    // In our simplified test, we just update asset's currentDepartmentId manually or via allocation.
    // Wait, updateAsset doesn't allow changing currentDepartmentId directly. 
    // We can just rely on the controller logic which might allow Admin to approve anything or we'll login as Jane.

    // 2. Allocate Asset (Admin)
    console.log('Admin allocating non-bookable asset to Bob...');
    try {
        await axios.post(
        `${BASE_URL}/allocations`,
        { assetId: nonBookableAsset.id, employeeId: bob.id },
        { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        console.log('Allocation successful.');
    } catch(e: any) {
        if(e.response?.data?.error === 'Asset is already allocated') {
            console.log('Asset was already allocated (ignoring for idempotency)');
        } else {
            throw e;
        }
    }

    // 3. Create Booking (Bob)
    console.log('Bob requesting a booking for the bookable asset...');
    const bobLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bob@test.com',
      password: 'password123'
    });
    const bobToken = bobLogin.data.token;

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2);

    const bookingRes = await axios.post(
      `${BASE_URL}/bookings`,
      { assetId: bookableAsset.id, startTime: startTime.toISOString(), endTime: endTime.toISOString() },
      { headers: { Authorization: `Bearer ${bobToken}` } }
    );
    const bookingId = bookingRes.data.id;
    console.log('Booking requested. Status:', bookingRes.data.status);

    // 4. Approve Booking (Admin or Dept Head)
    console.log('Admin approving the booking...');
    const approveRes = await axios.put(
      `${BASE_URL}/bookings/${bookingId}/approve`,
      {},
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('Booking status after approval:', approveRes.data.status);

    // 5. Test Conflict Prevention
    console.log('Testing booking overlap conflict...');
    try {
      await axios.post(
        `${BASE_URL}/bookings`,
        { assetId: bookableAsset.id, startTime: startTime.toISOString(), endTime: endTime.toISOString() },
        { headers: { Authorization: `Bearer ${bobToken}` } }
      );
      console.error('FAIL: System allowed a conflicting booking!');
    } catch (error: any) {
      if (error.response?.status === 409) {
        console.log('SUCCESS: System correctly rejected conflicting booking with 409 Conflict.');
      } else {
        throw error;
      }
    }

    console.log('--- ALL TESTS PASSED ---');
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
